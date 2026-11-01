import DefaultTheme from 'vitepress/theme'
import './custom.css'
import PagesDeployments from './components/PagesDeployments.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('PagesDeployments', PagesDeployments)
  }
}
