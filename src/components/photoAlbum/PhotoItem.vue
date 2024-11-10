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

const selectedImages = ref<number[]>([])
interface AlbumImage {
  id: number
  url: string
}
const imgList = ref<AlbumImage[]>([])
const loading = ref(false)
const cursor = ref('')
const isLast = ref(false)
const pageSize = 20

const uploadingCount = ref(0)
const totalUploadCount = ref(0)

// 获取图片列表
const getImgList = async () => {
  if (loading.value || isLast.value) return

  loading.value = true
  try {
    const res = await Service.postAlbumImgList({
      album_id: albumStore.currentAlbumId,
      cursor: cursor.value,
      pageSize: pageSize
    })

    if (res.code === 0) {
      const newImages = res.data.data.map((item: any) => ({
        id: item.id,
        url: item.url
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
  toggleEdit
})

const ajaxUpload: UploadRequestHandler = (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')

  if (props.isCompress) {
    compressImage(option.file).then((compressedFile: File) => {
      console.log('压缩后：', (compressedFile.size / (1024 * 1024)).toFixed(2) + ' MB')

      // 创建一个新对象，包含压缩后的文件和原始文件的 uid
      const uploadFileObj = new File([compressedFile], compressedFile.name, {
        type: compressedFile.type
      }) as any
      uploadFileObj.uid = option.file.uid
      option.file = uploadFileObj
      // 调用上传方法
      uploadFile(option)
    })
  } else {
    uploadFile(option)
  }
  return Promise.resolve()
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
        "ablum/" +
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
      console.log('COS 上传完成回调：', err, data)
      if (err) {
        option.onError(new UploadAjaxError(err.message, err?.statusCode?? 0, err.method, err.url))
      } else {
        const downloadUrl = 'https://' + data.Location
        console.log('下载链接：', downloadUrl)
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('上传成功：', response, uploadFile, uploadFiles)
  uploadFile.url = response

  // 如果是新的上传批次，重置计数器
  if (uploadingCount.value === 0) {
    totalUploadCount.value = uploadFiles.length
  }
  uploadingCount.value++

  try {
    // 调用后端接口保存图片地址
    const res = await Service.postAlbumImg({
      album_id: albumStore.currentAlbumId,
      urls: [response]
    })
    if (res.code === 0) {
      // 将图片地址添加到图片列表前面
      imgList.value.unshift({
        id: res.data[response].id,
        url: response
      })

      // 只在所有图片都上传完成时显示成功消息
      if (uploadingCount.value === totalUploadCount.value) {
        ElMessage.success(`${totalUploadCount.value}张图片添加成功`)
        uploadingCount.value = 0 // 重置计数器
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
</script>

<template>
  <div id="photoItemId" style="overflow: scroll; height: 100%" @scroll="handleScroll">
    <!--    <button v-if="isEditing" @click="deleteSelectedImages">删除选中图片</button>-->
    <el-upload
      class="upload-demo"
      :http-request="ajaxUpload"
      :on-success="handleSuccess"
      multiple
      :show-file-list="false"
    >
      <div class="photo-upload-btn" v-if="props.modelValue">
        <Plus class="photo-upload-btn-icon" />
      </div>
    </el-upload>
    <ImgPreviewer
      v-for="(img, index) in imgList"
      :key="img.id"
      :src="img.url"
      :preview-src-list="imgList.map((item) => item.url)"
      :initial-index="index"
      :is-editing="props.modelValue"
      :class="{ selected: selectedImages.includes(img.id) }"
      :style="{
        width: 'clamp(150px, 12vw, 220px)',
        height: 'auto',
        margin: '10px'
      }"
      @select="toggleSelection(img.id)"
    />
  </div>
</template>

<style lang="scss">
#photoItemId {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
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
