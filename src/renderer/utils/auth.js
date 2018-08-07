import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

/**
 * TODO: We can't use js-cookie for getting/setting token electron can't use this. Need
 *       other solution
 */
export function getToken () {
  return Cookies.get(TokenKey)
}

export function setToken (token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken () {
  return Cookies.remove(TokenKey)
}
