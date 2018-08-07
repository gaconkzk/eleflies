<template lang="pug">
  .app-container
    switch-roles(@change="handleRolesChange")
</template>

<script>
import SwitchRoles from './components/SwitchRoles'

export default{
  name: 'pagePermission',
  components: { SwitchRoles },
  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/permission/index?' + +new Date() })
    }
  }
}
</script>
