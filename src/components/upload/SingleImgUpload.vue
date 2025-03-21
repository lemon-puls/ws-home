<script setup lang="ts">
import { ref, watchEffect, computed, defineProps, defineEmits, withDefaults } from 'vue'
import { cos, generateUUID, deleteCosFile } from '@/utils/CosUtils'
import { Plus } from '@element-plus/icons-vue'

import { type UploadFile, type UploadFiles, type UploadRequestHandler } from 'element-plus'
import { compressImage } from '@/utils/FileUtils'
import { UploadAjaxError } from 'element-plus/es/components/upload/src/ajax'

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

  compressImage(option.file).then((compressedFile: File) => {
    const sizeInMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
    console.log('压缩后：', sizeInMB + ' MB')

    // 创建一个新对象，包含压缩后的文件和原始文件的 uid
    const uploadFileObj = new File([compressedFile], compressedFile.name, {
      type: compressedFile.type
    }) as any
    uploadFileObj.uid = option.file.uid

    option.file = uploadFileObj
    uploadFile(option)
  })
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
      //   5 /* 触发分块上传的阈值，超过5MB使用分块上传，小于5MB使用 简单上传。可自行设置，非必须 */,
      onProgress: function (progressData) {
        // console.log(JSON.stringify(progressData));
        let progress = Math.round((progressData.loaded / progressData.total) * 100)
        option.onProgress({
          percent: progress
        })
      }
    },
    function (err, data) {
      if (err) {
        option.onError(new UploadAjaxError(err.message, err?.statusCode ?? 0, err.method, err.url))
      } else {
        const downloadUrl = 'https://' + data.Location
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('上传成功：', response, uploadFile, uploadFiles)
  // 删除 COS 上的旧图片
  if (imageUrl.value) {
    try {
      await deleteCosFile(imageUrl.value)
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
