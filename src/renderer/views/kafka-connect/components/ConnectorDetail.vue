<template lang="pug">
  el-card
    template(slot="header")
      el-row(:gutter="30")
        el-col(:span="6")
          h4 {{connector.name}}
        el-col(:span="11" :offset="7" align="end")
          el-button-group
            el-button(type="primary" size="small" plain @click="restartConnector") RESTART
            el-button(type="info" size="small" plain @click="pauseConnector") PAUSE
            el-button(type="success" size="small" plain @click="resumeConnector") RESUME
            el-button(type="danger" size="small" plain @click="confirmDelete") DELETE
    el-row(:gutter=10)
      el-tabs.marginalittle
        el-tab-pane(label="Status")
          el-alert(style="margin-top: 10px" :closable="false" :type="state2Alert(connector.connector.state)" :description="':P:'+connector.connector.worker_id" :title="connector.connector.state")
          el-input(style="margin-top: 10px" v-if="connector.connector.trace" type="textarea" :rows="5" v-model="connector.connector.trace")
        el-tab-pane(v-for="task in connector.tasks" :label="'T:'+task.id" :key="task.id")
          span(slot="label") Task:{{task.id}} &nbsp; &nbsp; <el-button @click.prevent="restart(task.id)" circle icon="el-icon-refresh" plain size="small"></el-button>
          el-col(style="margin-top: 10px")
            el-alert(:closable="false" :type="state2Alert(task.state)" :title="task.worker_id" :description="task.state")
          el-input(v-if="task.trace" type="textarea" :rows="5" v-model="task.trace" style="margin-top: 10px")
    el-row(:gutter=10)
      .editor-container.marginalittle
          json-editor(v-model="connector.config" ref="jsonEditor" :readOnly="onlyU")
    el-row(:gutter=10)
      el-col(:offset="16" :span="8" align="end")
        el-button.marginalittle(type="primary" icon="el-icon-edit" @click="editConfig" style="width:105px") {{this.onlyU ? 'Edit' : 'Cancel'}}
        el-button.marginalittle(type="success" icon="el-icon-edit" @click="saveConfig" style="width:105px" :disabled="onlyU" :width="75") Save
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { updateConnector, restartTask, restartConnector, resumeConnector, pauseConnector, deleteConnector } from '@/api/kafka-connect'
import { state2Alert } from '@/utils/cluster'

export default {
  components: { JsonEditor },
  props: {
    connector: {
      type: Object,
      default: []
    },
    url: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      onlyU: true
    }
  },
  methods: {
    state2Alert,
    editConfig() {
      this.onlyU = !this.onlyU
    },
    saveConfig() {
      updateConnector(this.url, this.connector.name, this.connector.config)
        .then(() => {
          this.$notify({
            title: 'Successed',
            message: `${this.connector.name} configuration updated`,
            type: 'success',
            duration: 2000
          })
          this.onlyU = true    
        })
        .catch(err => this.$message({
                message: 'Failed update the connector config. ' + err.message,
                type: 'error'
              }))
    },
    restart(id) {
      restartTask(this.url, this.connector.name, id)
        .then(() => {
          this.$notify({
            title: 'Successed',
            message: `${this.connector.name}/tasks/${id} restarting`,
            type: 'success',
            duration: 2000
          })
          this.onlyU = true    
        })
        .catch(err => this.$message({
                message: `Failed restart the task ${id} of connector ${this.connector.name}. ${err.message}`,
                type: 'error'
              }))
    },
    restartConnector() {
      restartConnector(this.url, this.connector.name)
        .then(() => {
          this.$notify({
            title: 'Successed',
            message: `${this.connector.name} restarting`,
            type: 'success',
            duration: 2000
          })
          this.onlyU = true    
        })
        .catch(err => this.$message({
                message: `Failed restart connector ${this.connector.name}. ${err.message}`,
                type: 'error'
              }))
    },
    pauseConnector() {
      pauseConnector(this.url, this.connector.name)
        .then(() => {
          this.$notify({
            title: 'Successed',
            message: `${this.connector.name} pausing`,
            type: 'success',
            duration: 2000
          })
          this.onlyU = true    
        })
        .catch(err => this.$message({
                message: `Failed temporary stop connector ${this.connector.name}. ${err.message}`,
                type: 'error'
              }))
    },
    resumeConnector() {
      resumeConnector(this.url, this.connector.name)
        .then(() => {
          this.$notify({
            title: 'Successed',
            message: `${this.connector.name} resuming`,
            type: 'success',
            duration: 2000
          })
          this.onlyU = true    
        })
        .catch(err => this.$message({
                message: `Failed resume connector ${this.connector.name}. ${err.message}`,
                type: 'error'
              }))
    },
    confirmDelete() {
      this.$confirm(`This will permanently delete '${this.connector.name}'. Continue?`, 'Danger', {
        type: 'error'
      }).then(() => {
        deleteConnector(this.url, this.connector.name)
         .then(() => {
           //
           this.$emit('deleted', `${this.connector.name} deleted`)
         })
         .catch(err => this.$emit('failed', `can't delete ${this.connector.name}. Detail: ${err.message}`))
      }).catch(() => {})
    },
  }
}
</script>

<style scoped>
.editor-container{
  position: relative;
  height: 100%;
}
.marginalittle {
  margin-bottom: 15px;
}
</style>
