<script setup lang="ts">
import { ref, watch } from 'vue'
import { generateUUID } from '@/utils/CosUtils'
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
import { dto_GetPresignedURLReq, Service } from '../../../generated'

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
    await Service.postCosBatchDelete({
      keys: [uploadFile.url!],
    })
  } catch (err) {
    console.error('删除图片失败:', err)
  }
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const ajaxUpload: UploadRequestHandler = async (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')

  if (props.isCompress) {
    compressImage(option.file).then(async (compressedFile: File) => {
      console.log('压缩后：', (compressedFile.size / (1024 * 1024)).toFixed(2) + ' MB')

      // 创建一个新对象，包含压缩后的文件和原始文件的 uid
      const uploadFileObj = new File([compressedFile], compressedFile.name, {
        type: compressedFile.type
      }) as any
      uploadFileObj.uid = option.file.uid
      option.file = uploadFileObj
      // 调用上传方法
      await uploadFile(option)
    })
  } else {
    await uploadFile(option)
  }
  return new Promise(() => {})
}

const uploadFile = async (option: any) => {
  // 文件后缀
  const suffix = option.file.name.slice(option.file.name.lastIndexOf('.'))
  const fileKey = import.meta.env.VITE_COS_PATH_PREFIX + props.pathPrefix + generateUUID() + suffix

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
