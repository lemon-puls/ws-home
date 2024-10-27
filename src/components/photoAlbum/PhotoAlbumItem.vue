<template>
  <div id="courseItemId">
    <div :class="{ container: true }">
      <img
        src="https://txing-oj-1311424669.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221210155825.jpg"
      />
      <span>14 p</span>
    </div>
    <div class="title">
      <span> 广州一日游 </span>
    </div>
    <div class="footer">
      <div class="footer-author">
        <SvgIcon class="footer-author-icon" icon="author"></SvgIcon>
        <span class="footer-author-name"> 小霜 </span>
      </div>
      <span class="footer-date"> 2021-08-15 12:00:00 </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, withDefaults } from 'vue'
import SvgIcon from '@/icons/SvgIcon'

// onMounted(() => {
//   console.log("获取到了,", props.course);
// });

// const props = defineProps(["course", "isShowOverlay"]);
// const props = withDefaults(
//   defineProps<{
//     album: {}
//     isShowOverlay?: boolean
//   }>(),
//   {
//     isShowOverlay: false
//   }
// )
</script>

<style lang="scss" scoped>
#courseItemId {
  max-width: 250px;
  width: 20vw;
  height: auto;
  border-radius: 10px;
  background-color: #f1f2f5;
  padding: 10px;

  .container {
    width: 100%; /* 设置容器宽度 */
    max-width: 250px; /* 设置最大宽度，可根据需要调整 */
    width: 20vw;
    position: relative;
    padding-top: calc(378 / 672 * 100%); /* 设置容器的 padding-top 为宽高比例 */
    overflow: hidden;

    img {
      position: absolute;
      width: 100%; /* 图片宽度为容器宽度 */
      height: auto; /* 让高度自适应，保持图片比例 */
      top: 0;
      left: 0;
      border-radius: 10px;
    }

    span {
      position: absolute;
      bottom: 0;
      right: 0;
      color: white;
      margin-right: 5px;
      margin-bottom: 5px;
      font-size: min(1vw, 14px);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      border-radius: 10px;

      .overlay-content {
        color: white; /* 文字颜色 */
        font-size: 12px; /* 文字大小 */
        text-align: center; /* 文字居中 */
        padding: 5px; /* 内边距 */
        border-radius: 5px; /* 圆角 */
        background-color: rgba(0, 0, 0, 0.7); /* 遮罩层背景 */
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        row-gap: 3px;

        span {
          position: initial;
          bottom: initial;
          right: initial;
          margin-right: initial;
          margin-bottom: initial;
        }

        .remark {
          font-size: 10px;
          color: #ffffff;
        }
      }
    }
  }

  .title {
    padding: 5px;
    font-size: min(1vw, 15px);
    color: #383434;
  }

  .footer {
    color: #979797;
    display: flex;
    justify-content: space-between;
    font-size: min(0.8vw, 12px);

    &-author {
      &-name {
        margin-left: 5px;
      }

      &-icon {
        margin-left: 5px;
      }
    }
  }
}
</style>
