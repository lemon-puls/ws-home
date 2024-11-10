<template>
  <div ref="chartContainer" style="width: 100%; height: 400px"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

interface ChartData {
  name: string
  value: number
}

export default defineComponent({
  name: 'MyEChart',
  props: {
    chartData: {
      type: Array as () => ChartData[],
      required: true
    }
  },
  setup(props) {
    const chartContainer = ref<HTMLDivElement | null>(null)
    let myChart: echarts.ECharts | null = null

    const initChart = () => {
      if (chartContainer.value) {
        myChart = echarts.init(chartContainer.value)
        const option: echarts.EChartsOption = {
          title: {
            text: 'ECharts 入门示例'
          },
          tooltip: {},
          xAxis: {
            type: 'category',
            data: props.chartData.map((item) => item.name)
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '销量',
              type: 'bar',
              data: props.chartData.map((item) => item.value)
            }
          ]
        }
        myChart.setOption(option)
      }
    }

    onMounted(() => {
      initChart()
      window.addEventListener('resize', () => myChart?.resize())
    })

    onBeforeUnmount(() => {
      if (myChart) {
        window.removeEventListener('resize', () => myChart?.resize())
        myChart.dispose()
      }
    })

    return {
      chartContainer
    }
  }
})
</script>

<style scoped></style>
