<template lang="pug">
  .app-container
    el-form(ref="form" :model="form" label-width="120px" :rules="rules" )
      el-form-item(label="Name" prop="name")
        el-input(v-model="form.name")
      el-form-item(label="Endpoint:" prop="url")
        el-input(v-model="form.url")
      el-form-item
        el-button(type="primary" @click="addCluster") Add
      
    el-table(:data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%")

      el-table-column(align="center" label="Name" width="250px")
        template(slot-scope="scope")
          template(v-if="scope.row.edit")
            el-input.edit-input(size="small" v-model="scope.row.name")
          span(v-else) 
            router-link(:to="'/kafka-connect/cluster/'+scope.row.name.toLowerCase()") {{scope.row.name}}
      
      el-table-column(align="center" label="Endpoint")
        template(slot-scope="scope")
          template(v-if="scope.row.edit")
            el-input.edit-input(size="small" v-model="scope.row.url")
          span(v-else) {{scope.row.url}}
      
      el-table-column(align="center" label="Version")
        template(slot-scope="scope")
          div(v-loading="scope.row.version==='N/A'" element-loading-spinner="el-icon-loading")
            el-tag(:type="ctype(scope.row.version)") {{scope.row.version}}

      el-table-column(align="center" label="Actions" width="180")
        template(slot-scope="scope")
          el-button.cancel-btn(v-if="scope.row.edit" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)" circle)
          el-button(v-if="scope.row.edit" type="success" @click="confirmEdit(scope.row)" size="small" icon="el-icon-circle-check-outline" circle)
          el-button(v-if="scope.row.edit" size="small" icon="el-icon-delete" type="danger" @click="confirmDelete(scope.row)" circle)
          el-button(v-else type="primary" @click="scope.row.edit=!scope.row.edit" size="small" icon="el-icon-edit" circle)
</template>

<script>
// import { fetchList } from '@/api/kafka-connect'
import { getClusters } from '@/utils/cluster'
import { validateURL } from '@/utils/validate'
import { serviceStatus } from '@/api/service-status'
import { setTimeout, clearTimeout } from 'timers'

export default {
  name: 'clusterList',
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        let errMsg = rule.field + ' is required'
        callback(errMsg)
      } else {
        callback()
      }
    }
    const validateRestUris = (rule, value, callback) => {
      if (value) {
        let errors = value.split(',').map(url => url.trim())
          .filter(url => {
            return !validateURL(url)
          })

        if (errors.length === 0) {
          callback()
        } else {
          let errMsgs = 'Invalid URL format. ' + errors.join()
          callback(errMsgs)
        }
      } else {
        callback()
      }
    }
    return {
      list: null,
      total: 0,
      listLoading: true,
      dialogVisible: false,
      currentTimeouts: {},
      listQuery: {
        page: 1,
        limit: 10
      },
      form: {
        name: '',
        url: ''
      },
      rules: {
        name: [{ validator: validateRequire }],
        url: [{ validator: validateRequire }, { validator: validateRestUris, trigger: 'blur' }]
      }
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  created() {
    this.getList()
    this.updateStatus()

    this.currentTimeouts = setTimeout(function tick(binder) {
      binder.updateStatus()
      binder.currentTimeouts = setTimeout(tick, 5000, binder)
    }, 5000, this)
  },
  destroyed() {
    clearTimeout(this.currentTimeouts)
  },
  methods: {
    ctype(version) {
      switch (version) {
        case 'N/A':
          return 'info'
        case 'Error':
          return 'danger'
        default:
          return 'success'
      }
    },
    getList() {
      this.listLoading = true

      this.list = getClusters().map(v => {
        this.$set(v, 'edit', false)
        v.originalName = v.name
        v.originalUrl = v.url

        // TODO update this
        this.$set(v, 'version', 'N/A')

        return v
      })

      this.listLoading = false
    },
    updateStatus() {
      // working
      let data = (this.list || [])
      let bclass = this

      data.forEach(it => serviceStatus(it.url, 2000)
        .then((v) => {
          // console.log(v)
          bclass.$set(it, 'version', v.version)
        }).catch(() => {
          bclass.$set(it, 'version', 'Error')
        })
      )
    },
    cancelEdit(row) {
      row.url = row.originalUrl
      row.name = row.originalName
      row.edit = false
      this.$message({
        message: 'The data has been restored',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      this.$store.dispatch('addCluster', { url: row.url, name: row.name })
        .then(() => {
          row.edit = false
          row.originalUrl = row.url
          row.originalName = row.name
          this.$message({
            message: 'The data has been edited',
            type: 'success'
          })
        })
        .catch((err) => {
          row.edit = false
          this.url = row.originalUrl
          this.name = row.originalName
          this.$message({
            message: 'Failed updating data. ' + err.message,
            type: 'error'
          })
        })
    },
    confirmDelete(row) {
      this.$confirm(`This will permanently delete \`${row.name}\`. Continue?`, 'Danger', {
        type: 'error'
      })
        .then(_ => {
          this.$store.dispatch('removeCluster', { url: row.url })
            .then(() => {
              row.edit = false
              this.getList()
              this.$message({
                message: 'The data has been removed',
                type: 'success'
              })
            })
            .catch((err) => {
              row.edit = false
              this.$message({
                message: 'Failed removing data. ' + err.message,
                type: 'error'
              })
            })
        })
        .catch(_ => { console.log(' canceled ') })
    },
    addCluster() {
      this.$refs.form.validate(valid => {
        let existed = getClusters().filter(it => it.url === this.form.url)
        console.log(existed)
        if (valid && !existed.length) {
          this.loading = true
          this.$store.dispatch('addCluster', { name: this.form.name, url: this.form.url })
            .then(() => {
              this.loading = false
              this.getList()
              this.$notify({
                title: 'Successed',
                message: 'Cluster added successfully!',
                type: 'success',
                duration: 2000
              })
            })
            .catch((err) => {
              this.loading = false
              this.$message({
                message: 'Failed adding new cluster. ' + err.message,
                type: 'error'
              })
              return false
            })
        } else {
          this.loading = false
          this.$message({
            message: 'Cluster url already existed.',
            type: 'error'
          })
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  /* position: absolute; */
  right: 15px;
  top: 10px;
}
</style>
