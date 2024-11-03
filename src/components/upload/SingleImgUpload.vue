<script setup lang="ts">
import { ref, watch } from 'vue'
import { cos, generateUUID } from '@/utils/CosUtils'
import { Plus } from '@element-plus/icons-vue'

import { type UploadFile, type UploadFiles, type UploadRequestHandler } from 'element-plus'
import { compressImage } from '@/utils/FileUtils'

// 定义 props
const props = defineProps<{
  modelValue: string
}>()

// 定义 emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 本地图片 URL
const imageUrl = ref('')

// 监听 props.modelValue 的变化
watch(
  () => props.modelValue,
  (newValue) => {
    imageUrl.value = newValue
  }
)

const ajaxUpload: UploadRequestHandler = (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')

  compressImage(option.file).then((compressedFile: File) => {
    console.log('压缩后：', compressedFile.size / (1024 * 1024).toFixed(2) + ' MB')
    option.file = compressedFile
    uploadFile(option)
  })
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
      //   5 /* 触发分块上传的阈值，超过5MB使用分块上传，小于5MB使用 简单上传。可自行设置，非必须 */,
      onProgress: function (progressData) {
        // console.log(JSON.stringify(progressData));
        progress.value = Math.round((progressData.loaded / progressData.total) * 100)
        option.onProgress({
          percent: progress.value
        })
      }
    },
    function (err, data) {
      if (err) {
        option.onError(new UploadAjaxError(err.message, err.statusCode, err.method, err.url))
      } else {
        const downloadUrl = 'https://' + data.Location
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('上传成功：', response, uploadFile, uploadFiles)
  uploadFile.url = response
  imageUrl.value = response
  // 触发 v-model 更新
  emit('update:modelValue', response)
}
</script>

<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :on-success="handleSuccess"
    :http-request="ajaxUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon">
      <Plus />
    </el-icon>
  </el-upload>
</template>

<style lang="scss">
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  $width: 20vw;
  max-width: 250px;
  width: $width;
  //height: calc(378 / 672 * $width);
}
</style>
