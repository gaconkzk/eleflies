import Cookies from 'js-cookie'

const Clusters = 'clusters'

export function getClusters () {
  return Cookies.getJSON(Clusters) || []
}
