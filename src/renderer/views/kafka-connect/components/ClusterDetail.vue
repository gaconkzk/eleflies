<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header")
            span(v-loading="loading") {{totals}} connectors
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
            el-table-column
              template(slot-scope="scope")
                el-button(size="small" icon="el-icon-delete" circle type="danger")
                //- el-button(size="small" icon="el-icon-refresh" circle)
                //- el-button(size="small" circle)
                //-   svg-icon(icon-class="pause")
                //- el-button(size="small" circle)
                //-   svg-icon(icon-class="play")
              //- el-col.card-panel-icon-wrapper.icon-kafka
              //-     svg-icon(icon-class="kafka" class-name="card-panel-icon")
              //- el-col.card-panel-description
              //-   el-tag.card-panel-text {{connector.name}}
              //-   count-to.card-panel-num(:startVal="0" :endVal="connector.tasks.length" :duration="500")
              //-   count-to.card-panel-num(:startVal="0" :endVal="connector.failed.length" :duration="500")
      el-col(:xs="24" :sm="24" :lg="12")
        el-card
          template(slot="header")
            span {{$route.params.name.toUpperCase()}}
            .right-place
              el-button
                svg-icon(icon-class="export")
                |  Export
              //- el-button RESTART
              //- el-button PAUSE
              //- el-button RESUME
          el-col(:xs="8" :sm="8" :lg="8")
            el-card(shadow="always" align="center") {{connectors.filter(c => c.type === 'source').length}} SOURCES
          el-col(:xs="8" :sm="8" :lg="8")
            el-card(shadow="always" align="center") {{connectors.filter(c => c.type === 'sink').length}} SINKS
          el-col(:xs="8" :sm="8" :lg="8")
            el-card(shadow="always" align="center") {{uniqueTopics().length}} TOPICS
        .chart-wrapper
          sankey-chart(:data="{ 'nodes': calNodes(), 'links': calLinks() }")
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
import SankeyChart from './SankeyChart'
import Sticky from '@/components/Sticky'
import { validateURL } from '@/utils/validate'
import { clearTimeout } from 'timers'

import { getClusters } from '@/utils/cluster'
import { timeoutPromise } from '@/utils/timeout-promise'
import { fetchList, fetchInformation, fetchStatus } from '@/api/kafka-connect'

import { uniq, uniqBy, compact, flatMap } from 'lodash'

const defaultForm = {
  restUrls: 'localhost:8084'
}

export default {
  name: 'clusterDetail',
  components: { GithubCorner, MDinput, Sticky, CountTo, SankeyChart },
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

      return timeoutPromise(2000, Promise.all(promises))
    },
    fetchConnectorStatus(url, data) {
      let promises = data.map(connector => {
        return Promise.all([fetchStatus(url, connector.name), connector.config])
      })

      return timeoutPromise(2000, Promise.all(promises))
    },
    syncInformation() {
      this.loading = true
      let name = this.$route.params.name
      let cluster = getClusters().find(v => v.name.toLowerCase() === name)
      // get list of connector in the cluster
      if (cluster) {
        timeoutPromise(2000, fetchList(cluster.url))
          .then(this.fetchConnectorInfo.bind(null, cluster.url))
          .then(this.fetchConnectorStatus.bind(null, cluster.url))
          .then((data) => {
            this.loading = false
            this.totals = data.length
            this.connectors = data.map(info => {
              let merged = Object.assign(info[0], { config: info[1] })

              merged.unassigned = merged.tasks.filter(task => task.state === 'UNASSIGNED')
              merged.paused = merged.tasks.filter(task => task.state === 'PAUSED')
              merged.running = merged.tasks.filter(task => task.state === 'RUNNING')
              merged.failed = merged.tasks.filter(task => task.state === 'FAILED')

              return merged
            })
          })
          .catch((err) => {
            console.error(err)
            this.totals = 0
            this.loading = false
            this.connectors = []
            this.$message({
              message: err.message,
              type: 'error',
              duration: 1000
            })
          })
      }
    },
    uniqueTopics() {
      let topics = this.connectors.map(c => c.config.topics)
      return compact(uniq(topics))
    },
    calNodes() {
      let nodes = flatMap(this.connectors, c => {
        let topics = c.config.topics || c.config['connect.kcql.topics']

        if (topics) {
          let nodes = topics.split(',').map(t => {
            return t !== '' ? {
              name: ':' + t,
              itemStyle: {
                normal: {
                  color: '#6f221b',
                  borderColor: '#2233bb'
                }
              }
            } : null
          })

          return compact(nodes).concat([{
            name: c.name,
            itemStyle: {
              normal: {
                color: c.type === 'sink' ? '#3a4f52' : '#72b3b4',
                borderColor: '#f010a0'
              }
            }
          }])
        }

        return []
      })

      return compact(uniqBy(nodes
        .concat({
          name: ' ',
          itemStyle: {
            normal: {
              color: '#ffffff',
              borderColor: '#ffffff'
            }
          }
        },
        {
          name: '  ',
          itemStyle: {
            normal: {
              color: '#ffffff',
              borderColor: '#ffffff'
            }
          }
        }),
      c => c.name))
    },
    calLinks() {
      // get source and topic of each connector
      let links = flatMap(this.connectors, c => {
        let topics = c.config.topics || c.config['connect.kcql.topics']

        if (topics) {
          let tp = topics.split(',')

          return flatMap(tp.map(t => {
            if (t !== '') {
              let topic = ':' + t
              if (c.type === 'source') {
                return [
                  {
                    source: c.name,
                    target: topic,
                    value: 1
                  },
                  {
                    source: topic,
                    target: ' ',
                    value: 0.00001,
                    lineStyle: {
                      opacity: 0
                    }
                  }
                ]
              } else {
                return [
                  {
                    source: '  ',
                    target: topic,
                    value: 0.00001,
                    lineStyle: {
                      opacity: 0
                    }
                  },
                  {
                    source: topic,
                    target: c.name,
                    value: 1
                  }
                ]
              }
            } else {
              return null
            }
          }))
        }
        return []
      })

      return compact(uniq(links))
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
}

</style>