<template lang="pug">
  cluster-detail(:is-edit='true')
</template>

<script>
import ClusterDetail from './components/ClusterDetail'

export default {
  name: 'editCluster',
  components: { ClusterDetail }
}
</script>
