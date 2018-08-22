<template lang="pug">
  .dashboard-container
    github-corner(style="position: absolute; top: 0px; border: 0; right: 0;")
    el-row(:gutter="8")
      div hello
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
export default {
  components: { GithubCorner }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
}
</style>
