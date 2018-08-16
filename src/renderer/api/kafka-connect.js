import xservice from '@/utils/xrequest'
import { timeoutPromise } from '@/utils/timeout-promise'

export function fetchInformation(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name,
    method: 'get'
  })
}

export function fetchStatus(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/status',
    method: 'get'
  })
}

export function fetchTaskStatus(base_urls, name, task) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/tasks/' + task + '/status',
    method: 'get'
  })
}

export function fetchList(base_urls) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return timeoutPromise(2000, xservice({
    url: url + '/connectors',
    method: 'get'
  }))
}

export function fetchConnectorInfo(url, data) {
  let promises = data.map(connector => {
    return fetchInformation(url, connector)
  })

  return Promise.all(promises)
}

export function fetchConnectorStatus(url, data) {
  let promises = data.map(connector => {
    return Promise.all([fetchStatus(url, connector.name), connector.config])
  })

  return Promise.all(promises)
}
