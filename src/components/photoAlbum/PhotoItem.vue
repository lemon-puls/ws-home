<script setup lang="ts">
import { ref, defineExpose, defineProps } from 'vue'

const imgList = ref([
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg'
])

let props = defineProps(['modelValue', 'isCompress'])
let $emit = defineEmits(['update:modelValue'])
import { Plus } from '@element-plus/icons-vue'
import { cos, generateUUID } from '@/utils/CosUtils'
import type { UploadFile, UploadFiles } from 'element-plus'

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
  imgList.value.unshift(response)
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
    <img
      v-for="(img, index) in imgList"
      :style="{
        width: '250px',
        height: 'auto',
        margin: '10px',
        borderRadius: '10px',
        border: selectedImages.includes(index) ? '2px solid red' : 'none'
      }"
      :key="index"
      :src="img"
      alt="photo"
      @click="props.modelValue ? toggleSelection(index) : null"
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
    borderradius: 10px;
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
}

</style>
