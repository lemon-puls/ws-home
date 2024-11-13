// 格式化文件大小 字节转换为 MB
const formatSize = (bytes: number) => {
  if (!bytes) return '0 MB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export {
  formatSize
}