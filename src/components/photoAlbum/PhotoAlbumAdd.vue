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
        status-icon
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
      >
        <el-form-item label="标题">
          <el-input v-model="ruleForm.userName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="ruleForm.description"
            style="width: 600px"
            :rows="10"
            type="textarea"
            placeholder="请输入描述..."
          />
        </el-form-item>
        <el-form-item label="上传封面">
          <SingleImgUpload v-model="ruleForm.coverImgUrl" />
        </el-form-item>
        <el-form-item label="开启压缩">
          <el-switch v-model="ruleForm.isCompress" :active-icon="Check" :inactive-icon="Close" />
        </el-form-item>
        <el-form-item label="图片上传" prop="checkPass">
          <MutilImgUpload :is-compress="ruleForm.isCompress" />
        </el-form-item>
        <el-form-item id="submitBtn">
          <el-button type="primary" @click="submitForm(ruleFormRef)"> 登陆</el-button>
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
import { Service } from '../../../generated'
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

const checkAge = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('Please input the age'))
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error('Please input digits'))
    } else {
      if (value < 18) {
        callback(new Error('Age must be greater than 18'))
      } else {
        callback()
      }
    }
  }, 1000)
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  } else {
    if (ruleForm.checkPass !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('checkPass')
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== ruleForm.pass) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const ruleForm = reactive({
  name: '',
  description: '',
  coverImg: '',
  albumImgs: [],
  isCompress: true,
  coverImgUrl: ''
})

const rules = reactive<FormRules<typeof ruleForm>>({
  pass: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
  age: [{ validator: checkAge, trigger: 'blur' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!')
    }
  })

  if (isLogin.value) {
    // 登陆
    const res = await Service.postUserLogin({
      phone: ruleForm.phone,
      password: ruleForm.pass
    })
    if (res.code == 0) {
      console.log('登录成功:', res)
      const data = res.data
      localStorage.setItem('TOKEN', data.token)
      // 更新用户信息
      userStore.updateUser({
        userRole: ACCESS_ENUM.USER,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userVO.userId,
        userName: data.userVO.userName,
        userAvatar:
          'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp',
        phone: data.userVO.phone
      })
    } else {
      ElMessage.error('登录失败:' + res.msg)
    }
  } else {
    // 注册
    alert('注册功能暂未开放')
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
