import xservice from '@/utils/xrequest'
import { timeoutPromise } from '@/utils/timeout-promise'
import { omitBy, isNil } from 'lodash'

export function fetchInformation(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name,
    method: 'get'
  })
}

export function fetchConnectorPlugins(base_urls) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connector-plugins',
    method: 'get'
  })
}

export function fetchConnectorConfig(base_urls, clazz, config) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connector-plugins/' + clazz + '/config/validate',
    method: 'put',
    data: config || { "connector.class": clazz }
  })
}

function getErrorFromData(data) {
  return new Promise((resolve, reject) => {
    if (data['error_count'] === 0) {
      resolve(data)
    } else {
      reject({ name: 'Configuration Error', 
        message: data.configs.filter(c => c.value.errors.length>0)
                             .map(c => c.value.errors)
                             .join()
      })
    }
  })
}

export function validateConnectorConfig(base_urls, config) {
  let cconfig = omitBy(config, isNil)
  return fetchConnectorConfig(base_urls, cconfig['connector.class'], cconfig)
      .then(getErrorFromData)
}

export function addConnector(base_urls, config) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/',
    method: 'post',
    data: {
      name: config.name,
      config: config
    }
  })
}

export function updateConnector(base_urls, name, config) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/config',
    method: 'put',
    data: config
  })
}

export function restartTask(base_urls, name, id) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/tasks/' + id + '/restart',
    method: 'post'
  })
}

export function restartConnector(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/restart',
    method: 'post'
  })
}

export function pauseConnector(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/pause',
    method: 'put'
  })
}

export function resumeConnector(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name + '/resume',
    method: 'put'
  })
}

export function deleteConnector(base_urls, name) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return xservice({
    url: url + '/connectors/' + name,
    method: 'delete'
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
