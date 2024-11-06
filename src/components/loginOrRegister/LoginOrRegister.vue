<template>
  <div class="overlay" v-if="true" @click="handleClickOutside"></div>
  <transition
    enter-active-class="animate__animated animate__backInLeft"
    leave-active-class="animate__animated animate__backOutRight"
  >
    <div id="loginOrRegisterId" v-if="true">
      <div class="header">
        <el-switch v-model="isLogin" active-text="登录" inactive-text="注册" />
      </div>
      <div class="logo">
        <SvgIcon icon="xdl" :size="logoSize" />
      </div>
      <div class="welcome">
        <span>Welcome to WS HOME</span>
      </div>
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        status-icon
        :rules="rules"
        label-width="5em"
        class="login-form"
      >
        <el-form-item label="用户名" prop="userName" v-show="!isLogin">
          <el-input v-model="ruleForm.userName" :placeholder="isLogin ? '' : '请输入用户名'" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="ruleForm.phone"
            :placeholder="isLogin ? '请输入手机号登录' : '请输入手机号注册'"
          />
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input
            v-model="ruleForm.pass"
            type="password"
            autocomplete="off"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item v-show="!isLogin" label="确认密码" prop="checkPass">
          <el-input
            v-model="ruleForm.checkPass"
            type="password"
            autocomplete="off"
            placeholder="请再次输入密码"
          />
        </el-form-item>
        <el-form-item class="btn-group">
          <div class="btn-container">
            <el-button type="primary" @click="submitForm(ruleFormRef)">
              {{ isLogin ? '登录' : '注册' }}
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </transition>
</template>

<style lang="scss">
#loginOrRegisterId {
  --min-width: 300px;
  --max-width: 400px;
  --min-height: 400px;

  width: clamp(var(--min-width), 25vw, var(--max-width));
  min-height: var(--min-height);
  background-color: white;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10001;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;

  .header {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .logo {
    margin: 0 0 1rem 0;
  }

  .welcome {
    margin-bottom: 2rem;
    span {
      font-size: clamp(1.2rem, 2vw, 1.5rem);
      font-weight: bold;
      background: linear-gradient(45deg, #409eff, #7e33dd);
      -webkit-background-clip: text;
      color: transparent;
    }
  }

  .login-form {
    width: 90%;

    :deep(.el-form-item) {
      margin-bottom: 1.5rem;
    }

    :deep(.el-input) {
      --el-input-height: 2.5rem;
      max-width: 280px;
    }

    .btn-group {
      margin-top: 2rem;

      .btn-container {
        display: flex;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        padding-right: 5em; // 补偿label-width的宽度，确保按钮在整个表单的中心
      }

      .el-button {
        min-width: 6rem;
        height: 2.5rem;
      }
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
  backdrop-filter: blur(3px);
}
</style>

<script setup lang="ts">
// 聊天框显隐
// const handleClickOutside = () => {
//   useChatStore().showModal = false;
// };

import { reactive, ref, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import SvgIcon from '@/icons/SvgIcon'
import { Service } from '../../../generated'
import { useUserStore } from '@/stores/user'
import ACCESS_ENUM from '@/access/accessEnum'
import { useRouter } from 'vue-router'

const isLogin = ref(true)

const userStore = useUserStore()

const router = useRouter()

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
      // 刷新页面
      window.location.reload()
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

// 调整 logo 大小范围
const logoSize = computed(() => {
  return 'clamp(90px, 12vw, 120px)' // 增大最小值和最大值范围
})
</script>
