import axios from 'axios'
// import { Message, MessageBox } from 'element-ui'
// import store from '../store'

const xservice = axios.create({
  timeout: 15000,
  crossdomain: true
})

xservice.interceptors.request.use(config => {
//   if (store.getters.token) {
//     config.headers['X-Token'] = store.getters.token
//   }
  config.headers['Content-Type'] = 'application/json'
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

xservice.interceptors.response.use(
  response => response.data,
  error => {
    let msg = {
      text: 'Network Error.',
      type: 'error',
      duration: 2 * 1000
    }
    if (typeof error !== 'undefined') {
      if (error.hasOwnProperty('message')) {
        msg.text = error.message
      }
    }

    if (typeof error.response !== 'undefined') {
      if (error.response.status === 404) {
        msg.text = 'REST API invalid or unreachable'
      }
    }

    return Promise.reject(error)
  }
)

export default xservice
