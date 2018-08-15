<template>
  <div :class='className' :style='{height:height,width:width}'></div>
</template>

<script>
import echarts from 'echarts'
import { debounce } from '@/utils'

require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    data: {
      type: Object,
      default: []
    }
  },
  watch: {
    data: function(newVal, oldVal) {
      this.updateChart(newVal)
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHanlder)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: (params, ticket, callback) => {
            return params.data.tooltip || params.data.value + ' tasks'
          }
        },
        series: [{
          type: 'sankey',
          layout: 'none',
          data: this.data.nodes,
          links: this.data.links,
          animation: false,
          focusNodeAdjacency: 'allEdges',
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: '#aaa'
            }
          },
          lineStyle: {
            normal: {
              curveness: 0.5
            }
          }
        }]
      })
    },
    updateChart(data) {
      this.chart.setOption({
        series: [{
          type: 'sankey',
          layout: 'none',
          data: data.nodes,
          links: data.links,
          animation: false,
          focusNodeAdjacency: 'allEdges',
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: '#aaa'
            }
          },
          lineStyle: {
            normal: {
              curveness: 0.5
            }
          }
        }]
      })
    }
  }
}
</script>
