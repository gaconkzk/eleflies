import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
// import { getToken } from '@/utils/auth'

const xservice = axios.create({
//   baseURL: process.env.BASE_API,
  timeout: 15000
})

xservice.interceptors.request.use(config => {
//   if (store.getters.token) {
//     config.headers['X-Token'] = store.getters.token
//   }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

xservice.interceptors.response.use(
  response => response,
  response => {
    const res = response.data
    if (!res) {
      Message({
        message: 'Not found',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error('error'))
    }
    if (res.code !== 20000) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm('What the fuck', 'fffck', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error('error'))
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default xservice
