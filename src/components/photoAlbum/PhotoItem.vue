<script setup lang="ts">
import { ref, defineExpose, defineProps, PropType } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  isCompress: Boolean,
  imgList: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

let $emit = defineEmits(['update:modelValue'])
import { Plus } from '@element-plus/icons-vue'
import { cos, generateUUID } from '@/utils/CosUtils'
import type { UploadFile, UploadFiles } from 'element-plus'
import ImgPreviewer from '@/components/preview/ImgPreviewer.vue'

// const isEditing = ref(false) // 控制编辑状态
const selectedImages = ref<number[]>([]) // 选中的图片索引

const toggleEdit = () => {
  $emit('update:modelValue', !props.modelValue)
  selectedImages.value = [] // 退出编辑模式时清空选中状态
}

const toggleSelection = (index: number) => {
  if (selectedImages.value.includes(index)) {
    selectedImages.value = selectedImages.value.filter((i) => i !== index)
  } else {
    selectedImages.value.push(index)
  }
}

const deleteSelectedImages = () => {
  alert('删除功能暂未实现')
  // imgList.value = imgList.value.filter((_, index) => !selectedImages.value.includes(index))
  // selectedImages.value = [] // 删除后清空选中状态
}

const addImgs = () => {}

//组件内部数据对外关闭的，别人不能访问
//如果想让外部访问需要通过defineExpose方法对外暴露
defineExpose({
  deleteSelectedImages,
  toggleEdit
})

const uploadFile = (option) => {
  console.log('开始上传文件, 压缩：', props.isCompress)
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
        console.log('上传进度：', progress.value)
        option.onProgress({
          percent: progress.value
        })
      }
    },
    function (err, data) {
      if (err) {
        console.error('上传失败：', err)
        option.onError(new UploadAjaxError(err.message, err.statusCode, err.method, err.url))
      } else {
        console.log('上传成功 COS：', data)
        const downloadUrl = 'https://' + data.Location
        option.onSuccess(downloadUrl)
      }
    }
  )
}

const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('上传成功：', response, uploadFile, uploadFiles)
  uploadFile.url = response
  // TODO 调用后端接口保存图片地址

  // 将图片地址添加到图片列表前面
  props.imgList.unshift(response)
}
</script>

<template>
  <div id="photoItemId" style="overflow: scroll; height: 100%">
    <!--    <button v-if="isEditing" @click="deleteSelectedImages">删除选中图片</button>-->
    <el-upload
      v-model:file-list="fileList"
      class="upload-demo"
      :http-request="uploadFile"
      :on-success="handleSuccess"
      multiple
      :show-file-list="false"
    >
      <div class="photo-upload-btn" v-if="props.modelValue">
        <Plus class="photo-upload-btn-icon" />
      </div>
    </el-upload>
    <ImgPreviewer
      v-for="(img, index) in props.imgList"
      :key="index"
      :src="img"
      :preview-src-list="props.imgList"
      :initial-index="index"
      :is-editing="props.modelValue"
      :class="{ selected: selectedImages.includes(index) }"
      :style="{
        width: '250px',
        height: 'auto',
        margin: '10px'
      }"
      @select="toggleSelection(index)"
    />
  </div>
</template>

<style lang="scss">
#photoItemId {
  .photo-upload-btn {
    display: inline-block;
    width: 150px;
    height: 150px;
    margin: 10px;
    border-radius: 10px;
    border: 2px dashed #ccc;
    position: relative;

    &-icon {
      width: 25px;
      height: 25px;
      color: #8c939d;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
