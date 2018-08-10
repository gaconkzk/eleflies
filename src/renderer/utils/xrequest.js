import axios from 'axios'
// import { Message, MessageBox } from 'element-ui'
// import store from '../store'

const xservice = axios.create({
//   baseURL: process.env.BASE_API,
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
  response => {
    return response.data
    // const res = response.data
    // if (!res) {
    //   return Promise.reject(new Error('data not existed'))
    // }
    // if (res.code !== 200) {
    //   // Message({
    //   //   message: res.message,
    //   //   type: 'error',
    //   //   duration: 5 * 1000
    //   // })

    //   // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //   //   MessageBox.confirm('What the fuck', 'fffck', {
    //   //     confirmButtonText: 'OK',
    //   //     cancelButtonText: 'Cancel',
    //   //     type: 'warning'
    //   //   }).then(() => {
    //   //     store.dispatch('FedLogOut').then(() => {
    //   //       location.reload()
    //   //     })
    //   //   })
    //   // }
    //   return Promise.reject(new Error('Error with code' + res.code))
    // } else {
    //   console.log(response)
    //   return Promise.resolve(res)
    // }
  },
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

    // Message({
    //   message: msg.text,
    //   type: msg.type,
    //   duration: msg.duration
    // })

    return Promise.reject(error)
  }
)

export default xservice
