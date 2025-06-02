<script setup lang="ts">
import { ref, watchEffect, computed, defineProps, defineEmits, withDefaults } from 'vue'
import { generateUUID } from '@/utils/CosUtils'
import { Plus } from '@element-plus/icons-vue'

import { type UploadFile, type UploadFiles, type UploadRequestHandler } from 'element-plus'
import { compressImage } from '@/utils/FileUtils'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax'
import { Service } from '../../../generated'

// 定义 props
const props = withDefaults(
  defineProps<{
    modelValue: string
    // 图片宽度
    width?: string | number
    // 图片高度
    height?: string | number
    // 图片形状,'circle' | 'square'
    shape?: 'circle' | 'square'
    // 边框圆角
    borderRadius?: string | number
    // 上传路径前缀
    pathPrefix?: string
  }>(),
  {
    width: '178px',
    height: '178px',
    shape: 'square',
    borderRadius: '6px',
    pathPrefix: ''
  }
)

// 定义 emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 本地图片 URL
const imageUrl = ref('')

// 监听 props.modelValue 的变化
watchEffect(() => {
  imageUrl.value = props.modelValue
  console.log('imageUrl', imageUrl.value)
})

const ajaxUpload: UploadRequestHandler = (option) => {
  const sizeInMB = option.file.size / (1024 * 1024)
  console.log('压缩前：', sizeInMB.toFixed(2) + ' MB')

  compressImage(option.file).then(async (compressedFile: File) => {
    const sizeInMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
    console.log('压缩后：', sizeInMB + ' MB')

    // 创建一个新对象，包含压缩后的文件和原始文件的 uid
    const uploadFileObj = new File([compressedFile], compressedFile.name, {
      type: compressedFile.type
    }) as any
    uploadFileObj.uid = option.file.uid

    option.file = uploadFileObj
    await uploadFile(option)
  })
  return new Promise(() => {})
}

const uploadFile = async (option: any) => {
  // 文件后缀
  const suffix = option.file.name.slice(option.file.name.lastIndexOf('.'))
  const fileKey = import.meta.env.VITE_COS_PATH_PREFIX + props.pathPrefix + generateUUID() + suffix

  try {
    const res = await Service.postCosPresignedUrl({
      type: 'upload',
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
      type: 'download'
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
  console.log('上传成功：', response, uploadFile, uploadFiles)
  // 删除 COS 上的旧图片
  if (imageUrl.value) {
    try {
      await Service.postCosBatchDelete({
        keys: [imageUrl.value],
      })
    } catch (err) {
      console.error('删除旧图片失败:', err)
    }
  }

  uploadFile.url = response
  imageUrl.value = response
  // 触发 v-model 更新
  emit('update:modelValue', response)
}

// 计算图片样式
const imageStyle = computed(() => {
  let style = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    borderRadius:
      props.shape === 'circle'
        ? '50%'
        : typeof props.borderRadius === 'number'
          ? `${props.borderRadius}px`
          : props.borderRadius,
    objectFit: 'cover' as const
  }
  console.log('imageStyle', style)
  return style
})

// 计算上传图标容器样式
const uploaderStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius:
    props.shape === 'circle'
      ? '50%'
      : typeof props.borderRadius === 'number'
        ? `${props.borderRadius}px`
        : props.borderRadius
}))
</script>

<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :on-success="handleSuccess"
    :http-request="ajaxUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" :style="imageStyle" />
    <el-icon v-else class="avatar-uploader-icon" :style="uploaderStyle">
      <Plus />
    </el-icon>
  </el-upload>
</template>

<style lang="scss">
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);
  }
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  display: block;
}
</style>
