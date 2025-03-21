<script setup lang="ts">
import { ref, watch } from 'vue'
import { cos, generateUUID, deleteCosFile } from '@/utils/CosUtils'
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
const props = withDefaults(
  defineProps<{
    modelValue: string[]
    isCompress?: boolean
    pathPrefix?: string
  }>(),
  {
    isCompress: true,
    pathPrefix: ''
  }
)

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

const handleRemove: UploadProps['onRemove'] = async (uploadFile, uploadFiles) => {
  try {
    await deleteCosFile(uploadFile.url!)
  } catch (err) {
    console.error('删除图片失败:', err)
  }
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
        props.pathPrefix +
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
