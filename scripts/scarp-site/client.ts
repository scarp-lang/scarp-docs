/**
 * Scarp's own browser controller. No Vue/VitePress runtime.
 * The server renders every page as plain HTML; this enhances only the search,
 * appearance, mobile menu, deployment count and release-aware CLI widget.
 */
interface SearchEntry { route: string; title: string; locale: 'en'|'hi'; section: string; excerpt: string }
interface Release { tag:string; label:string }
interface Task { id:string; en:string; hi:string }
interface CommandAdvice {
  release:string;task:string;supported:boolean;firstRelease:string;
  commands:string[];reference:string;note:string
}
interface LocalStrings {
  heading:string; intro:string; version:string; task:string; supported:string;
  unavailable:string; first:string; command:string; copy:string; copied:string;
  copyFailed:string; reference:string; missing:string; warning:string;
  notes:Record<string,string>
}
interface FinderData {
  releases:Release[];tasks:Task[];entries:CommandAdvice[];
  text:{en:LocalStrings;hi:LocalStrings}
}
const BASE='/scarp-docs/'
const hindi=document.documentElement.lang.startsWith('hi')
const locale:'en'|'hi'=hindi?'hi':'en'
const t=(en:string,hi:string):string=>hindi?hi:en
function el<K extends keyof HTMLElementTagNameMap>(
  tag:K,cls?:string,text?:string
):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag)
  if(cls)node.className=cls
  if(text!==undefined)node.textContent=text
  return node
}

/** Restore persisted appearance without relying on third-party theme scripts. */
function installAppearance():void {
  const toggle=document.querySelector<HTMLButtonElement>('#theme-toggle')
  if(!toggle)return
  let stored:string|null=null
  try{stored=localStorage.getItem('scarp-docs-appearance')}catch{ /* disabled storage */ }
  const initial=stored==='dark'||(stored!== 'light'&&
    window.matchMedia('(prefers-color-scheme: dark)').matches)
  const apply=(dark:boolean):void=>{
    document.documentElement.classList.toggle('dark',dark)
    toggle.setAttribute('aria-pressed',String(dark))
    toggle.setAttribute('aria-label',dark?t('Use light theme','लाइट मोड चुनें'):
      t('Use dark theme','डार्क मोड चुनें'))
  }
  apply(initial)
  toggle.addEventListener('click',()=>{
    const next=!document.documentElement.classList.contains('dark')
    apply(next)
    try{localStorage.setItem('scarp-docs-appearance',next?'dark':'light')}
    catch{ /* private browsing */ }
  })
}

function installMenu():void {
  const toggle=document.querySelector<HTMLButtonElement>('#menu-toggle')
  const navigation=document.querySelector<HTMLElement>('#side-nav')
  if(!toggle||!navigation)return
  const setOpen=(open:boolean):void=>{
    navigation.classList.toggle('open',open)
    toggle.setAttribute('aria-expanded',String(open))
  }
  toggle.addEventListener('click',()=>setOpen(!navigation.classList.contains('open')))
  navigation.addEventListener('click',event=>{
    if((event.target as Element).closest('a'))setOpen(false)
  })
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&navigation.classList.contains('open')){
      setOpen(false)
      toggle.focus()
    }
  })
}

let searchIndexPromise:Promise<SearchEntry[]>|null=null
function searchIndex():Promise<SearchEntry[]> {
  if(!searchIndexPromise){
    searchIndexPromise=fetch(BASE+'assets/search-index.json').then(response=>{
      if(!response.ok)throw new Error('Local search index unavailable')
      return response.json() as Promise<SearchEntry[]>
    }).catch(err=>{searchIndexPromise=null;throw err})
  }
  return searchIndexPromise
}
function search(entries:SearchEntry[],value:string):SearchEntry[]{
  const terms=value.toLocaleLowerCase().split(/\s+/u).filter(Boolean)
  if(terms.length===0)return []
  const scored=entries.filter(e=>e.locale===locale).map(e=>{
    const heading=e.title.toLocaleLowerCase()
    const content=e.excerpt.toLocaleLowerCase()
    if(!terms.every(term=>heading.includes(term)||content.includes(term)))return null
    const score=terms.reduce((sum,term)=>sum+
      (heading===term?100:heading.startsWith(term)?50:heading.includes(term)?22:0)+
      (content.includes(term)?1:0),0)
    return {entry:e,score}
  }).filter((x):x is {entry:SearchEntry;score:number}=>x!==null)
  return scored.sort((a,b)=>b.score-a.score||a.entry.title.localeCompare(b.entry.title))
    .slice(0,18).map(x=>x.entry)
}

function installSearch():void {
  const dialog=document.querySelector<HTMLDialogElement>('#search-panel')
  const open=document.querySelector<HTMLButtonElement>('#search-open')
  const close=document.querySelector<HTMLButtonElement>('#search-close')
  const input=document.querySelector<HTMLInputElement>('#search-query')
  const output=document.querySelector<HTMLUListElement>('#search-results')
  const status=document.querySelector<HTMLElement>('#search-status')
  if(!dialog||!open||!close||!input||!output||!status)return
  let previousFocus:HTMLElement|null=null
  let generation=0

  const refresh=async():Promise<void>=>{
    const current=++generation
    const query=input.value.trim()
    output.replaceChildren()
    if(!query){
      status.textContent=t('Start typing to search the documentation.','खोजने के लिए शब्द लिखें।')
      return
    }
    status.textContent=t('Searching local documentation…','स्थानीय दस्तावेज़ खोजे जा रहे हैं…')
    try {
      const entries=search(await searchIndex(),query)
      if(current!==generation||!dialog.open)return
      status.textContent=entries.length
        ?t(entries.length+' result(s)',entries.length+' परिणाम')
        :t('No results found','कोई परिणाम नहीं मिला')
      for(const entry of entries){
        const li=el('li')
        const link=el('a')
        link.href=entry.route
        link.appendChild(el('strong',undefined,entry.title))
        link.appendChild(el('small',undefined,entry.excerpt.slice(0,140)))
        li.appendChild(link)
        output.appendChild(li)
      }
    }catch{
      if(current===generation)status.textContent=
        t('Could not load the local search index. Use page navigation instead.',
          'स्थानीय खोज उपलब्ध नहीं है। पृष्ठों के लिंक का उपयोग करें।')
    }
  }
  const show=():void=>{
    if(dialog.open)return
    previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:open
    dialog.showModal()
    input.focus()
    void refresh()
  }
  open.addEventListener('click',show)
  close.addEventListener('click',()=>dialog.close())
  dialog.addEventListener('click',event=>{
    if(event.target===dialog)dialog.close()
  })
  dialog.addEventListener('close',()=>{
    generation++
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true})
    else open.focus({preventScroll:true})
  })
  input.addEventListener('input',()=>{void refresh()})
  document.addEventListener('keydown',event=>{
    const target=event.target as HTMLElement
    const typing=target.closest('input,textarea,select,[contenteditable="true"]')
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault()
      show()
    }else if(event.key==='/'&&!typing&&!dialog.open&&!event.ctrlKey&&!event.metaKey){
      event.preventDefault()
      show()
    }
  })
}

function installFinder():void {
  const panel=document.querySelector<HTMLElement>('[data-command-finder]')
  const data=document.querySelector<HTMLScriptElement>('#scarp-command-data')
  if(!panel||!data?.textContent)return
  let parsed:FinderData
  try{parsed=JSON.parse(data.textContent) as FinderData}
  catch{panel.textContent=t('Command data unavailable.','Command data उपलब्ध नहीं।');return}
  const words=parsed.text[locale]
  const h=el('h2',undefined,words.heading)
  const intro=el('p',undefined,words.intro)
  const fields=el('div','fields')
  const versionField=el('div')
  const releaseLabel=el('label',undefined,words.version)
  releaseLabel.htmlFor='scarp-release'
  const releaseSelect=el('select') as HTMLSelectElement
  releaseSelect.id='scarp-release'
  for(const release of parsed.releases){
    const option=el('option',undefined,release.label)
    option.value=release.tag
    releaseSelect.appendChild(option)
  }
  releaseSelect.value=parsed.releases.at(-1)?.tag??''
  const taskField=el('div')
  const taskLabel=el('label',undefined,words.task)
  taskLabel.htmlFor='scarp-task'
  const taskSelect=el('select') as HTMLSelectElement
  taskSelect.id='scarp-task'
  for(const task of parsed.tasks){
    const option=el('option',undefined,task[locale])
    option.value=task.id
    taskSelect.appendChild(option)
  }
  versionField.append(releaseLabel,releaseSelect)
  taskField.append(taskLabel,taskSelect)
  fields.append(versionField,taskField)
  const result=el('div','finder-result')
  result.setAttribute('aria-live','polite')
  result.setAttribute('aria-atomic','true')
  panel.append(h,intro,fields,result)

  const render=():void=>{
    const item=parsed.entries.find(entry=>entry.release===releaseSelect.value&&
      entry.task===taskSelect.value)
    if(!item)return
    result.replaceChildren()
    const status=el('p','status'+(item.supported?'':' unavailable'),
      item.supported?words.supported:words.unavailable)
    result.appendChild(status)
    if(!item.supported){
      result.append(el('p',undefined,words.first+' '+item.firstRelease),
        el('p',undefined,words.missing))
    }else{
      result.appendChild(el('p',undefined,words.command))
      const pre=el('pre')
      pre.tabIndex=0
      pre.appendChild(el('code',undefined,item.commands.join('\n')))
      result.appendChild(pre)
      const button=el('button',undefined,words.copy)
      button.type='button'
      button.addEventListener('click',()=>{
        if(!navigator.clipboard?.writeText){
          button.textContent=words.copyFailed
          return
        }
        void navigator.clipboard.writeText(item.commands.join('\n'))
          .then(()=>{button.textContent=words.copied})
          .catch(()=>{button.textContent=words.copyFailed})
      })
      result.appendChild(button)
      result.appendChild(el('p',undefined,words.notes[item.note]??''))
    }
    const reference=el('a',undefined,words.reference)
    reference.href=BASE+item.reference.replace(/^\/+/,'')
    result.appendChild(reference)
    result.appendChild(el('p',undefined,words.warning))
  }
  releaseSelect.addEventListener('change',render)
  taskSelect.addEventListener('change',render)
  render()
}

function installDeployments():void {
  const target=document.querySelector<HTMLElement>('[data-deployments]')
  const button=target?.querySelector<HTMLButtonElement>('[data-load-deployments]')
  const output=target?.querySelector<HTMLOutputElement>('output')
  if(!button||!output)return
  button.addEventListener('click',()=>{
    button.disabled=true
    output.textContent=t('Checking published workflow history…','प्रकाशित workflow इतिहास देख रहे हैं…')
    void fetch('https://api.github.com/repos/scarp-lang/scarp-docs/actions/workflows/pages.yml/runs?status=success&per_page=1')
      .then(async response=>{
        if(!response.ok)throw new Error('Public Actions API rate limit or network unavailable')
        return response.json() as Promise<{total_count?:number}>
      }).then(body=>{
        output.textContent=typeof body.total_count==='number'
          ?t('Successful Pages workflow runs: '+body.total_count,
            'सफल Pages workflow रन: '+body.total_count)
          :t('Run count unavailable','रन की संख्या उपलब्ध नहीं')
      }).catch(()=>{
        output.textContent=t('Count unavailable offline. View GitHub Actions when connected.',
          'ऑफलाइन संख्या उपलब्ध नहीं। इंटरनेट पर GitHub Actions देखें।')
      }).finally(()=>{button.disabled=false})
  })
}

installAppearance()
installMenu()
installSearch()
installFinder()
installDeployments()
