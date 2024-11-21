<script setup lang="ts">
import { ref, defineExpose, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

const props = defineProps({
  modelValue: Boolean,
  isCompress: Boolean
})

let $emit = defineEmits(['update:modelValue', 'onUpdate'])
import { Plus } from '@element-plus/icons-vue'
import { cos, generateUUID, deleteCosFile } from '@/utils/CosUtils'
import type { UploadFile, UploadFiles, UploadRequestHandler } from 'element-plus'
import ImgPreviewer from '@/components/preview/ImgPreviewer.vue'
import { ElMessage } from 'element-plus'
import { Service } from '../../../generated'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax'
import { compressImage } from '@/utils/FileUtils'
import type { UploadInstance } from 'element-plus'
import VideoPreviewer from '@/components/preview/VideoPreviewer.vue'

const selectedImages = ref<number[]>([])
interface AlbumImage {
  id: number
  url: string
  is_raw: boolean
  size?: number
}
const imgList = ref<AlbumImage[]>([])
const loading = ref(false)
const cursor = ref('')
const isLast = ref(false)
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

// 添加筛选类型
const filterType = ref('compressed')

// 重置并刷新列表的方法
const resetAndRefresh = (type: string) => {
  filterType.value = type
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
    const res = await Service.postAlbumImgList({
      album_id: albumStore.currentAlbumId,
      cursor: cursor.value,
      pageSize: pageSize,
      is_raw: filterType.value === 'all' ? undefined : filterType.value === 'raw'
    })

    if (res.code === 0) {
      const newImages = res.data.data.map((item: any) => ({
        id: item.id,
        url: item.url,
        is_raw: item.is_raw
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

// 监听滚动到底部
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
    const res = await Service.deleteAlbumImg(selectedImages.value.join(','))

    if (res.code === 0) {
      // 删除成功后，删除 COS 上的文件
      try {
        await Promise.all(urlsToDelete.map((url) => deleteCosFile(url)))
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

// 修改 ajaxUpload 函数
const ajaxUpload: UploadRequestHandler = (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')
  const file = option.file
  const isVideo = file.type.startsWith('video/')

  if (!isVideo && props.isCompress) {
    // 只对图片进行压缩
    compressionQueue
      .add(file)
      .then((compressedFile: File) => {
        console.log('压缩后：', (compressedFile.size / (1024 * 1024)).toFixed(2) + ' MB')

        // 存储压缩后的文件大小
        compressedFileSizes.set(option.file.uid, compressedFile.size)

        // 创建一个新对象，包含压缩后的文件和原始文件的 uid
        const uploadFileObj = new File([compressedFile], compressedFile.name, {
          type: compressedFile.type
        }) as any
        uploadFileObj.uid = option.file.uid
        option.file = uploadFileObj
        uploadFile(option)
      })
      .catch((error) => {
        console.error('图片压缩失败:', error)
        // 压缩失败时使用原始文件上传
        // uploadFile(option)
      })
  } else {
    // 视频或不需要压缩的图片直接上传
    uploadFile(option)
  }
  return new Promise(() => {})
}

const uploadFile = (option: any) => {
  // 文件后缀
  const suffix = option.file.name.slice(option.file.name.lastIndexOf('.'))
  cos.uploadFile(
    {
      Bucket: import.meta.env.VITE_COS_BUCKET /* 填写自己的 bucket，必须字段 */,
      Region: import.meta.env.VITE_COS_REGION /* 存储桶所在地域，必须字段 */,
      Key:
        import.meta.env.VITE_COS_PATH_PREFIX +
        'ablum/' +
        generateUUID() +
        suffix /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */,
      Body: option.file, // 上传文件对象
      // SliceSize:
      //   1024 *
      //   1024 *
      //   5 /* 触发分块上的阈值，超过5MB使用分块上传，小于5MB使用 简单上传。可自行设置，非必须 */,
      onProgress: function (progressData) {
        // console.log(JSON.stringify(progressData));
        let progress = Math.round((progressData.loaded / progressData.total) * 100)
        option.onProgress({
          percent: progress
        })
      }
    },
    function (err, data) {
      // console.log('COS 上传完成回调：', err, data)
      if (err) {
        option.onError(new UploadAjaxError(err.message, err?.statusCode ?? 0, err.method, err.url))
      } else {
        const downloadUrl = 'https://' + data.Location
        // console.log('下载链接：', downloadUrl)
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  uploadFile.url = response

  // 如果是新的上传批次，重置计数器
  if (uploadingCount.value === 0) {
    totalUploadCount.value = uploadFiles.length - totalUploadCount.value
  }
  uploadingCount.value++

  try {
    // 获取文件大小(如果有压缩则使用压缩后的大小)
    const fileSize = compressedFileSizes.get(uploadFile.uid) || uploadFile.size || 0
    const sizeInMB = Number((fileSize / (1024 * 1024)).toFixed(2))

    // 清理已使用的压缩信息
    compressedFileSizes.delete(uploadFile.uid)

    // 调用后端接口保存图片地址
    const res = await Service.postAlbumImg({
      album_id: albumStore.currentAlbumId,
      album_imgs: [
        {
          url: response,
          is_raw: !props.isCompress,
          size: sizeInMB // 存储转换后的 MB 大小
        }
      ]
    })
    if (res.code === 0) {
      // 将图片地址添加到图片列表前面
      imgList.value.unshift({
        id: res.data[response].id,
        url: response,
        is_raw: !props.isCompress,
        size: sizeInMB // 存储转换后的 MB 大小
      })
      // 只在所有图片都上传完成时显示成功消息
      if (uploadingCount.value === totalUploadCount.value) {
        ElMessage.success(`${totalUploadCount.value}张图片添加成功`)
        uploadingCount.value = 0 // 重置计数器
        clearUploadFiles() // 清空上传列表
        $emit('onUpdate') // 触发更新事件
      }
    } else {
      // 保存失败,删除 COS 上的图片
      await deleteCosFile(response)
      ElMessage.error('保存图片失败:' + res.msg)
      uploadingCount.value = 0 // 重置计数器
    }
  } catch (error) {
    // 发生异常,删除 COS 上的图片
    await deleteCosFile(response)
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
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))
}
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
      :accept="'.jpg,.jpeg,.png,.gif,.mp4,.webm,.ogg,.mov'"
    >
      <div class="photo-upload-btn" v-if="props.modelValue">
        <Plus class="photo-upload-btn-icon" />
        <span class="upload-tip">最多 50 张</span>
      </div>
    </el-upload>

    <template v-for="(img, index) in imgList" :key="img.id">
      <!-- 图片预览组件 -->
      <ImgPreviewer
        v-if="!isVideo(img.url)"
        :src="img.url"
        :preview-src-list="imgList.filter((item) => !isVideo(item.url)).map((item) => item.url)"
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

      <!-- 视频预览组件 -->
      <VideoPreviewer
        v-else
        :src="img.url"
        :preview-src-list="imgList.filter((item) => isVideo(item.url)).map((item) => item.url)"
        :initial-index="
          imgList.filter((item) => isVideo(item.url)).findIndex((item) => item.url === img.url)
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
</style>
