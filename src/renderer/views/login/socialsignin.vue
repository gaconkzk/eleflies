<template lang="pug">
  .social-signup-container
    .sign-btn(@click="tmaHandleClick('TMA')") <span class="wx-svg-container"><svg-icon icon-class="wechat" class="icon"></svg-icon></span> TMA Solution
    // .sign-btn(@click="tencentHandleClick('tencent')") <span class="qq-svg-container"><svg-icon icon-class="qq" class="icon"></svg-icon></span> QQ
</template>

<script>
import openWindow from '@/utils/openWindow'

export default {
  name: 'social-signin',
  methods: {
    tmaHandleClick(thirdpart) {
      // this.$store.commit('SET_AUTH_TYPE', thirdpart)
      // const appid = 'xxxxx'
      // const redirectUri = encodeURIComponent('xxx/redirect?redirect=' + window.location.origin + '/authredirect')
      const url = 'https://access.tma.com.vn/cas/login?service=https%3A%2F%2Fintranet.tma.com.vn%2F'
      openWindow(url, thirdpart, 540, 540)
    }
    // },
    // tencentHandleClick(thirdpart) {
    //   this.$store.commit('SET_AUTH_TYPE', thirdpart)
    //   const clientId = 'xxxxx'
    //   const redirectUri = encodeURIComponent('xxx/redirect?redirect=' + window.location.origin + '/authredirect')
    //   const url = 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=' + redirectUri
    //   openWindow(url, thirdpart, 540, 540)
    // }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .social-signup-container {
    margin: 20px 0;
    .sign-btn {
      display: inline-block;
      cursor: pointer;
    }
    .icon {
      color: #fff;
      font-size: 30px;
      margin-top: 6px;
    }
    .wx-svg-container,
    .qq-svg-container {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding-top: 1px;
      border-radius: 4px;
      margin-bottom: 20px;
      margin-right: 5px;
    }
    .wx-svg-container {
      background-color: #8dc349;
    }
    .qq-svg-container {
      background-color: #6BA2D6;
      margin-left: 50px;
    }
  }
</style>
