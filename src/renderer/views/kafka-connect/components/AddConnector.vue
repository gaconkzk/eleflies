<template lang="pug">
  el-row(:gutter=10)
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
import { fetchConnectorPlugins } from '@/api/kafka-connect'
import { supportedConnectorsTemplates } from '@/utils/cluster'
export default {
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
