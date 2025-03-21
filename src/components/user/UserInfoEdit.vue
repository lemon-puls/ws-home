<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人信息设置"
    width="30%"
    :close-on-click-modal="false"
    :show-close="true"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="user-form">
      <el-form-item label="头像" prop="avatar">
        <!-- 圆形头像 -->
        <SingleImgUpload path-prefix="avatar/" v-model="form.avatar" :width="100" :height="100" shape="circle" />
      </el-form-item>

      <el-form-item label="用户名" prop="userName">
        <el-input v-model="form.userName" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
          <el-radio :label="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="1" :max="120" />
      </el-form-item>

      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance, FormRules } from 'element-plus'
import SingleImgUpload from '@/components/upload/SingleImgUpload.vue'
import { dto_UpdateUserDTO, Service } from '../../../generated'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const userStore = useUserStore()
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = ref({
  userName: '',
  email: '',
  phone: '',
  gender: 0,
  age: 0,
  newPassword: '',
  oldPassword: '',
  avatar: ''
})

// 表单验证规则
const rules = ref<FormRules>({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  oldPassword: [{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }],
  newPassword: [{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }]
})

// 监听 show 属性变化
watch(
  () => props.show,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // 当 show 为 true 时也重置表单数据
      resetFormData()
    }
  }
)

// 监听对话框关闭
watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:show', val)
  }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用更新用户信息的 API
        const res = await Service.putUser(form.value as dto_UpdateUserDTO)
        if (res.code == 0) {
          userStore.getLoginUser()
          dialogVisible.value = false
          ElMessage.success('更新成功')
        } else {
          ElMessage.error('更新失败:' + res.msg)
        }
      } catch (error) {
        ElMessage.error('更新失败')
      }
    }
  })
}

const resetFormData = () => {
  form.value = {
    userName: userStore.loginUser.userName,
    email: userStore.loginUser.email,
    phone: userStore.loginUser.phone,
    gender: userStore.loginUser.gender,
    age: userStore.loginUser.age,
    newPassword: '',
    oldPassword: '',
    avatar: userStore.loginUser.avatar
  }
}
</script>

<style lang="scss" scoped>
.user-form {
  max-width: 460px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

:deep(.el-input-number) {
  width: 160px;
}
</style>
