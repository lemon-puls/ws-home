<template>
  <div class="overlay" v-if="true" @click="handleClickOutside"></div>
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
        <span style="font-size: 20px; font-weight: bold">新建相册</span>
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
        <el-form-item label="开启压缩" prop="isCompress">
          <el-switch v-model="ruleForm.isCompress" :active-icon="Check" :inactive-icon="Close" />
        </el-form-item>
        <el-form-item label="图片上传" prop="albumImgs">
          <MutilImgUpload path-prefix="album/" v-model="ruleForm.albumImgs" :is-compress="ruleForm.isCompress" />
        </el-form-item>
        <el-form-item id="submitBtn">
          <el-button type="primary" @click="submitForm(ruleFormRef)"> 创建</el-button>
          <el-button @click="resetForm(ruleFormRef)"> 重置</el-button>
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
// 聊天框显隐
// const handleClickOutside = () => {
//   useChatStore().showModal = false;
// };

import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { type dto_AlbumImgAddDTO, Service } from '../../../generated'
import { useUserStore } from '@/stores/user'
import ACCESS_ENUM from '@/access/accessEnum'
import MutilImgUpload from '@/components/upload/MutilImgUpload.vue'
import { useAlbumStore } from '@/stores/album'
import SingleImgUpload from '@/components/upload/SingleImgUpload.vue'

const albumStore = useAlbumStore()

const isLogin = ref(true)

const userStore = useUserStore()

const ruleFormRef = ref<FormInstance>()

const handleClickOutside = () => {
  albumStore.updateShowAddDialog(false)
}

const ruleForm = reactive({
  name: '',
  description: '',
  albumImgs: [],
  isCompress: true,
  coverImgUrl: ''
})

// const rules = reactive<FormRules<typeof ruleForm>>({
//   pass: [{ validator: validatePass, trigger: 'blur' }],
//   checkPass: [{ validator: validatePass2, trigger: 'blur' }],
//   age: [{ validator: checkAge, trigger: 'blur' }]
// })

const rules = reactive<FormRules<typeof ruleForm>>({
  name: [
    { required: true, message: '标题不得为空', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在1到50个字符', trigger: 'blur' }
  ],
  description: [
    {
      required: true,
      message: '描述不得为空',
      trigger: 'blur'
    },
    { min: 1, max: 1000, message: '标题长度在1到1000个字符', trigger: 'blur' }
  ],
  coverImgUrl: [
    {
      required: true,
      message: '请上传封面图',
      trigger: ''
    }
  ],
  albumImgs: [
    {
      type: 'array',
      required: true,
      min: 1,
      max: 1000,
      message: '请上传至少一张图片',
      trigger: 'change'
    }
  ]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  console.log('submit!', ruleForm)

  ElMessage.success()

  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) {
      return
    }
  })

  let imgObjs: dto_AlbumImgAddDTO[] = ruleForm.albumImgs.map(img => {
    return {
      url: img,
    }
  })
  // 新建相册
  const res = await Service.postAlbum({
    album_imgs: imgObjs,
    cover_img: ruleForm.coverImgUrl,
    description: ruleForm.description,
    name: ruleForm.name,
    user_id: userStore.loginUser.userId,
  })
  if (res.code == 0) {
    console.log('新建相册成功:', res)
    const data = res.data
    albumStore.updateShowAddDialog(false);
  } else {
    ElMessage.error('登录失败:' + res.msg)
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
