import COS from 'cos-js-sdk-v5'
import { CosService } from '../../generated'

export const cos = new COS({
  // getAuthorization 必选参数
  getAuthorization: function (options, callback) {
    // 初始化时不会调用，只有调用 cos 方法（例如 cos.putObject）时才会进入
    // 异步获取临时密钥
    // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
    // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
    // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

    CosService.getCosCredentials().then((res) => {
      if (res.code !== 0) {
        return
      }
      const data = res.data
      const credentials = data.Credentials
      callback({
        TmpSecretId: credentials.TmpSecretId,
        TmpSecretKey: credentials.TmpSecretKey,
        SecurityToken: credentials.Token,
        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        StartTime: data.StartTime, // 时间戳，单位秒，如：1580000000
        ExpiredTime: data.ExpiredTime // 时间戳，单位秒，如：1580000000
      })
    })
  }
})

export const generateUUID = () => {
  // 生成随机的 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const deleteCosFile = (urlOrKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let key = urlOrKey

    // 如果是 URL,则提取 key
    if (urlOrKey.startsWith('http')) {
      // 获取域名后面的路径部分
      const match = urlOrKey.match(/^https?:\/\/[^/]+\/(.+)$/)
      key = match ? match[1] : urlOrKey
    }

    cos.deleteObject(
      {
        Bucket: import.meta.env.VITE_COS_BUCKET,
        Region: import.meta.env.VITE_COS_REGION,
        Key: key
      },
      function (err, data) {
        if (err) {
          console.error('删除 COS 图片失败:', err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}
