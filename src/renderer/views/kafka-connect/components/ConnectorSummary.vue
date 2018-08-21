<template lang="pug">
  el-card
    template(slot="header")
      el-row
        span {{name}}
        .right-place
          el-button(size="small" @click="exportConfig")
            svg-icon(icon-class="export")
            |  Export
    el-row(:gutter=10 background="black")
      el-col(:xs="8" :sm="8" :lg="8")
        el-card(shadow="always" align="center") {{connectors.filter(c => c.type === 'source').length}} SOURCES
      el-col(:xs="8" :sm="8" :lg="8")
        el-card(shadow="always" align="center") {{connectors.filter(c => c.type === 'sink').length}} SINKS
      el-col(:xs="8" :sm="8" :lg="8")
        el-card(shadow="always" align="center") {{uniqueTopics(connectors).length}} TOPICS

    el-row
      .chart-wrapper
        sankey-chart(:data="{ 'nodes': calNodes(connectors), 'links': calLinks(connectors) }")
</template>

<script>
import SankeyChart from './SankeyChart'

import {
  uniqueTopics
} from '@/utils/cluster'

import {
  calNodes,
  calLinks
} from '@/utils/charts'

export default {
  components: { SankeyChart },
  props: {
    name: {
      type: String,
      default: ''
    },
    connectors: {
      type: Array,
      default: []
    }
  },
  methods: {
    calNodes,
    calLinks,
    uniqueTopics,
    exportConfig() {
      this.$notify({
            title: 'Not Implemented',
            message: 'This feature not implemented yet... Please help',
            type: 'info',
            duration: 2000
          })
    }
  }
}
</script>

<style scoped>
.right-place {
  float: right;
  margin-top: 5px;
  margin-bottom: 5px;
}

.chart-wrapper {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 32px;
}
</style>
