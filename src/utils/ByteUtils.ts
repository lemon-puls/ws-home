// 格式化文件大小 字节转换为 MB
const formatSize = (bytes: number) => {
  if (!bytes) return '0 MB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 将 MB 转换为可显示的字符串
const formatMBToReadableString = (mb: number) => {
  const gb = Math.floor(mb / 1024)
  const remainingMB = mb % 1024
  let result = ''

  if (gb > 0) {
    result += `${gb} GB`
  }
  if (remainingMB > 0) {
    result += (result ? ' + ' : '') + `${remainingMB.toFixed(2)} MB`
  }

  return result || '0 MB'
}

export { formatSize, formatMBToReadableString }
