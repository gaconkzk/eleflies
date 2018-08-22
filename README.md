# eleflies

> Dashboard

#### Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:9080
yarn dev

# build electron application for production
yarn build


# lint all JS/Vue component files in `src/`
yarn lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

This project was cloned based on [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)@[e5d4290](https://github.com/PanJiaChen/vue-element-admin/tree/e5d4290938e87d93c4df2e4b50fe513f30e59f12)

I changed a lot of things like webpack 4, upgraded electron to latest

Some features:
- Add/Edit/Remove Kafka Connect Clusters using cookies (persistance using electron-cookies + js-cookie)
- Add/Edit/Remove kafka Connect Connectors on a specific cluster
- Pause/Resume/Restart connectors or tasks of connector
