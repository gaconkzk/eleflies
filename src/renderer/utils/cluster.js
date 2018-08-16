import Cookies from 'js-cookie'

import { uniq, compact } from 'lodash'

export function getClusters () {
  return JSON.parse(Cookies.get('clusters') || '[]')
}

export function connectorType(clas) {
  let simpleClass = clas.substring(clas.lastIndexOf('.') + 1, clas.length)
  if (!simpleClass) {
    return clas
  }

  switch (simpleClass) {
    case 'KuduSinkConnector':
      return 'Kudu'
    case 'ReThinkSourceConnector':
    case 'ReThinkSinkConnector':
      return 'RethinkDB'
    case 'JMSSinkConnector':
      return 'JMS'
    case 'RedisSinkConnector':
      return 'Redis'
    case 'HazelCastSinkConnector':
      return 'Hazelcast'
    case 'InfluxSinkConnector':
      return 'InfluxDB'
    case 'HdfsSinkConnector':
      return 'HDFS'
    default:
      return simpleClass
  }
}

export function connectorTagType(t) {
  switch (t) {
    case 'Redis':
      return 'danger'
    case 'RethinkDB':
    case 'Hazelcast':
    case 'HDFS':
      return 'info'
    case 'JMS':
      return 'warning'
    case 'Kudu':
      return 'success'
    default:
      return ''
  }
}

export function state2Tag(state) {
  switch (state) {
    case 'RUNNING':
      return 'success'
    case 'UNASSIGNED':
      return 'info'
    case 'PAUSED':
      return 'warning'
    case 'FAILED':
      return 'danger'
    default:
      return ''
  }
}

export function uniqueTopics(connectors) {
  let topics = this.connectors.map(c => c.config.topics || c.config['connect.kcql.topics'])
  return compact(uniq(topics))
}

export function calculateTasksStatus(data) {
  return data.map(info => {
    let merged = Object.assign(info[0], { config: info[1] })

    merged.unassigned = merged.tasks.filter(task => task.state === 'UNASSIGNED')
    merged.paused = merged.tasks.filter(task => task.state === 'PAUSED')
    merged.running = merged.tasks.filter(task => task.state === 'RUNNING')
    merged.failed = merged.tasks.filter(task => task.state === 'FAILED')

    return merged
  })
}
