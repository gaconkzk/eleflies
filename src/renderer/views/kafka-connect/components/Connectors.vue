<template lang="pug">
  el-table(:data="connectors" @row-click="handleRowClick")
    el-table-column(label="Status")
      template(slot-scope="scope")
        el-tag.bditem(size="small" :type="state2Tag(scope.row.connector.state)") {{scope.row.connector.state}}
    el-table-column(label="Name")
      template(slot-scope="scope")
        el-tag.bditem(size="small" style="cursor:pointer") {{scope.row.name}}
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
</template>

<script>
import { state2Tag, connectorTagType, connectorType } from '@/utils/cluster'

export default {
  props: {
    connectors: {
      type: Array,
      default: []
    },
    cluster: {
      type: Object,
      default: null
    }
  },
  methods: {
    state2Tag,
    connectorType,
    connectorTagType,
    handleRowClick(row, _, column) {
      if (column.label==='Name') {
        this.$emit('itemClick', row)
      }
    }
  }
}
</script>

<style scoped>
.bditem {
  margin-top: 10px;
  margin-right: 40px;
}
</style>
