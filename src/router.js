import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'top-page',
      component: () => import('./views/TopPage.vue')
    },
    {
      path: '/verify',
      name: 'verify-page',
      component: () => import('./views/Verify.vue'),
      props: route => ({ verification_id: route.query.verification_id })

    },
    {
      path: '/home',
      name: 'home-page',
      props: { default: true },
      component: () => import('./views/HomePage.vue'),
    },
    {
      path: '/profile',
      name: 'profile-page',
      component: () => import('./views/ProfilePage.vue'),
    },
    // {
    //   path: '/grading',
    //   name: 'grading',
    //   props: { default: true },
    //   component: () => import('./views/Grader.vue'),
    // },
    {
      path: '/bookmarklet',
      name: 'bookmarklet',
      props: { default: true },
      component: () => import('./views/Bookmarklet.vue'),
    }
  ]
})
