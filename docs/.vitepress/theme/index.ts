import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
import PagesDeployments from './components/PagesDeployments.vue'
import ScarpCommandFinder from './components/ScarpCommandFinder.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('PagesDeployments', PagesDeployments)
    ctx.app.component('ScarpCommandFinder', ScarpCommandFinder)
  }
}

export default theme
