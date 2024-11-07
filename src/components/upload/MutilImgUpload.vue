<script setup lang="ts">
import { ref, watch } from 'vue'
import { cos, generateUUID } from '@/utils/CosUtils'
import { Plus } from '@element-plus/icons-vue'

import {
  type UploadFile,
  type UploadFiles,
  type UploadProps,
  type UploadRequestHandler,
  type UploadUserFile
} from 'element-plus'
import { compressImage } from '@/utils/FileUtils'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax'

// 定义 props - 接收字符串数组
const props = defineProps<{
  modelValue: string[]
  isCompress?: boolean
}>()

// 定义 emits
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// 本地维护完整的文件列表
const fileList = ref<UploadUserFile[]>([])

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// TODO 加上这段代码会导致 handleSuccess 无法触发，具体原因后面有时间再细看
// // 监听 props.modelValue 的变化,将 URL 数组转换为 UploadUserFile 数组
// watch(
//   () => props.modelValue,
//   (newUrls) => {
//     const newFileList = newUrls.map((url) => ({
//       name: url.substring(url.lastIndexOf('/') + 1),
//       url: url
//     }))
//
//     if (JSON.stringify(fileList.value) !== JSON.stringify(newFileList)) {
//       fileList.value = newFileList
//     }
//   },
//   { immediate: true }
// )

// // 监听文件列表变化
watch(
  () => fileList.value,
  (newFileList) => {
    const newUrls = newFileList.map((file) => file.url || '').filter((url) => url)
    if (JSON.stringify(props.modelValue) !== JSON.stringify(newUrls)) {
      emit('update:modelValue', newUrls)
    }
  },
  { deep: true }
)

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  // 从文件的 URL 中提取出对象键
  const url = uploadFile.url
  const key = url.substring(url.lastIndexOf('/') + 1)
  cos.deleteObject(
    {
      Bucket: import.meta.env.VITE_COS_BUCKET, // 替换为你的 bucket 名称
      Region: import.meta.env.VITE_COS_REGION, // 替换为你的地域
      Key: key // 要删除的对象键
    },
    function (err, data) {
      if (err) {
        console.error('删除失败：', err)
      }
    }
  )
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const ajaxUpload: UploadRequestHandler = (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')

  if (props.isCompress) {
    compressImage(option.file).then((compressedFile: File) => {
      console.log('压缩后：', compressedFile.size / (1024 * 1024).toFixed(2) + ' MB')
      option.file = compressedFile
      uploadFile(option)
    })
  } else {
    uploadFile(option)
  }
  return null
}

const uploadFile = (option) => {
  // 文件后缀
  const suffix = option.file.name.slice(option.file.name.lastIndexOf('.'))
  cos.uploadFile(
    {
      Bucket: import.meta.env.VITE_COS_BUCKET /* 填写自己的 bucket，必须字段 */,
      Region: import.meta.env.VITE_COS_REGION /* 存储桶所在地域，必须字段 */,
      Key:
        generateUUID() +
        suffix /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */,
      Body: option.file, // 上传文件对象
      // SliceSize:
      //   1024 *
      //   1024 *
      //   5 /* 触发分块上���的阈值，超过5MB使用分块上传，小于5MB使用 简单上传。可自行设置，非必须 */,
      onProgress: function (progressData) {
        // console.log(JSON.stringify(progressData));
        progress.value = Math.round((progressData.loaded / progressData.total) * 100)
        option.onProgress({
          percent: progress.value
        })
      }
    },
    function (err, data) {
      console.log('COS 上传完成回调：', err, data)
      if (err) {
        option.onError(new UploadAjaxError(err.message, err.statusCode, err.method, err.url))
      } else {
        const downloadUrl = 'https://' + data.Location
        console.log('下载链接：', downloadUrl)
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('上传成功：', response, uploadFile, uploadFiles)
  uploadFile.url = response
}
</script>

<template>
  <el-upload
    v-model:file-list="fileList"
    :http-request="ajaxUpload"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :on-success="handleSuccess"
    :multiple="true"
  >
    <el-icon>
      <Plus />
    </el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<style scoped></style>
