<script setup lang="ts">
import { defineEmits, defineExpose, defineProps, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAlbumStore } from '@/stores/album'
import ExifReader from 'exifreader'
import { Plus } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadInstance, UploadRequestHandler } from 'element-plus'
import { ElMessage } from 'element-plus'
import ImgPreviewer from '@/components/preview/ImgPreviewer.vue'
import { dto_GetPresignedURLReq, Service } from '../../../generated'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax'
import { compressImage } from '@/utils/FileUtils'
import VideoPreviewer from '@/components/preview/VideoPreviewer.vue'
import { getMetadata } from 'video-metadata-thumbnails'
import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload'
import { generateUUID } from '@/utils/CosUtils'

const albumStore = useAlbumStore()

const props = defineProps({
  modelValue: Boolean,
  isCompress: Boolean
})

let $emit = defineEmits(['update:modelValue', 'onUpdate'])

const selectedImages = ref<number[]>([])

interface AlbumImage {
  id: number
  url: string
  is_raw: boolean
  size?: number
  meta?: ImageInfo | VideoInfo
}

const imgList = ref<AlbumImage[]>([])
const loading = ref(false)
const cursor = ref('')
const isLast = ref(false)
const filterParams = ref<{
  type?: number
  isRaw?: boolean
}>({ type: undefined, isRaw: false })
const pageSize = 20

const uploadingCount = ref(0)
const totalUploadCount = ref(0)

// 用于存储压缩后文件大小的 Map
const compressedFileSizes = new Map<number, number>()

// 添加一个压缩队列类
class CompressionQueue {
  private queue: Array<{
    file: File
    resolve: (file: File) => void
    reject: (error: any) => void
  }> = []
  private processing = 0
  private readonly maxConcurrent = 5

  async add(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      this.queue.push({ file, resolve, reject })
      this.processNext()
    })
  }

  private async processNext() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.processing++
    console.log(
      '压缩队列中还有',
      this.queue.length,
      '个文件等待压缩, 正在处理中：',
      this.processing
    )
    const { file, resolve, reject } = this.queue.shift()!

    try {
      const compressedFile = await compressImage(file)
      resolve(compressedFile)
    } catch (error) {
      reject(error)
    } finally {
      this.processing--
      this.processNext()
    }
  }
}

// 创建压缩队列实例
const compressionQueue = new CompressionQueue()

// 重置并刷新列表的方法
const resetAndRefresh = (params: { type?: number; isRaw?: boolean }) => {
  filterParams.value = params
  imgList.value = []
  cursor.value = ''
  isLast.value = false
  getImgList()
}

// 获取图片列表
const getImgList = async () => {
  if (loading.value || isLast.value) return

  loading.value = true
  try {
    const res = await Service.postAlbumMediaList({
      album_id: albumStore.currentAlbumId,
      cursor: cursor.value,
      pageSize: pageSize,
      type: filterParams.value.type,
      is_raw: filterParams.value.isRaw
    })

    if (res.code === 0) {
      const newImages = res.data.data.map((item: any) => ({
        id: item.id,
        url: item.url,
        is_raw: item.is_raw,
        meta: item.meta
      }))
      imgList.value.push(...newImages)

      cursor.value = res.data.cursor
      isLast.value = res.data.isLast
    } else {
      ElMessage.error('获取图片列表失败:' + res.msg)
    }
  } catch (error) {
    console.error('获取图片列表失败:', error)
    ElMessage.error('获取图片列表失败')
  } finally {
    loading.value = false
  }
}

// 监听滚到底部
const handleScroll = (e: Event) => {
  console.log('handleScroll')
  const target = e.target as HTMLElement
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
    console.log('scroll to bottom')
    getImgList()
  }
}

// 监听相册ID变化,重新加载图片列表
watch(
  () => albumStore.currentAlbumId,
  (newId) => {
    if (newId) {
      imgList.value = [] // 清空原有列表
      cursor.value = '' // 重置游标
      isLast.value = false // 重置结束标志
      getImgList() // 重新加载
    }
  }
)

onMounted(() => {
  if (albumStore.currentAlbumId) {
    getImgList()
  }
})

const toggleEdit = () => {
  $emit('update:modelValue', !props.modelValue)
  selectedImages.value = [] // 退出编辑模式时清空选中状态
}

const toggleSelection = (imageId: number) => {
  if (selectedImages.value.includes(imageId)) {
    selectedImages.value = selectedImages.value.filter((id) => id !== imageId)
  } else {
    selectedImages.value.push(imageId)
  }
}

const deleteSelectedImages = async () => {
  try {
    // 先获取要删除的图片 URL
    const urlsToDelete = imgList.value
      .filter((img) => selectedImages.value.includes(img.id))
      .map((img) => img.url)

    // 调用后端删除图片记录
    const res = await Service.deleteAlbumMedia(selectedImages.value.join(','))

    if (res.code === 0) {
      // 删除成功后，删除 COS 上的文件
      try {
        await Service.postCosBatchDelete({
          keys: urlsToDelete
        })
      } catch (error) {
        console.error('删除 COS 文件失败:', error)
        // TODO 即使 COS 删除失败，也不影响用户体验，只在控制台打印错误 后续再考虑更优的解决方案
      }

      // 从列表中移除已删除的图片
      imgList.value = imgList.value.filter((img) => !selectedImages.value.includes(img.id))
      selectedImages.value = []
      ElMessage.success('删除成功')
      $emit('onUpdate') // 触发更新事件
    } else {
      ElMessage.error('删除失败:' + res.msg)
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除失败')
  }
}

//组件内部数据对外关闭的，别人不能访问
//如果想让外部访问需要通过defineExpose方法对外暴露
defineExpose({
  deleteSelectedImages,
  toggleEdit,
  resetAndRefresh
})

type ImageInfo = {
  // 拍摄时间
  takeTime: String | null
  // 相机品牌
  make: String | null
  // 相机型号
  model: String | null
  // 位置信息 纬度
  latitude: String | null
  // 位置信息 经度
  longitude: String | null
  // 地址（由后端通过经纬度转换）
  address: String | null
  // ISO
  iso: String | null
  // 光圈
  fNumber: String | null
  // 快门速度
  exposureTime: String | null
  // 焦距
  focalLength: String | null
}

type VideoInfo = {
  // 拍摄时间
  takeTime: String | null
  // 视频时长（秒）
  duration: number | null
  // 分辨率
  resolution: String | null
  // 编码
  codec: String | null
  // 比特率
  bitrate: number | null
  // 帧率
  fps: number | null
  // 新增位置字段
  latitude: String | null
  longitude: String | null
  // 地址（由后端通过经纬度转换）
  address: String | null
}

// 添加格式化时间的辅助函数
const formatExifDateTime = (dateTimeStr: string | undefined): string | null => {
  if (!dateTimeStr) return null
  // 将 2023:03:12 19:09:22 转换为 2023-03-12 19:09:22
  return dateTimeStr.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
}

// 修改 getExifInfo 函数中的时间处理
const getExifInfo = async (file: File): Promise<ImageInfo | undefined> => {
  try {
    const tags = await ExifReader.load(file)

    // 获取并格式化拍摄时间
    const originalTime = tags['DateTimeOriginal']?.description || tags['DateTime']?.description
    const takeTime = formatExifDateTime(originalTime)

    // 获取相机信息
    const make = tags['Make']?.description
    const model = tags['Model']?.description

    // 获取GPS信息
    const gpsLatitude = tags['GPSLatitude']?.description
    const gpsLongitude = tags['GPSLongitude']?.description
    const gpsLatitudeRef = Array.isArray(tags['GPSLatitudeRef']?.value)
      ? tags['GPSLatitudeRef'].value[0]
      : typeof tags['GPSLatitudeRef']?.value === 'string'
        ? tags['GPSLatitudeRef'].value
        : null
    const gpsLongitudeRef = Array.isArray(tags['GPSLongitudeRef']?.value)
      ? tags['GPSLongitudeRef'].value[0]
      : typeof tags['GPSLongitudeRef']?.value === 'string'
        ? tags['GPSLongitudeRef'].value
        : null

    // 转换GPS坐标
    let latitude = null
    let longitude = null
    if (gpsLatitude && gpsLatitudeRef) {
      latitude = gpsLatitudeRef === 'N' ? gpsLatitude : -gpsLatitude
    }
    if (gpsLongitude && gpsLongitudeRef) {
      longitude = gpsLongitudeRef === 'E' ? gpsLongitude : -gpsLongitude
    }

    // 构造统一的 MediaInfo 对象
    const mediaInfo: ImageInfo = {
      takeTime: takeTime,
      make: make || null,
      model: model || null,
      latitude: latitude?.toString() || null,
      longitude: longitude?.toString() || null,
      iso: tags['ISOSpeedRatings']?.description || null,
      fNumber: tags['FNumber']?.description || null,
      exposureTime: tags['ExposureTime']?.description || null,
      focalLength: tags['FocalLength']?.description || null,
      address: null
    }

    // console.log('图片 EXIF 信息：', mediaInfo)
    return mediaInfo
  } catch (error) {
    console.error('读取 EXIF 信息失败:', error)
    return
  }
}

// 修改 getVideoInfo 函数中的时间处理
const getVideoInfo = async (file: File): Promise<VideoInfo | undefined> => {
  try {
    const metadata = await getMetadata(file)
    // const creationTime = metadata.creationTime || metadata.modificationTime

    // 从元数据中获取位置信息
    // const latitude = metadata.location?.latitude?.toString() || null
    // const longitude = metadata.location?.longitude?.toString() || null

    const videoInfo: VideoInfo = {
      takeTime: null,
      duration: metadata.duration || null,
      resolution: metadata.width && metadata.height ? `${metadata.width}x${metadata.height}` : null,
      codec: null,
      bitrate: null,
      fps: null,
      // 添加位置信息
      latitude: null,
      longitude: null,
      address: null
    }

    return videoInfo
  } catch (error) {
    console.error('读取视频信息失败:', error)
    return
  }
}

// 修改 ajaxUpload 函数
const ajaxUpload: UploadRequestHandler = async (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')
  const file = option.file
  const isVideo = file.type.startsWith('video/')

  // 单个媒体不能大于 60 MB
  if (sizeInMB > 60) {
    ElMessage.error('单个媒体不能大于 60 MB')
    return Promise.reject()
  }

  try {
    if (!isVideo && props.isCompress && sizeInMB > 0.5) {
      // 只对图片进行压缩
      const compressedFile = await compressionQueue.add(file)
      console.log('压缩后：', (compressedFile.size / (1024 * 1024)).toFixed(2) + ' MB')

      // 存储压缩后的文件大小
      compressedFileSizes.set(option.file.uid, compressedFile.size)

      // 创建一个新对象，包含压缩后的文件和原始文件的 uid
      const uploadFileObj = new File([compressedFile], compressedFile.name, {
        type: compressedFile.type
      }) as UploadRawFile
      uploadFileObj.uid = option.file.uid
      option.file = uploadFileObj
      await uploadFile(option)
    } else {
      // 视频或不需要压缩的图片直接上传
      option.file = file
      await uploadFile(option)
    }
  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error('文件处理失败，请重试')
    return Promise.reject(error)
  }

  return new Promise(() => {})
}

const uploadFile = async (option: any) => {
  // 文件后缀
  const suffix = option.file.name.slice(option.file.name.lastIndexOf('.'))
  const fileKey = import.meta.env.VITE_COS_PATH_PREFIX + 'ablum/' + generateUUID() + suffix

  try {
    const res = await Service.postCosPresignedUrl({
      type: dto_GetPresignedURLReq.type.UPLOAD,
      key: fileKey
    })

    if (res.code !== 0) {
      throw new Error('获取上传 URL 失败')
    }

    // 使用 XMLHttpRequest 上传文件以支持进度监控
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          option.onProgress({ percent })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response)
        } else {
          reject(new Error(`上传失败: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('上传失败'))
      })

      xhr.open('PUT', res.data.url)
      xhr.setRequestHeader('Content-Type', option.file.type)
      xhr.send(option.file)
    })

    // 获取带签名下载 URL
    const res1 = await Service.postCosPresignedUrl({
      key: fileKey,
      type: dto_GetPresignedURLReq.type.DOWNLOAD
    })

    if (res1.code !== 0) {
      throw new Error(res1.msg || '获取访问地址失败')
    }

    const downloadUrl = res1.data.url
    option.onSuccess(downloadUrl)
  } catch (error: any) {
    console.error('上传失败:', error)
    option.onError(
      new UploadAjaxError(error.message, error?.statusCode ?? 0, error.method, error.url)
    )
  }
}

const handleSuccess = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  uploadFile.url = response

  // 如果是新的上传批次，重置计数器
  if (uploadingCount.value === 0) {
    totalUploadCount.value = uploadFiles.length - totalUploadCount.value
  }
  uploadingCount.value++

  try {
    // 根据文件类型读取不同的元数据信息
    let metadata: ImageInfo | VideoInfo | undefined
    if (uploadFile?.raw) {
      if (uploadFile.raw.type?.startsWith('video/')) {
        metadata = await getVideoInfo(uploadFile.raw)
      } else {
        metadata = await getExifInfo(uploadFile.raw)
      }
    }
    console.log('元数据信息：', metadata)

    // 获文件大小(如果有压缩则使用压缩后的大小)
    const fileSize = compressedFileSizes.get(uploadFile.uid) || uploadFile.size || 0
    const sizeInMB = Number((fileSize / (1024 * 1024)).toFixed(2))

    // 清理已使用的压缩信息
    compressedFileSizes.delete(uploadFile.uid)

    // 调用后端接口保存图片地址
    const res = await Service.postAlbumMedia({
      album_id: albumStore.currentAlbumId,
      medias: [
        {
          url: response,
          is_raw: isVideo(response) ? true : !props.isCompress,
          size: sizeInMB, // 存储转换后的 MB 大小
          meta: metadata as any // 存储元数据信息
        }
      ]
    })

    if (res.code === 0) {
      // 将图片地址添加到图片列表前面
      imgList.value.unshift({
        id: res.data[response],
        url: response,
        is_raw: isVideo(response) ? true : !props.isCompress,
        size: sizeInMB, // 存储转换后的 MB 大小
        meta: metadata
      })
      // 只在所有图片都上传完成时显示成功消息
      if (uploadingCount.value === totalUploadCount.value) {
        ElMessage.success(`${totalUploadCount.value} 个媒体添加成功`)
        uploadingCount.value = 0 // 重置计数器
        clearUploadFiles() // 清空上传列表
        $emit('onUpdate') // 触发更新事件
      }
    } else {
      // 保存失败,删除 COS 上的图片
      await Service.postCosBatchDelete({
        keys: [response],
      })
      ElMessage.error('保存图片失败:' + res.msg)
      uploadingCount.value = 0 // 重置计数器
    }
  } catch (error) {
    // 发生异常,删除 COS 上的图片
    await Service.postCosBatchDelete({
      keys: [response],
    })
    ElMessage.error('保存图片失败')
    uploadingCount.value = 0 // 重置计数器
  }
}

const handleExceed = (files: File[]) => {
  ElMessage.warning('一次最多只能上传 50 张图片')
}

const uploadRef = ref<UploadInstance>()

// 清空文件列表
const clearUploadFiles = () => {
  uploadRef.value?.clearFiles()
}

// 添加判断文件类型的函数
const isVideo = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  // 移除 URL 参数
  const urlWithoutParams = url.split('?')[0]
  return videoExtensions.some((ext) => urlWithoutParams.toLowerCase().endsWith(ext))
}

interface PreviewerRef {
  isPreviewVisible: boolean
}

// 使用 Map 来存储 refs
const previewerRefs = ref(new Map<number, boolean>())

onBeforeUnmount(() => {
  previewerRefs.value.clear()
})
</script>

<template>
  <div id="photoItemId" style="overflow: scroll; height: 100%" @scroll="handleScroll">
    <!--    <button v-if="isEditing" @click="deleteSelectedImages">删除选中图片</button>-->
    <el-upload
      ref="uploadRef"
      class="upload-demo"
      :http-request="ajaxUpload"
      :on-success="handleSuccess"
      multiple
      :show-file-list="false"
      :limit="50"
      :on-exceed="handleExceed"
      :accept="'.jpg,.jpeg,.png,.gif,.mp4,.webm,.ogg,.mov,.heic,.HEIC'"
    >
      <div class="photo-upload-btn" v-if="props.modelValue">
        <Plus class="photo-upload-btn-icon" />
        <span class="upload-tip">最多 50 张</span>
      </div>
    </el-upload>

    <div class="photo-item">
      <template v-for="(img, index) in imgList" :key="img.id">
        <!-- 当有 meta 数据时才显示 popover -->
        <template v-if="img.meta && Object.keys(img.meta).length > 0">
          <el-popover
            placement="top"
            :width="300"
            trigger="hover"
            popper-class="media-info-popover"
            :show-after="100"
            :hide-after="100"
            :disabled="previewerRefs.get(img.id)"
          >
            <template #reference>
              <template v-if="!isVideo(img.url)">
                <ImgPreviewer
                  :ref="
                    (el) => {
                      if (el) {
                        const component = el as any
                        if ('isPreviewVisible' in component) {
                          previewerRefs.set(img.id, component.isPreviewVisible)
                        }
                      }
                    }
                  "
                  :src="img.url"
                  :preview-src-list="
                    imgList.filter((item) => !isVideo(item.url)).map((item) => item.url)
                  "
                  :initial-index="
                    imgList.filter((item, idx) => !isVideo(item.url) && idx <= index).length - 1
                  "
                  :is-editing="props.modelValue"
                  :class="{ selected: selectedImages.includes(img.id) }"
                  :style="{
                    width: 'clamp(150px, 12vw, 220px)',
                    height: 'auto',
                    margin: '10px'
                  }"
                  @select="toggleSelection(img.id)"
                />
              </template>
              <template v-else>
                <VideoPreviewer
                  :ref="
                    (el) => {
                      if (el) {
                        const component = el as any
                        if ('isPreviewVisible' in component) {
                          previewerRefs.set(img.id, component.isPreviewVisible)
                        }
                      }
                    }
                  "
                  :src="img.url"
                  :preview-src-list="
                    imgList.filter((item) => isVideo(item.url)).map((item) => item.url)
                  "
                  :initial-index="
                    imgList
                      .filter((item) => isVideo(item.url))
                      .findIndex((item) => item.url === img.url)
                  "
                  :is-editing="props.modelValue"
                  :class="{ selected: selectedImages.includes(img.id) }"
                  :style="{
                    width: 'clamp(150px, 12vw, 220px)',
                    height: 'auto',
                    margin: '10px'
                  }"
                  @select="toggleSelection(img.id)"
                />
              </template>
            </template>

            <!-- 元数据内容 -->
            <div class="media-info">
              <template v-if="!isVideo(img.url)">
                <!-- 图片元数据内容 -->
                <div class="info-item" v-if="img.meta.takeTime">
                  <span class="label">拍摄时间：</span>
                  <span class="value">{{ img.meta.takeTime }}</span>
                </div>
                <div class="info-item" v-if="img.meta?.address">
                  <span class="label">位置：</span>
                  <span class="value">{{ img.meta.address }}</span>
                </div>
                <div
                  class="info-item"
                  v-if="(img.meta as ImageInfo)?.make || (img.meta as ImageInfo)?.model"
                >
                  <span class="label">相机：</span>
                  <span class="value"
                    >{{ (img.meta as ImageInfo).make }} {{ (img.meta as ImageInfo).model }}</span
                  >
                </div>
                <div class="info-item" v-if="(img.meta as ImageInfo)?.iso">
                  <span class="label">ISO：</span>
                  <span class="value">{{ (img.meta as ImageInfo).iso }}</span>
                </div>
                <div class="info-item" v-if="(img.meta as ImageInfo)?.fNumber">
                  <span class="label">光圈：</span>
                  <span class="value">f/{{ (img.meta as ImageInfo).fNumber }}</span>
                </div>
                <div class="info-item" v-if="(img.meta as ImageInfo)?.exposureTime">
                  <span class="label">快门：</span>
                  <span class="value">{{ (img.meta as ImageInfo).exposureTime }}s</span>
                </div>
                <div class="info-item" v-if="(img.meta as ImageInfo)?.focalLength">
                  <span class="label">焦距：</span>
                  <span class="value">{{ (img.meta as ImageInfo).focalLength }}mm</span>
                </div>
              </template>
              <template v-else>
                <!-- 视频元数据内容 -->
                <div class="info-item" v-if="img.meta.takeTime">
                  <span class="label">拍摄时间：</span>
                  <span class="value">{{ img.meta.takeTime }}</span>
                </div>
                <div class="info-item" v-if="(img.meta as VideoInfo)?.duration">
                  <span class="label">时长：</span>
                  <span class="value"
                    >{{ Math.round((img.meta as VideoInfo)?.duration ?? 0) }}秒</span
                  >
                </div>
                <div class="info-item" v-if="(img.meta as VideoInfo)?.resolution">
                  <span class="label">分辨率：</span>
                  <span class="value">{{ (img.meta as VideoInfo).resolution }}</span>
                </div>
                <div class="info-item" v-if="(img.meta as VideoInfo)?.codec">
                  <span class="label">编码：</span>
                  <span class="value">{{ (img.meta as VideoInfo).codec }}</span>
                </div>
                <div class="info-item" v-if="(img.meta as VideoInfo)?.fps">
                  <span class="label">帧率：</span>
                  <span class="value">{{ (img.meta as VideoInfo).fps }} FPS</span>
                </div>
                <div class="info-item" v-if="img.meta?.address">
                  <span class="label">位置：</span>
                  <span class="value">{{ img.meta.address }}</span>
                </div>
              </template>
            </div>
          </el-popover>
        </template>

        <!-- 当没有 meta 数据时直接显示预览组件 -->
        <template v-else>
          <template v-if="!isVideo(img.url)">
            <ImgPreviewer
              :src="img.url"
              :preview-src-list="
                imgList.filter((item) => !isVideo(item.url)).map((item) => item.url)
              "
              :initial-index="
                imgList.filter((item, idx) => !isVideo(item.url) && idx <= index).length - 1
              "
              :is-editing="props.modelValue"
              :class="{ selected: selectedImages.includes(img.id) }"
              :style="{
                width: 'clamp(150px, 12vw, 220px)',
                height: 'auto',
                margin: '10px'
              }"
              @select="toggleSelection(img.id)"
            />
          </template>
          <template v-else>
            <VideoPreviewer
              :src="img.url"
              :preview-src-list="
                imgList.filter((item) => isVideo(item.url)).map((item) => item.url)
              "
              :initial-index="
                imgList
                  .filter((item) => isVideo(item.url))
                  .findIndex((item) => item.url === img.url)
              "
              :is-editing="props.modelValue"
              :class="{ selected: selectedImages.includes(img.id) }"
              :style="{
                width: 'clamp(150px, 12vw, 220px)',
                height: 'auto',
                margin: '10px'
              }"
              @select="toggleSelection(img.id)"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
#photoItemId {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;

  .photo-upload-btn {
    display: inline-block;
    width: 150px;
    height: 150px;
    margin: 10px;
    border-radius: 10px;
    border: 2px dashed #ccc;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
      border-color: var(--el-color-primary);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    &-icon {
      width: 25px;
      height: 25px;
      color: #8c939d;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }

    &:hover &-icon {
      color: var(--el-color-primary);
      transform: translate(-50%, -50%) rotate(180deg);
    }

    .upload-tip {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #8c939d;
    }
  }

  .el-upload {
    display: initial !important;
  }

  .upload-demo {
    display: initial !important;
  }

  .selected {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 3px solid #ff4757;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(255, 71, 87, 0.3);
      animation: selectedPulse 2s infinite;
      z-index: 1;
      pointer-events: none;
    }
  }

  @keyframes selectedPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
    }
  }
}

.media-info {
  padding: 8px;
  z-index: 30000;

  .info-item {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #909399;
      font-size: 13px;
      white-space: nowrap;
      margin-right: 8px;
    }

    .value {
      color: #303133;
      font-size: 13px;
      font-weight: 500;
      text-align: right;
    }
  }
}

:deep(.el-popover.media-info-popover) {
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 30000;
  pointer-events: none;
}

// 确保图片容器有相对定位
.img-previewer,
.video-previewer {
  position: relative;
  display: inline-block;
}
</style>
