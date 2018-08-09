import Cookies from 'js-cookie'

const kafka_connect = {
  state: {
    clusters: Cookies.get('clusters')
  },
  mutations: {
    ADD_CLUSTER: (state, cluster) => {
      if (!state.clusters) {
        state.clusters = []
      }
      state.clusters.push(cluster)
      Cookies.set('clusters', state.clusters)
    },
    REMOVE_CLUSTER: (state, cluster) => {
      if (!state.clusters) {
        return
      }

      state.clusters = state.clusters.filter(c => c.url !== cluster.url)

      if (state.clusters.length) {
        Cookies.set('clusters', state.clusters)
      } else {
        Cookies.remove('clusters')
      }
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
