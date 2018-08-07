<template lang="pug">
  cluster-detail(:is-edit='false')
</template>

<script>
import ClusterDetail from './components/ClusterDetail'

export default {
  name: 'createCluster',
  components: { ClusterDetail }
}
</script>
