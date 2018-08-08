import xservice from '@/utils/xrequest'

export function fetchList(base_url, query) {
  return xservice({
    url: base_url+'/connectors',
    method: 'get',
    params: query
  })
}
