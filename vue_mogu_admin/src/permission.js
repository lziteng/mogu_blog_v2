import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权

const whiteList = ['/login'] // 不重定向白名单
let activeList = ["/", "/dashboard"]

router.beforeEach((to, from, next) => {

  //像白名单中添加内容
  if (store.getters.menu.sonList) {
    let sonList = store.getters.menu.sonList
    for (var a = 0; a < sonList.length; a++) {
      activeList.push(sonList[a].url)
    }
  }

  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })

        // store.dispatch('GetMenu').then(res => { // 菜单信息
        //   next()
        // }).catch((err) => {
        //   store.dispatch('FedLogOut').then(() => {
        //     Message.error(err || 'Verification failed, please login again')
        //     next({ path: '/' })
        //   })
        // })

      } else {
        console.log(to.path)
        if (activeList.indexOf(to.path) !== -1) {
          // console.log("在", activeList)
          next()
        } else {
          store.dispatch('FedLogOut').then(() => {
            // console.log("不在", activeList)
            next({ path: '/' })
          })
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
