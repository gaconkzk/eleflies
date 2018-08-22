import Cookies from 'js-cookie'

export async function fetchClusters() {
  return Promise.resolve(JSON.parse(Cookies.get('clusters') || '[]'))
}

export function saveCluster(cluster) {
  let clusters = JSON.parse(Cookies.get('clusters') || '[]')
  clusters.push(cluster)

  Cookies.remove('clusters')
  Cookies.set('clusters', clusters)

  return Promise.resolve()
}

export function updateCluster(cluster) {
  let clusters = JSON.parse(Cookies.get('clusters') || '[]')
  let cls = clusters.filter(c => c.name !== cluster.name)

  Cookies.remove('clusters')
  Cookies.set('clusters', cls)

  return Promise.resolve()
}

export function removeCluster(cluster) {
  let clusters = JSON.parse(Cookies.get('clusters') || '[]')
  let cls = clusters.filter(c => c.name !== cluster.name && c.url !== cluster.url)

  Cookies.remove('clusters')
  Cookies.set('clusters', cls)

  return Promise.resolve()
}