<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header")
            span {{totals}} connectors
            el-button(style="float:right; padding: 3px 0" type="text") NEW
          .item
            el-autocomplete(placeholder="Search" suffix-icon="el-icon-search" v-model="searchInput"
                     :fetch-suggestions="querySearch" @select="handleSelect" :trigger-on-focus="false")
              template(slot-scope="{ item }")
                .value {{ item.name }}
                span.link {{ item.url }}
          .clearfix
          .item(v-for="connector in connectors")
            .card-panel
              .card-panel-icon-wrapper.icon-kafka
                svg-icon(icon-class="kafka" class-name="card-panel-icon")
              .card-panel-description
                el-tag.card-panel-text {{connector.name}}
                count-to.card-panel-num(:startVal="0" :endVal="connector.tasks.length" :duration="500")
                count-to.card-panel-num(:startVal="0" :endVal="connector.failed.length" :duration="500")
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
    syncInformation() {
      let name = this.$route.params.name
      let cluster = getClusters().find(v => v.name.toLowerCase() === name)

      // Seem I do lot of things here - not good but I don't know other way ;(
      // I don't know how to code js properly
      // get list of connector
      if (cluster) {
        fetchList(cluster.url)
          .then((data) => {
            // total
            this.totals = data.length
            data.forEach(connector => {
              fetchInformation(cluster.url, connector)
                .then(info => {
                  fetchStatus(cluster.url, connector)
                    .then(status => {
                      let merged = {
                        name: status.name,
                        tasks: status.tasks,
                        connector: status.connector,
                        type: status.type,
                        config: info.config
                      }

                      merged.unassigned = merged.tasks.filter(task => task.state === 'UNASSIGNED')
                      merged.paused = merged.tasks.filter(task => task.state === 'PAUSED')
                      merged.running = merged.tasks.filter(task => task.state === 'RUNNING')
                      merged.failed = merged.tasks.filter(task => task.state === 'FAILED')

                      let idx = this.connectors.findIndex(s => s.name === status.name)
                      if (idx >= 0) {
                        this.connectors.splice(idx, 1, merged)
                      } else {
                        this.connectors.push(merged)
                      }
                    }).catch(err => console.error(err))
                }).catch(err => console.error(err))
            })

            // .map(data => {
            //   console.log(data.name)
            //   return data
            // })
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

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3
      }
    }
    .icon-kafka {
      color: black;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
        margin-top: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

</style>