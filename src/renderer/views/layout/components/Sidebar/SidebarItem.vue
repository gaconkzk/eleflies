<template lang="pug">
  .menu-wrapper(v-if="!item.hidden&&item.children")
      router-link(v-if="hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow" 
                  :to="resolvePath(onlyOneChild.path)")
        el-menu-item(:index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}")
          svg-icon(v-if="onlyOneChild.meta&&onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon")
          span(v-if="onlyOneChild.meta&&onlyOneChild.meta.title" slot="title") {{generateTitle(onlyOneChild.meta.title)}}
      el-submenu(v-else :index="item.name||item.path")
        template(slot="title")
          svg-icon(v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon")
          span(v-if="item.meta&&item.meta.title" slot="title") {{generateTitle(item.meta.title)}}

        template(v-for="child in item.children" v-if="!child.hidden")
          sidebar-item.nest-menu(
            :is-nest="true"
            v-if="child.children&&child.children.length>0"
            :item="child"
            :key="child.path" 
            :base-path="resolvePath(child.path)"
          )
          router-link(v-else :to="resolvePath(child.path)" :key="child.name")
            el-menu-item(:index="resolvePath(child.path)")
              svg-icon(v-if="child.meta&&child.meta.icon" :icon-class="child.meta.icon")
              span(v-if="child.meta&&child.meta.title" slot="title") {{generateTitle(child.meta.title)}}
</template>
<script>
// import path from 'path'
import { generateTitle } from '@/utils/i18n'

export default {
  name: 'SidebarItem',
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      onlyOneChild: null
    }
  },
  methods: {
    hasOneShowingChild(children) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // temp set(will be used if only has one showing child )
          this.onlyOneChild = item
          return true
        }
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    },
    resolvePath(...paths) {
      return this.basePath + '/' + paths
      // return path.resolve(this.basePath, ...paths)
    },
    generateTitle
  }
}
</script>

