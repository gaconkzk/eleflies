<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col.item(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header")
            h3(v-loading="loading" @click.prevent="detailVisible=false" style="cursor:pointer; color: blue") {{totals}} connectors
            el-button(style="float:right; padding: 3px 0" type="text" @click="edit=false; addConnectorDialogVisible = true") NEW

          .clearfix
          connectors(:connectors="connectors" 
                     :cluster="cluster"
                     @itemClick="handleDetail")
      el-collapse-transition
        el-col.item(:xs="24" :sm="24" :lg="12" v-if="!detailVisible")
          connector-summary(:connectors="connectors" :name="($route.params.name || '').toUpperCase()")
      el-collapse-transition
        el-col.item(:xs="24" :sm="24" :lg="12" v-if="detailVisible")
          connector-detail(:connector="currentConnector" :url="cluster.url" 
                           @deleted="detailVisible = false; currentConnector = null; syncInformation()"
                           @updated="syncInformation()"
          )
      
    el-dialog(
      title="Add Connector"
      :visible.sync="addConnectorDialogVisible"
      width="70%"
    )
      add-connector(:cluster="cluster" ref="addConnector" @successed="err = null; syncInformation(); addConnectorDialogVisible = false"
        @failed="handleErr"
      )

      el-alert(v-if="error!==null" show-icon type="error" :description="error.message" :title="error.name" @close="error = null")

      span(slot="footer")        
        el-button(@click="addConnectorDialogVisible = false") Cancel
        el-button(type="primary" @click="$refs.addConnector.execute()") Confirm
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import JsonEditor from '@/components/JsonEditor'
import Connectors from './components/Connectors'
import ConnectorSummary from './components/ConnectorSummary'
import ConnectorDetail from './components/ConnectorDetail'
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
  components: { GithubCorner, Connectors, ConnectorSummary, AddConnector, JsonEditor, ConnectorDetail },
  data() {
    return {
      totals: 0,
      defaultTimeout: 15 * 1000,
      loading: false,
      connectors: [],
      currentTimeouts: null,
      addConnectorDialogVisible: false,
      detailVisible: false,
      currentConnector: null,
      error: null,
      cluster: null
    }
  },
  methods: {
    handleDetail(row) {
      this.currentConnector = Object.assign({}, row)
      this.detailVisible = true
    },
    handleErr(err) {
      this.error = err
    },
    syncInformation() {
      this.loading = true
      getClusters()
        .then(data => {
          let lname = (this.$route.params.name || '').toLowerCase()
          this.cluster = data.find(d => d.name.toLowerCase() === lname)
          // get list of connector in the cluster
          if (this.cluster) {
            timeoutPromise(2000, fetchList(this.cluster.url))
              .then(fetchConnectorInfo.bind(null, this.cluster.url))
              .then(fetchConnectorStatus.bind(null, this.cluster.url))
              .then((data) => {
                this.loading = false
                this.totals = data.length
                this.connectors = calculateTasksStatus(data)
                // reupdate currentconnector if existed
                if (this.currentConnector) {
                  this.currentConnector = Object.assign(this.currentConnector, 
                    this.connectors.find(c => c.name === this.currentConnector.name))
                }
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
        })
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