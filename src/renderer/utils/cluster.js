import Cookies from 'js-cookie'

export function getClusters () {
  return JSON.parse(Cookies.get('clusters') || '[]')
}
