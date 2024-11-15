<template>
  <div class="overlay" v-if="true" @click="albumStore.updateShowAddDialog(false)"></div>
  <transition
    enter-active-class="animate__animated animate__backInLeft"
    leave-active-class="animate__animated animate__backOutRight"
  >
    <div
      id="photoAlbumAddId"
      style="display: flex; flex-direction: column; align-items: center; justify-content: start"
      v-if="true"
    >
      <div style="margin-bottom: 30px">
        <span style="font-size: 20px; font-weight: bold">{{
          isEdit ? '编辑相册' : '新建相册'
        }}</span>
      </div>
      <el-form
        ref="ruleFormRef"
        style="max-width: 700px; width: 100%"
        :model="ruleForm"
        :show-messages="true"
        :scroll-to-error="true"
        status-icon
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
      >
        <el-form-item label="标题" prop="name">
          <el-input v-model="ruleForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description" required>
          <el-input
            v-model="ruleForm.description"
            style="width: 600px"
            :rows="10"
            type="textarea"
            maxlength="1000"
            show-word-limit
            placeholder="请输入描述..."
          />
        </el-form-item>
        <el-form-item label="上传封面" prop="coverImgUrl">
          <SingleImgUpload path-prefix="album/cover/" v-model="ruleForm.coverImgUrl" />
        </el-form-item>
        <!--        <el-form-item label="开启压缩" prop="isCompress">-->
        <!--          <el-switch v-model="ruleForm.isCompress" />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="图片上传" prop="albumImgs">-->
        <!--          <MutilImgUpload-->
        <!--            path-prefix="album/"-->
        <!--            v-model="ruleForm.albumImgs"-->
        <!--            :is-compress="ruleForm.isCompress"-->
        <!--          />-->
        <!--        </el-form-item>-->
        <el-form-item label="开始日期" prop="startTime">
          <el-date-picker
            v-model="ruleForm.startTime"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item id="submitBtn">
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="resetForm(ruleFormRef)"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </transition>
</template>

<style lang="scss">
/*聊天框*/
#photoAlbumAddId {
  --width: 60vw;
  --hight: 40vw;
  width: var(--width);
  height: var(--hight);
  background-color: white;
  position: fixed;
  left: calc(50% - var(--width) / 2);
  top: calc(50% - var(--hight) / 2);
  /*transform: translateX(-50%);*/
  /*transform: translateX(-50%);*/
  z-index: 10001;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 30px;
  overflow: scroll;

  #submitBtn {
    .el-form-item__content {
      justify-content: center !important;
      margin-top: 20px;
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}
</style>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { type dto_AlbumImgAddDTO, Service } from '../../../generated'
import { useUserStore } from '@/stores/user'
import { useAlbumStore } from '@/stores/album'
import SingleImgUpload from '@/components/upload/SingleImgUpload.vue'
import MutilImgUpload from '@/components/upload/MutilImgUpload.vue'

const albumStore = useAlbumStore()
const userStore = useUserStore()
const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
  name: '',
  description: '',
  // albumImgs: [],
  // isCompress: true,
  coverImgUrl: '',
  startTime: ''
})

// 监听编辑数据变化
watch(
  () => albumStore.editAlbumData,
  (newData) => {
    if (newData) {
      // 填充编辑表单
      ruleForm.name = newData.name
      ruleForm.description = newData.description
      ruleForm.coverImgUrl = newData.coverImgUrl
      ruleForm.startTime = newData.startTime
      // ruleForm.albumImgs = newData.albumImgs
    }
  },
  { immediate: true }
)

const rules = reactive<FormRules<typeof ruleForm>>({
  name: [
    { required: true, message: '标题不得为空', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在1到50个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '描述不得为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '标题长度在1到1000个字符', trigger: 'blur' }
  ],
  coverImgUrl: [{ required: true, message: '请上传封面图', trigger: '' }],
  // albumImgs: [
  //   {
  //     type: 'array',
  //     required: true,
  //     min: 1,
  //     max: 1000,
  //     message: '请上传至少一张图片',
  //     trigger: 'change'
  //   }
  // ]
  startTime: [{ required: true, message: '请选择开始日期', trigger: 'change' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (!valid) return

    // let imgObjs = ruleForm.albumImgs.map((img) => ({
    //   url: img,
    //   is_raw: !ruleForm.isCompress
    // }))

    try {
      const res = await Service.postAlbum({
        id: albumStore.editAlbumData?.id,
        // album_imgs: imgObjs,
        cover_img: ruleForm.coverImgUrl,
        description: ruleForm.description,
        name: ruleForm.name,
        user_id: userStore.loginUser.userId,
        start_time: ruleForm.startTime || undefined
      })

      if (res.code === 0) {
        ElMessage.success(albumStore.editAlbumData ? '更新成功' : '新建相册成功')
        albumStore.updateShowAddDialog(false)
      } else {
        ElMessage.error('操作失败:' + res.msg)
      }
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('操作失败')
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

let pickerOptions = {
  disabledDate(time) {
    return time.getTime() > Date.now();
  },
  shortcuts: [{
    text: '今天',
    onClick(picker) {
      picker.$emit('pick', new Date());
    }
  }, {
    text: '昨天',
    onClick(picker) {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24);
      picker.$emit('pick', date);
    }
  }, {
    text: '一周前',
    onClick(picker) {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
      picker.$emit('pick', date);
    }
  }]
};
</script>
