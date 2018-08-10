import Cookies from 'js-cookie'

const kafka_connect = {
  state: {
    clusters: JSON.parse(Cookies.get('clusters') || '[]')
  },
  mutations: {
    ADD_CLUSTER: (state, cluster) => {
      let clusters = JSON.parse(Cookies.get('clusters') || '[]')
      clusters.push(cluster)

      state.clusters = clusters
      Cookies.set('clusters', clusters)
    },
    REMOVE_CLUSTER: (state, cluster) => {
      let clusters = JSON.parse(Cookies.get('clusters') || '[]')
      if (!clusters.length) {
        return
      }
      clusters = clusters.filter(c => c.url !== cluster.url && c.name !== cluster.name)

      if (clusters.length) {
        Cookies.set('clusters', clusters)
      } else {
        Cookies.remove('clusters')
      }
      state.clusters = clusters
    }
  },
  actions: {
    addCluster({commit}, cluster) {
      commit('ADD_CLUSTER', cluster)
    },
    removeCluster({commit}, cluster) {
      commit('REMOVE_CLUSTER', cluster)
    }
  }
}

export default kafka_connect
