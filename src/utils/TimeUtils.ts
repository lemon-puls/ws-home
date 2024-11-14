// 添加格式化日期的方法 把日期字符串格式化为 yyyy-mm-dd hh:mm:ss 形式
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/\//g, '-')
}

// 简化的日期格式化函数（只显示年月日）
const formatDateSimple = (dateStr: string) => {
  if (!dateStr) return ''
  if (dateStr === "0001-01-01T00:00:00Z") {
    return ""
  }
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export { formatDate, formatDateSimple }
