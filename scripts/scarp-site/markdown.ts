import MarkdownIt from 'markdown-it'
import { parse as parseYaml } from 'yaml'
import { documentationHeadingSlug } from '../lib/docs-slug.ts'
import { escapeHtml, localLink } from './routes.ts'

export interface HomeAction { theme?: string; text: string; link: string }
export interface HomeFeature { title: string; details: string; link: string }
export interface FrontMatter {
  layout?: string
  title?: string
  titleTemplate?: string
  hero?: {
    name?: string; text?: string; tagline?: string
    image?: { src?: string; alt?: string }
    actions?: HomeAction[]
  }
  features?: HomeFeature[]
}

export interface RenderedPage {
  title: string
  html: string
  bodyText: string
  headings: Array<{ id: string; title: string; level: number }>
  frontmatter: FrontMatter
}

export function splitFrontMatter(markdown: string): {matter: FrontMatter; content: string} {
  const source = markdown.replace(/^\uFEFF/, '')
  if (!source.startsWith('---\n')) return {matter:{}, content:source}
  const end = source.indexOf('\n---\n', 4)
  if (end === -1) throw new Error('Unclosed YAML front matter')
  const raw = parseYaml(source.slice(4, end))
  if (raw !== null && (typeof raw !== 'object' || Array.isArray(raw))) {
    throw new TypeError('Documentation front matter must be a YAML object')
  }
  return {matter:(raw ?? {}) as FrontMatter,content:source.slice(end+5)}
}

/**
 * Translate trusted VitePress-style callout *syntax*, not arbitrary source HTML.
 * All normal Markdown is parsed with html:false so a Markdown contribution
 * cannot embed script tags, handlers or HTML event attributes.
 */
function containers(source: string): {
  markdown: string; trusted: Map<string,string>
} {
  const trusted = new Map<string,string>()
  const stack: string[] = []
  let counter=0
  const lines = source.split('\n')
  const output: string[] = []
  for (const line of lines) {
    const open = /^::: (tip|info|warning|danger|note|details)(?:\s+(.*))?\s*$/.exec(line)
    if (open) {
      const kind = open[1]
      const name = (open[2] ?? kind).trim()
      const token = 'SCARPTRUSTEDBLOCK'+counter+++'TOKEN'
      const element = kind === 'details'
        ? '<details class="scarp-callout"><summary>'+escapeHtml(name)+'</summary>'
        : '<aside class="scarp-callout scarp-'+kind+'"><strong>'+escapeHtml(name)+'</strong>'
      trusted.set(token,element)
      stack.push(kind)
      output.push('',token,'')
      continue
    }
    if (/^:::\s*$/.test(line) && stack.length) {
      const kind=stack.pop()
      const token = 'SCARPTRUSTEDBLOCK'+counter+++'TOKEN'
      trusted.set(token,kind==='details'?'</details>':'</aside>')
      output.push('',token,'')
      continue
    }
    output.push(line)
  }
  if (stack.length) throw new Error('Unclosed Markdown callout container')
  return {markdown:output.join('\n'),trusted}
}

function highlightScarp(raw: string): string {
  // Lex on the raw text BEFORE escaping: highlighted spans never wrap entities.
  const tokens = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:bind|var|funcra|pure|if|elif|else|while|repeat|break|continue|return|needs|ensures|import|as|pub|true|false|integer|float|boolean|string|vector|integers|tile|unit)\b|\b\d+(?:\.\d+)?\b)/g
  let out='', previous=0
  for (const match of raw.matchAll(tokens)) {
    const index=match.index
    out+=escapeHtml(raw.slice(previous,index))
    const value=match[0]
    const type=value.startsWith('//')?'comment':value.startsWith('"')?'string':
      /^\d/.test(value)?'number':'keyword'
    out+='<span class="syntax-'+type+'">'+escapeHtml(value)+'</span>'
    previous=index+value.length
  }
  return out+escapeHtml(raw.slice(previous))
}

function widgetPlaceholders(source: string): {markdown:string;trusted:Map<string,string>} {
  const trusted=new Map<string,string>()
  const widgets: Array<[RegExp,string,string]> = [
    [/<ScarpCommandFinder\s*\/>/g,'SCARPWIDGETCOMMANDS','<section class="command-finder" data-command-finder aria-live="polite"></section>'],
    [/<PagesDeployments\s*\/>/g,'SCARPWIDGETDEPLOYMENTS',
      '<section class="deployments" data-deployments><p>GitHub Pages deployment history is available from <a href="https://github.com/scarp-lang/scarp-docs/actions/workflows/pages.yml">GitHub Actions</a>.</p><button type="button" data-load-deployments>Load deployment count</button><output aria-live="polite"></output></section>']
  ]
  let markdown=source
  for (const [pattern,token,html] of widgets) {
    if (pattern.test(markdown)) {
      trusted.set(token,html)
      markdown=markdown.replace(pattern,'\n'+token+'\n')
    }
  }
  return {markdown,trusted}
}

export function renderMarkdown(markdown: string, source: string): RenderedPage {
  const {matter,content} = splitFrontMatter(markdown)
  const headings: RenderedPage['headings'] = []
  const anchorCounts=new Map<string,number>()
  const renderer=new MarkdownIt({html:false,linkify:true,typographer:false,breaks:false})
  const previousLink=renderer.renderer.rules.link_open
  renderer.renderer.rules.link_open=(tokens,i,opts,env,self)=>{
    const token=tokens[i]
    const raw=token.attrGet('href')
    if (raw) {
      const next=localLink(raw,source)
      token.attrSet('href',next)
      if (/^https?:\/\//.test(next)) {
        token.attrSet('rel','noopener noreferrer')
      }
    }
    return previousLink
      ? previousLink(tokens,i,opts,env,self)
      : self.renderToken(tokens,i,opts)
  }
  renderer.renderer.rules.image=(tokens,i,opts,env,self)=>{
    const token=tokens[i]
    const src=token.attrGet('src')
    if (src) token.attrSet('src',localLink(src,source))
    token.attrSet('loading','lazy')
    return self.renderToken(tokens,i,opts)
  }
  renderer.renderer.rules.heading_open=(tokens,i,opts,env,self)=>{
    const token=tokens[i]
    const inline=tokens[i+1]
    const title=(inline?.children??[]).map(child=>child.type==='image'
      ?child.content:(child.type==='text'||child.type==='code_inline'?child.content:'')).join('').trim()
    const base=documentationHeadingSlug(title)||'section'
    const number=anchorCounts.get(base)??0
    anchorCounts.set(base,number+1)
    const id=number?base+'-'+number:base
    token.attrSet('id',id)
    headings.push({id,title,level:Number(token.tag.slice(1))})
    return self.renderToken(tokens,i,opts)
  }
  renderer.renderer.rules.table_open=(tokens,i,opts,env,self)=>{
    return '<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable documentation table">'+
      self.renderToken(tokens,i,opts)
  }
  renderer.renderer.rules.table_close=(tokens,i,opts,env,self)=>
    self.renderToken(tokens,i,opts)+'</div>'
  renderer.renderer.rules.fence=(tokens,i)=>{
    const token=tokens[i]
    const lang=token.info.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase()
    const rendered=lang==='scarp'||lang==='srp'
      ?highlightScarp(token.content):escapeHtml(token.content)
    return '<pre class="code-block" tabindex="0"><code class="language-'+lang+'">'+rendered+'</code></pre>\n'
  }
  // Compiler provenance markers remain in Markdown source for CI, but must
  // not be exposed as escaped HTML comments in the rendered user page.
  const visibleContent=content.replace(/<!--[\s\S]*?-->/g,'')
  const widgets=widgetPlaceholders(visibleContent)
  const blocks=containers(widgets.markdown)
  let html=renderer.render(blocks.markdown)
  const placeholders=new Map([...widgets.trusted,...blocks.trusted])
  for (const [token, trusted] of placeholders) {
    html=html.replaceAll('<p>'+token+'</p>',trusted)
  }
  // Trust no raw author HTML: only the explicitly handled widget/callout tags
  // are ever injected AFTER markdown-it's HTML-escaping parse.
  const firstHeading=headings.find(h=>h.level===1)
  const title=matter.title??firstHeading?.title??'Scarp'
  const bodyText=content.replace(/<[^>]+>/g,' ')
    .replace(/[#*_\x60~|]/g,' ').replace(/\s+/g,' ').trim()
  return {title,html,bodyText,headings,frontmatter:matter}
}
