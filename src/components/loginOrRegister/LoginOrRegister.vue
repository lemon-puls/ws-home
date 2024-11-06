<template>
  <div class="overlay" v-if="true" @click="handleClickOutside"></div>
  <transition
    enter-active-class="animate__animated animate__backInLeft"
    leave-active-class="animate__animated animate__backOutRight"
  >
    <div
      id="loginOrRegisterId"
      style="display: flex; flex-direction: column; align-items: center; justify-content: center"
      v-if="true"
    >
      <div style="display: flex; justify-content: right; width: 80%">
        <el-switch v-model="isLogin" active-text="登录" inactive-text="注册" />
      </div>
      <div>
        <SvgIcon icon="xdl" size="90px" />
      </div>
      <div style="margin-bottom: 30px">
        <span style="font-size: 20px; font-weight: bold">Welcome to WS HOME</span>
      </div>
      <el-form
        ref="ruleFormRef"
        style="max-width: 18vw"
        :model="ruleForm"
        status-icon
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" v-show="!isLogin">
          <el-input v-model="ruleForm.userName" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="ruleForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item v-show="!isLogin" label="确认密码" prop="checkPass">
          <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
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
#loginOrRegisterId {
  --width: 20vw;
  --hight: 45vh;
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
import SvgIcon from '@/icons/SvgIcon'
import { Service } from '../../../generated'
import { useUserStore } from '@/stores/user'
import ACCESS_ENUM from '@/access/accessEnum'
import { a } from 'vitest/dist/suite-IbNSsUWN'

const isLogin = ref(true)

const userStore = useUserStore()

const ruleFormRef = ref<FormInstance>()

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
  pass: '',
  checkPass: '',
  phone: '',
  userName: ''
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
      const data = res.data
      // 更新用户信息
      userStore.updateUser({
        userRole: ACCESS_ENUM.USER,
        ...data.userVO
      })
      // 存储访问 token 和 refresh token
      localStorage.setItem('ACCESS_TOKEN', data.accessToken)
      localStorage.setItem('REFRESH_TOKEN', data.refreshToken)
      ElMessage.success('登录成功')
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
