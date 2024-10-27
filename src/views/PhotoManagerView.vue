<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import PhotoAlbumItem from '@/components/photoAlbum/PhotoAlbumItem.vue'
import SvgIcon from '@/icons/SvgIcon'
import { useAlbumStore } from '@/stores/album'

const albumStore = useAlbumStore()

const imgList = [
  'https://th.bing.com/th/id/OIP.YKoZzgmubNBxQ8j-mmoTKAHaEK?w=329&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7',
  'https://www.bing.com/images/search?view=detailV2&ccid=neU%2flyZX&id=8EA47C03DC5EF4998C0487D376C492D2577760B1&thid=OIP.neU_lyZXZpazGKjZXAlGywHaEK&mediaurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.9de53f9726576696b318a8d95c0946cb%3frik%3dsWB3V9KSxHbThw%26riu%3dhttp%253a%252f%252fpic.bizhi360.com%252fbbpic%252f95%252f9995_1.jpg%26ehk%3dGcPUjJED69TBvg9XxQr2klzDzfRsQWhAfLKlIAUWHJQ%253d%26risl%3d%26pid%3dImgRaw%26r%3d0&exph=1080&expw=1920&q=%e9%a3%8e%e6%99%af%e5%9b%be%e7%89%87%e5%a4%a7%e5%85%a8&simid=608019807869538389&FORM=IRPRST&ck=B8EC61E11CDC8E8E871D9CA1B5A48827&selectedIndex=3&itb=0',
  'https://www.bing.com/images/search?view=detailV2&ccid=%2b34ZOx3w&id=3A928219641560C664840FA90E892701FC901BFB&thid=OIP.-34ZOx3wP4KeZnKue4L28gHaEo&mediaurl=https%3a%2f%2fwww.2008php.com%2f2011_Website_appreciate%2f2011-09-23%2f20110923163645.jpg&exph=900&expw=1440&q=%e9%a3%8e%e6%99%af%e5%9b%be%e7%89%87%e5%a4%a7%e5%85%a8&simid=608040269066018205&FORM=IRPRST&ck=7D164F69A6DCCDAEF44BAC3D759B72B2&selectedIndex=5&itb=0'
]

const handleCreate = () => {
   albumStore.updateShowAddDialog(true)
}

const handleSizeChange = (size: number) => {

}
const handleCurrentChange = (currentPage: number) => {

}

</script>

<template>
  <div id="photo-manager">
    <!--    <el-carousel height="400px">-->
    <!--      <el-carousel-item v-for="item in imgList" :key="item">-->
    <!--&lt;!&ndash;        <h3 class="small justify-center" text="2xl">{{ item }}</h3>&ndash;&gt;-->
    <!--        <img :src="item" class="carousel-img">-->
    <!--      </el-carousel-item>-->
    <!--    </el-carousel>-->
    <el-carousel :interval="4000" type="card" height="400px">
      <el-carousel-item v-for="item in imgList" :key="item">
        <img :src="item" class="carousel-img" />
      </el-carousel-item>
    </el-carousel>
    <div class="photo-manager">
      <!--      <div class="photo-manager-content">-->
      <el-card class="photo-manager-content">
        <div class="photo-manager-content-search">
          <div class="photo-manager-content-search-left">
            <el-input
              v-model="input2"
              style="width: 240px; border-radius: 10px"
              placeholder="Please Input"
              :suffix-icon="Search"
            />
            <div @click="handleCreate">
              <SvgIcon icon="create" size="40px" />
            </div>
          </div>

          <div class="photo-manager-content-search-right">
            <el-switch
              v-model="value1"
              class="mb-2"
              active-text="相册视图"
              inactive-text="相片视图"
            />
          </div>
        </div>
        <div class="photo-manager-content-list">
          <PhotoAlbumItem v-for="item in 20" :key="item" />
        </div>
        <div class="photo-manager-content-page">
          <el-pagination
            v-model:current-page="currentPage2"
            v-model:page-size="pageSize2"
            :page-sizes="[100, 200, 300, 400]"
            :size="size"
            :disabled="disabled"
            :background="background"
            layout="sizes, prev, pager, next"
            :total="1000"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
      <!--      </div>-->
    </div>
  </div>
</template>

<style scoped lang="scss">
.carousel-img {
  width: 100%; /* 使图片宽度为100% */
  height: 100%; /* 使图片高度为100% */
  object-fit: cover; /* 保持比例填充容器 */
}

#photo-manager {
  .photo-manager {
    display: flex;
    justify-content: center;

    &-content {
      margin-top: 10px;
      background-color: #fefcfc;
      max-width: 1280px;
      width: 100%;
      height: auto;
      border-radius: 20px;

      &-search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f0f2f5;
        border-radius: 10px;

        &-left {
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 10px;
        }

      }

      &-list {
        width: 92%;
        margin: 0 auto;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 30px;
        display: flex;
        justify-content: left;
        align-items: center;
        flex-wrap: wrap;
        column-gap: 20px;
        row-gap: 25px;
      }

      &-page {
        display: flex;
        align-items: center;
        justify-content: right;
        margin: 20px 20px 0 0;
      }
    }
  }
}
</style>
