import timeoutPromise from './timeout-promise'
import xrequest from './xrequest'

export function serviceStatus(base_urls, ms) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return timeoutPromise(ms, xrequest({
    url,
    method: 'get'
  }))
}
