<template lang="pug">
  div
    div(style="margin-bottom:15px;") {{$t('permission.roles')}}: {{roles}}
    p {{$t('permission.switchRoles')}}:
    el-radio-group(v-model="switchRoles")
      el-radio-button(label="editor")
      el-radio-button(label="admin")
</template>

<script>
export default {
  computed: {
    roles() {
      return this.$store.getters.roles
    },
    switchRoles: {
      get() {
        return this.roles[0]
      },
      set(val) {
        this.$store.dispatch('ChangeRoles', val).then(() => {
          this.$emit('change')
        })
      }
    }
  }
}
</script>
