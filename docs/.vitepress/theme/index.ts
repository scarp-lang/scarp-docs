import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'
import PagesDeployments from './components/PagesDeployments.vue'
import { installLocalSearchFocusReturn } from './local-search-focus'
import { installAccessibleSearchTrigger } from './search-trigger-accessibility'
import ScarpCommandFinder from './components/ScarpCommandFinder.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('PagesDeployments', PagesDeployments)
    ctx.app.component('ScarpCommandFinder', ScarpCommandFinder)
    installLocalSearchFocusReturn()
    installAccessibleSearchTrigger()
  }
}

export default theme
