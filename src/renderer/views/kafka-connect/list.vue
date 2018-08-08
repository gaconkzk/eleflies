<template lang="pug">
  .app-container
    el-table(:data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%")
      el-table-column(align="center" label="ID" width="80")
        template(slot-scope="scope")
          span {{scope.row.id}}

      el-table-column(width="180px" align="center" label="Date")
        template(slot-scope="scope")
          span {{scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}')}}

      el-table-column(width="120px" align="center" label="Author")
        template(slot-scope="scope")
          span {{scope.row.author}}

      el-table-column(width="100px" label="Importance")
        template(slot-scope="scope")
          svg-icon(v-for="n in +scope.row.importance" icon-class="star" class="meta-item__icon" :key="n")

      el-table-column(class-name="status-col" label="Status" width="110")
        template(slot-scope="scope")
          el-tag(:type="scope.row.status | statusFilter") {{scope.row.status}}

      el-table-column(min-width="300px" label="Title")
        template(slot-scope="scope")
          template(v-if="scope.row.edit")
            el-input.edit-input(size="small" v-model="scope.row.title")
            el-button.cancel-btn(size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)") cancel
          span(v-else) {{scope.row.title}}

      el-table-column(align="center" label="Actions" width="120")
        template(slot-scope="scope")
          el-button(v-if="scope.row.edit" type="success" @click="confirmEdit(scope.row)" size="small" icon="el-icon-circle-check-outline") Ok
          el-button(v-else type="primary" @click="scope.row.edit=!scope.row.edit" size="small" icon="el-icon-edit") Edit

</template>

<script>
import { fetchList } from '@/api/article'

export default {
  name: 'clusterList',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
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
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        const items = response.data.items
        this.list = items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.originalTitle = v.title //  will be used when user click the cancel botton
          return v
        })
        this.listLoading = false
      })
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'The title has been edited',
        type: 'success'
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
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
