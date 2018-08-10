import { timeoutPromise } from '@/utils/timeout-promise'
import xrequest from '@/utils/xrequest'

export function serviceStatus(base_urls, ms) {
  let url = base_urls.split(',')[0]
  url = url.startsWith('http') ? url : 'http://' + url
  return timeoutPromise(ms, xrequest({
    url,
    method: 'get'
  }))
}
