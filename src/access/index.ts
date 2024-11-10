import router from "@/router";
import ACCESS_ENUM from "@/access/accessEnum";
import checkAccess from "@/access/checkAccess";
import { useUserStore } from '@/stores/user'


router.beforeEach(async (to, from, next) => {
  // console.log("登录用户信息：", store.state.user.loginUser);
  const userStore = useUserStore();
  let loginUser = userStore.loginUser;
  // 没登录就自动登录
  if (
    !loginUser ||
    !loginUser.userRole ||
    loginUser.userRole === ACCESS_ENUM.NOT_LOGIN ||
    loginUser.userRole === null
  ) {
    // await可以使得用户登录成功之后 再执行后续的代码
    await userStore.getLoginUser();
    loginUser = userStore.loginUser;
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 要跳转的页面必须要登录
    // console.log("loginUser", loginUser);
    if (
      !loginUser ||
      !loginUser.userRole ||
      loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
    ) {
      next(`/txing/user/login?redirect=${to.fullPath}`);
      return;
    }
    // 已经登录 但是没有对应权限
    if (!checkAccess(loginUser, needAccess)) {
      next("/txing/noAuth");
      return;
    }
  }
  next();
});
