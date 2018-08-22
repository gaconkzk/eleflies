import { ElectronStorage } from 'tedb-electron-storage'
import { Datastore } from 'tedb'

const ClusterStorage = new ElectronStorage('eleflies', 'cluster')
let ClusterDatastore = new Datastore({storage: ClusterStorage})

export async function fetchClusters() {
  return ClusterDatastore.find().exec()
}

export function saveCluster(cluster) {
  return ClusterDatastore.insert(cluster)
}

export function updateCluster(cluster) {
  return ClusterDatastore.update({name: cluster.name}, {$set: {"url": cluster.url}}, )
}

export function removeCluster(cluster) {
  return ClusterDatastore.remove(cluster)
}