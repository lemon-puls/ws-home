export enum BACKEND_RESPONSE_CODE {
  // 成功
  Success = 0,
  // 服务器内部错误
  ServerInternalError,
  // 无效参数
  InvalidParams,
  // 未找到
  NotFound,
  // 未登录
  NotLogin
}
