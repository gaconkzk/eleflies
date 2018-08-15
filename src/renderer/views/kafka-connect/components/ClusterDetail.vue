<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header")
            span {{totals}} connectors
            el-button(style="float:right; padding: 3px 0" type="text") NEW
          //- .item
          //-   el-autocomplete(placeholder="Search" suffix-icon="el-icon-search" v-model="searchInput"
          //-            :fetch-suggestions="querySearch" @select="handleSelect" :trigger-on-focus="false")
          //-     template(slot-scope="{ item }")
          //-       .value {{ item.name }}
          //-       span.link {{ item.url }}
          .clearfix
          el-table(:data="connectors")
            el-table-column(label="Status")
              template(slot-scope="scope")
                el-tag.bditem(size="small" :type="state2Tag(scope.row.connector.state)") {{scope.row.connector.state}}
            el-table-column(label="Name")
              template(slot-scope="scope")
                el-tag.bditem(size="small") {{scope.row.name}}
            el-table-column(label="Running Tasks" sortable 
                            :sortMethod="(r1, r2) => r1.failed.length - r2.failed.length"
                            :sortOrders="['descending']")
              template(slot-scope="scope") 
                el-badge.bditem(:value="scope.row.failed.length" :hidden="scope.row.failed.length===0")
                  el-tag(size="small" :type="scope.row.running.length===scope.row.tasks.length?'success':(scope.row.running.length===0?'danger':'warning')")
                    | {{scope.row.running.length}} / {{scope.row.tasks.length}}
            el-table-column
              template(slot-scope="scope")
                svg-icon(v-if="scope.row.type==='sink'" icon-class="kafka" size="small" style="margin-top:10px;margin-right:10px")
                el-tag(v-else size="small" width="60px"  style="margin-top:10px;margin-right:10px" :type="connectorTagType(connectorType(scope.row.config['connector.class']))") {{connectorType(scope.row.config['connector.class'])}}
                svg-icon(icon-class="right-arrow" size="small" style="margin-top:10px;margin-right:10px")
                svg-icon(v-if="scope.row.type==='source'" icon-class="kafka" size="small" style="margin-top:10px")
                el-tag(v-else size="small" width="60px"  style="margin-top:10px" :type="connectorTagType(connectorType(scope.row.config['connector.class']))") {{connectorType(scope.row.config['connector.class'])}}
              //- el-col.card-panel-icon-wrapper.icon-kafka
              //-     svg-icon(icon-class="kafka" class-name="card-panel-icon")
              //- el-col.card-panel-description
              //-   el-tag.card-panel-text {{connector.name}}
              //-   count-to.card-panel-num(:startVal="0" :endVal="connector.tasks.length" :duration="500")
              //-   count-to.card-panel-num(:startVal="0" :endVal="connector.failed.length" :duration="500")
      el-col(:xs="24" :sm="24" :lg="12")
        p connectors dashboard
          | <br/>
          | total sinks<br/>
          | total sources<br/>
          | total topics<br/>
          | connect topology<br/>
    //- p hehehe {{$route.params.name}}
    //- el-form.form-container(:model="postForm" :rules="rules" ref="postForm")
      sticky(:className="'sub-navbar draft'")
        el-button(v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm") Create
        el-button(v-loading="loading" type="warning" @click="draftForm") Clear
      .createPost-main-container
        el-row
          el-col(:span=24)
            el-form-item(style="margin-bottom: 40px" prop="rest_url")
              MDinput(name="name" v-model="postForm.rest_url" required :maxlength=100) Rest URLs
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import CountTo from 'vue-count-to'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky'
import { validateURL } from '@/utils/validate'
import { clearTimeout } from 'timers'

import { getClusters } from '@/utils/cluster'
import { fetchList, fetchInformation, fetchStatus } from '@/api/kafka-connect'

const defaultForm = {
  restUrls: 'localhost:8084'
}

export default {
  name: 'clusterDetail',
  components: { GithubCorner, MDinput, Sticky, CountTo },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validatorRestUris = (rule, value, callback) => {
      if (value) {
        let errors = value.split(',').map(url => url.trim())
          .filter(url => {
            console.log(url)
            return !validateURL(url)
          })

        if (errors.length === 0) {
          callback()
        } else {
          this.$message({
            message: 'Invalid URL format. ' + errors.join(),
            type: 'error'
          })
          callback(errors)
        }
      } else {
        callback()
      }
    }
    return {
      totals: 0,
      postForm: Object.assign({}, defaultForm),
      loading: false,
      searchInput: '',
      rules: {
        rest_url: [{ validator: validatorRestUris, trigger: 'blur' }]
      },
      connectors: [],
      timeout: null,
      currentTimeouts: null
    }
  },
  methods: {
    connectorType(clas) {
      let simpleClass = clas.substring(clas.lastIndexOf('.') + 1, clas.length)
      if (!simpleClass) {
        return clas
      }

      switch (simpleClass) {
        case 'KuduSinkConnector':
          return 'Kudu'
        case 'ReThinkSourceConnector':
        case 'ReThinkSinkConnector':
          return 'RethinkDB'
        case 'JMSSinkConnector':
          return 'JMS'
        case 'RedisSinkConnector':
          return 'Redis'
        case 'HazelCastSinkConnector':
          return 'Hazelcast'
        case 'InfluxSinkConnector':
          return 'InfluxDB'
        case 'HdfsSinkConnector':
          return 'HDFS'
        default:
          return simpleClass
      }
    },
    connectorTagType(t) {
      switch (t) {
        case 'Redis':
          return 'danger'
        case 'RethinkDB':
        case 'Hazelcast':
        case 'HDFS':
          return 'info'
        case 'JMS':
          return 'warning'
        case 'Kudu':
          return 'success'
        default:
          return ''
      }
    },
    state2Tag(state) {
      switch (state) {
        case 'RUNNING':
          return 'success'
        case 'UNASSIGNED':
          return 'info'
        case 'PAUSED':
          return 'warning'
        case 'FAILED':
          return 'danger'
        default:
          return ''
      }
    },
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: 'A',
            message: 'coba',
            type: 'success',
            duration: 2000
          })
          // this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm['rest_url'].length) {
        this.$message({
          message: 'this already cleared',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: 'cleared',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.rest_url = 'localhost:8084'
    },
    querySearch(queryString, cb) {
      let connectors = this.connectors

      let results = queryString ? connectors.filter(con => con.name.toLowerCase().includes(queryString.toLowerCase())) : connectors

      this.timeout || clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 3000 * Math.random())
    },
    handleSelect(item) {
      console.log(item)
    },
    fetchConnectorInfo(url, data) {
      let promises = data.map(connector => {
        return fetchInformation(url, connector)
      })

      return Promise.all(promises)
    },
    fetchConnectorStatus(url, data) {
      let promises = data.map(connector => {
        return Promise.all([fetchStatus(url, connector.name), connector.config])
      })

      return Promise.all(promises)
    },
    syncInformation() {
      let name = this.$route.params.name
      let cluster = getClusters().find(v => v.name.toLowerCase() === name)

      // Seem I do lot of things here - not good but I don't know other way ;(
      // I don't know how to code js properly
      // get list of connector
      if (cluster) {
        fetchList(cluster.url)
          .then(this.fetchConnectorInfo.bind(null, cluster.url))
          .then(this.fetchConnectorStatus.bind(null, cluster.url))
          .then((data) => {
            this.totals = data.length
            this.connectors = data.map(info => {
              let merged = Object.assign(info[0], { config: info[1] })

              merged.unassigned = merged.tasks.filter(task => task.state === 'UNASSIGNED')
              merged.paused = merged.tasks.filter(task => task.state === 'PAUSED')
              merged.running = merged.tasks.filter(task => task.state === 'RUNNING')
              merged.failed = merged.tasks.filter(task => task.state === 'FAILED')

              // let idx = this.connectors.findIndex(s => s.name === merged.name)
              // if (idx >= 0) {
              //   this.connectors.splice(idx, 1, merged)
              // } else {
              //   this.connectors.push(merged)
              // }

              return merged
            })
          })
          .catch((err) => console.error(err))
      }
    }
  },
  created() {
    this.syncInformation()
    this.currentTimeouts = setTimeout(function tick(binder) {
      binder.syncInformation()
      binder.currentTimeouts = setTimeout(tick, 10000, binder)
    }, 10000, this)
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
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }

  .bditem {
    margin-top: 10px;
    margin-right: 40px;
  }
  // .card-panel {
  //   height: 98px;
  //   cursor: pointer;
  //   font-size: 12px;
  //   position: relative;
  //   overflow: hidden;
  //   color: #666;
  //   background: #fff;
  //   box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
  //   border-color: rgba(0, 0, 0, .05);
  //   &:hover {
  //     .card-panel-icon-wrapper {
  //       color: #fff;
  //     }
  //     .icon-people {
  //        background: #40c9c6;
  //     }
  //     .icon-message {
  //       background: #36a3f7;
  //     }
  //     .icon-money {
  //       background: #f4516c;
  //     }
  //     .icon-shoppingCard {
  //       background: #34bfa3
  //     }
  //   }
  //   .icon-kafka {
  //     color: black;
  //   }
  //   .icon-message {
  //     color: #36a3f7;
  //   }
  //   .icon-money {
  //     color: #f4516c;
  //   }
  //   .icon-shoppingCard {
  //     color: #34bfa3
  //   }
  //   .card-panel-icon-wrapper {
  //     float: left;
  //     margin: 14px 0 0 14px;
  //     padding: 16px;
  //     transition: all 0.38s ease-out;
  //     border-radius: 6px;
  //   }
  //   .card-panel-icon {
  //     float: left;
  //     font-size: 48px;
  //   }
  //   .card-panel-description {
  //     float: right;
  //     font-weight: bold;
  //     margin: 26px;
  //     margin-left: 0px;
  //     .card-panel-text {
  //       line-height: 18px;
  //       color: rgba(0, 0, 0, 0.45);
  //       font-size: 16px;
  //       margin-bottom: 12px;
  //       margin-top: 12px;
  //     }
  //     .card-panel-num {
  //       font-size: 20px;
  //     }
  //   }
  // }
}

</style>