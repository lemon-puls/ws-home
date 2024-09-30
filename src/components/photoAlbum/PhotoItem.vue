<script setup lang="ts">
const imgList = [
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg',

  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/94a529e913f73844cac5c56318f9bc8.png',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E6%99%BA%E7%BB%B4_proc.jpg',
  'https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg'
]
</script>

<template>
  <div id="photoItemId" style="overflow: scroll; height: 100%">
    <img
      v-for="(img, index) in imgList"
      style="width: 250px; height: auto; margin: 10px; border-radius: 10px"
      :key="index"
      :src="img"
      alt="photo"
    />
  </div>
</template>

<style scoped></style>
