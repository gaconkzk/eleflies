<template lang="pug">
  el-form(ref="form" :model="form" label-width="90px")
    el-form-item(label="JSON Config")
      .editor-container
        json-editor(v-model="form.config" ref="jsonEditor")
  //- el-row(:gutter=10)
    el-col(:xs="24" :sm="12" :lg="12")
      span Sources
      el-card(v-for = "plugin in sources" :key="plugin.class")
        span {{ getItem(plugin.class).name }}
        img(:src="getItem(plugin.class).icon" width="30px" height="30px") 
    el-col(:xs="24" :sm="12" :lg="12")
      span Sinks
      el-card(v-for = "plugin in sinks")
        span {{ getItem(plugin.class).name }}
        img(:src="getItem(plugin.class).icon" width="30px" height="30px") 
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { fetchConnectorPlugins } from '@/api/kafka-connect'
import { supportedConnectorsTemplates } from '@/utils/cluster'
export default {
  components: { JsonEditor },
  props: {
    cluster: {
      type: Object,
      default: {}
    }
  },
  computed: {
    sources: function() {
      return this.plugins.filter(p => p.type === 'source')
    },
    sinks: function() {
      return this.plugins.filter(p => p.type === 'sink')
    }
  },
  data() {
    return {
      form: {
        config: {}
      },
      plugins: []
    }
  },
  created() {
    if (this.cluster) {
      fetchConnectorPlugins(this.cluster.url).then(data => {
        this.plugins = data
      }).catch(err => console.err(err))
    }
  },
  methods: {
    getItem(clz) {
      return supportedConnectorsTemplates.find(s => s.class === clz)
    }
  }
}
</script>

<style scoped>
.editor-container{
  position: relative;
  height: 100%;
}
</style>
