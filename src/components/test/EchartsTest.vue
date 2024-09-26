<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref } from 'vue'
import MyEChart from '@/components/test/MyEcharts.vue'

const chartContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (chartContainer.value) {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(chartContainer.value)
    // 绘制图表
    myChart.setOption({
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    })
  }
})

const chartData = [
  { name: '雪糕', value: 5 },
  { name: '雪纺衫', value: 20 },
  { name: '羊毛衫', value: 36 },
  { name: '裤子', value: 10 },
  { name: '高跟鞋', value: 10 },
  { name: '袜子', value: 20 }
]
</script>

<template>
  <div ref="chartContainer" style="width: 100%; height: 400px"></div>
  <MyEChart :chart-data="chartData" />
</template>

<style scoped></style>
