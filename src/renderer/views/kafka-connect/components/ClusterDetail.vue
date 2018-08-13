<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter=8)
      el-col(:xs="24" :sm="24" :lg="12")
        el-card
          .clearfix(slot="header" style="background-color: black")
            span {{totals}} connectors
            el-button(style="float:right; padding: 3px 0" type="text") NEW
          .text.item Search
          .text.item connector 1
        p connectors || add new
          | <br/>
          | search: <br/>
          | list first 10 connectors
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
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky'
import { validateURL } from '@/utils/validate'

const defaultForm = {
  restUrls: 'localhost:8084'
}

export default {
  name: 'clusterDetail',
  components: { GithubCorner, MDinput, Sticky },
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
      totals: 7,
      postForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        rest_url: [{ validator: validatorRestUris, trigger: 'blur' }]
      }
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
    }
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
}
</style>