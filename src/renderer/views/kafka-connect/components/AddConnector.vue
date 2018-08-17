<template lang="pug">
  el-col
    el-row(style="margin-bottom: 10px")
      el-autocomplete.inline-input(placeholder="Available connectors" :fetch-suggestions="getConnectorPlugin"
        v-model="state4" @select="handleSelect" value-key="name"
        clearable
      )
        template(slot-scope="{ item }")
          el-tooltip
            div(slot="content") 
              span Description: {{item.description}}
              br
              span Class: {{item.class}}
            el-row(:gutter=2)
              el-col(:xs="4" :sm="4" :lg="4")
                img.circle(:src="item.icon" width="25px" height="25px")
              el-col(:xs="12" :sm="12" :lg="12" align="right")
                el-tag {{ item.name }}
              el-col(:xs="8" :sm="8" :lg="8")
                .value {{ item.type }}
            el-row(:gutter=5)
              i.value {{ item.author }}
              
    el-row(style="margin-bottom: 10px")
      .editor-container
        json-editor(v-model="form.config" ref="jsonEditor" :value="form.config")
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import { fetchConnectorPlugins } from '@/api/kafka-connect'
import { getTemplate } from '@/utils/cluster'
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
      plugins: [],
      state4: '',
      timeout: null
    }
  },
  created() {
    if (this.cluster) {
      fetchConnectorPlugins(this.cluster.url).then(data => {
        this.plugins = data.map(d => getTemplate(d.class))
      }).catch(err => console.err(err))
    }
  },
  methods: {
    handleSelect(item) {
      console.log(item)
    },
    getConnectorPlugin(qstr, cb) {
      let results = this.plugins.filter(p => p.class.toLowerCase().includes(qstr.toLowerCase()))

      cb(results)
    }
  }
}
</script>

<style scoped>
.editor-container{
  position: relative;
  height: 100%;
}
.value {
  text-overflow: ellipsis;
  overflow: hidden;
}
.circle {
  margin-top: 3px;
  border-radius: 50%;
}
</style>
