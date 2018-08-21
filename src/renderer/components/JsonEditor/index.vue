<template lang="pug">
  .json-editor
    textarea(ref="textarea")
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

require('jsonlint')

export default {
  name: 'jsonEditor',
  data() {
    return {
      jsonEditor: false
    }
  },
  props: {
    value: {
      type: [String, Object],
      default: {}
    },
    readOnly: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    value(value) {
      const editor_value = this.jsonEditor.getValue()
      if (value !== editor_value) {
        this.jsonEditor.setValue(JSON.stringify(this.value, null, 2))
      }
    },
    readOnly(value) {
      let oval = this.jsonEditor.getOption('readOnly')
      let rval = value === true ? 'nocursor' : false
      if (oval !== rval) {
        this.jsonEditor.setOption('readOnly', rval)
      }
    }
  },
  mounted() {
    this.jsonEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      readOnly: this.readOnly === true ? 'nocursor' : false,
      lint: true
    })

    this.jsonEditor.setValue(JSON.stringify(this.value, null, 2))
    this.jsonEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.jsonEditor.getValue()
    }
  }
}
</script>

<style scoped>
.json-editor{
  height: 100%;
  position: relative;
}
.json-editor >>> .CodeMirror {
  height: auto;
  min-height: 300px;
}
.json-editor >>> .CodeMirror-scroll{
  min-height: 300px;
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}
</style>
