<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col.item(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header")
            span(v-loading="loading") {{totals}} connectors
            el-button(style="float:right; padding: 3px 0" type="text" @click="addConnectorDialogVisible = true") NEW

          .clearfix
          connectors(:connectors="connectors")

      el-col.item(:xs="24" :sm="24" :lg="12")
        connector-summary(:connectors="connectors" :name="($route.params.name || '').toUpperCase()")
      
    el-dialog(
      title="Add Connector"
      :visible.sync="addConnectorDialogVisible"
      width="70%"
    )
      add-connector(:cluster="cluster")
      span(slot="footer")
        el-button(@click="addConnectorDialogVisible = false") Cancel
        el-button(type="primary" @click="addConnectorDialogVisible = false") Confirm
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import JsonEditor from '@/components/JsonEditor'
import Connectors from './components/Connectors'
import ConnectorSummary from './components/ConnectorSummary'
import AddConnector from './components/AddConnector'
import { setTimeout, clearTimeout } from 'timers'

import {
  getClusters,
  calculateTasksStatus
} from '@/utils/cluster'

import { timeoutPromise } from '@/utils/timeout-promise'
import { fetchList, fetchConnectorInfo, fetchConnectorStatus } from '@/api/kafka-connect'

export default {
  name: 'clusterDetail',
  components: { GithubCorner, Connectors, ConnectorSummary, AddConnector, JsonEditor },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cluster: function() {
      return getClusters().find(v => v.name.toLowerCase() === this.$route.params.name)
    }
  },
  data() {
    return {
      totals: 0,
      defaultTimeout: 15 * 1000,
      loading: false,
      connectors: [],
      currentTimeouts: null,
      addConnectorDialogVisible: false
    }
  },
  methods: {
    syncInformation() {
      this.loading = true
      // get list of connector in the cluster
      if (this.cluster) {
        timeoutPromise(2000, fetchList(this.cluster.url))
          .then(fetchConnectorInfo.bind(null, this.cluster.url))
          .then(fetchConnectorStatus.bind(null, this.cluster.url))
          .then((data) => {
            this.loading = false
            this.totals = data.length
            this.connectors = calculateTasksStatus(data)
          })
          .catch((err) => {
            this.loading = false
            this.totals = 0
            this.connectors = []

            // Show a simple error message in 1s
            this.$message({
              message: err.message,
              type: 'error',
              duration: 1000
            })
          })
      }
    }
  },
  created() {
    this.syncInformation()
    this.currentTimeouts = setTimeout(function tick(binder) {
      binder.syncInformation()
      binder.currentTimeouts = setTimeout(tick, binder.defaultTimeout, binder)
    }, this.defaultTimeout, this)
  },
  destroyed() {
    clearTimeout(this.currentTimeouts)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .item {
    margin-bottom: 18px;
  }
}

</style>