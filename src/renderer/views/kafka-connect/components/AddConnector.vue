<template lang="pug">
  el-col
    el-row(style="margin-bottom: 10px")
      el-autocomplete.inline-input(placeholder="Available connectors" :fetch-suggestions="getConnectorPlugin"
        v-model="state4" @select="handleSelect" value-key="name"
        clearable
      )
        template(slot-scope="{ item }")
          //- el-tooltip(:hide-after="3000")
            //- div(slot="content") 
              span Description: {{item.description}}
              br
              span Class: {{item.class}}
          el-row(:gutter=2)
            el-col(:xs="4" :sm="4" :lg="4")
              img.circle(:src="item.icon" width="25px" height="25px")
            el-col(:xs="12" :sm="12" :lg="12" align="right")
              el-tag {{ item.name || 'unknown' }}
            el-col(:xs="8" :sm="8" :lg="8")
              .value {{ item.type }}
          el-row(:gutter=5)
            i.value Author: {{ item.author || 'unknown' }}
          hr
              
    el-row(style="margin-bottom: 10px")
      el-tabs(v-model="activeConfigType" @tab-click="handleTabClick")
        el-tab-pane(label="Json" name="json")
          .editor-container
            json-editor(v-model="form.config" ref="jsonEditor")
        el-tab-pane(label="Properties" name="properties") N/A
        el-tab-pane(label="Yaml" name="yaml") N/A
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import {
  fetchConnectorPlugins,
  fetchConnectorConfig,
  addConnector,
  validateConnectorConfig
} from '@/api/kafka-connect'
import { getTemplate, generateJsonConfig } from '@/utils/cluster'

export default {
  components: { JsonEditor },
  props: {
    cluster: {
      type: Object,
      default: () => { return {} }
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
      activeConfigType: 'json',
      timeout: null
    }
  },
  created() {
    if (this.cluster) {
      fetchConnectorPlugins(this.cluster.url).then(data => {
        this.plugins = data.map(d => (getTemplate(d.class) || d))
      }).catch(err => console.error(err))
    }
  },
  methods: {
    execute() {
      validateConnectorConfig(this.cluster.url, JSON.parse(this.form.config))
        .then(addConnector.bind(null, this.cluster.url, JSON.parse(this.form.config)))
        .then(() => {
          console.log('ok, runit')
          this.$emit("successed", "Connector added")
        })
        .catch(err => this.$emit("failed", err))

      // addConnectorPlugin(this.cluster.url, this.form.config)
      //   .then((data) => {
      //     this.$emit("successed", "Connector added")
      //     console.log(data)
      //   })
      //   .catch(err => console.error(err))
    },
    handleTabClick() {
    },
    handleSelect(item) {
      fetchConnectorConfig(this.cluster.url, item.class)
        .then(data => {          
          this.form.config = Object.assign(generateJsonConfig(data.configs, data.groups), {
            "connector.class": item.class
          })
        })
        .catch(err => console.log('error', err))
    },
    getConnectorPlugin(qstr, cb) {
      let results = this.plugins.filter(p => ((p.class || '').toLowerCase().includes((qstr || '').toLowerCase())) ||
        (p.name || '').toLowerCase().includes((qstr || '').toLowerCase()))

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
