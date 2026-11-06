import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { slides } from './slides.js';
import './style.css';
import { createTransitions } from './transitions.js';

self.MonacoEnvironment = { getWorker: (_, label) => label === 'typescript' || label === 'javascript' ? new tsWorker() : new editorWorker() };
const icon = (name) => ({ arrow: '↗', back: '←', next: '→', play: '▷', code: '⌘', full: '⛶' }[name]);
document.querySelector('#app').innerHTML = `
<header class="topbar"><a class="brand" href="#1"><span class="brand-mark">m<span>_</span></span> monaco<span class="brand-sub"> / slides</span></a><div class="project-name">architecture-for-ai <span>/</span> presentation</div><button id="present" class="quiet">${icon('play')} <span>Present</span><kbd>F</kbd></button></header>
<div class="workspace"><aside><div class="explorer-label">EXPLORER <span>···</span></div><div class="folder">⌄ &nbsp; ARCHITECTURE-FOR-AI</div><nav aria-label="Slides">${slides.map((s,i)=>`<button class="slide-link" data-slide="${i}"><span class="ts">TS</span><span>${s.file}</span><span class="slide-number">0${i+1}</span></button>`).join('')}</nav><div class="outline-label">IN THIS TALK</div><ol class="outline"><li>Architecture as context</li><li>Explicit boundaries</li><li>Executable feedback</li></ol><div class="sidebar-bottom"><span class="green-dot"></span> Built for live coding<br><small>Powered by Monaco Editor</small></div></aside>
<main><div class="tabbar"><div class="active-tab"><span class="ts">TS</span><span id="tab-name"></span><span class="tab-dot"></span></div><span class="tab-caption">A presentation, in your element.</span></div><div class="breadcrumb">talk <span>›</span> <span id="crumb"></span><span>›</span><span class="breadcrumb-symbol">{ }</span> <span>slide</span></div>
<section id="slide" aria-live="polite"><div class="slide-copy"><div id="eyebrow"></div><h1 id="title"></h1><p id="description"></p><div id="author"><span class="avatar">mi</span><div><strong>Mantas Indrašius</strong><span>Dev Lead at <b>Wix.com</b></span></div></div><div class="principles"><span>01 <b>Boundaries</b></span><span>02 <b>Context</b></span><span>03 <b>Feedback</b></span></div></div><div class="code-panel"><div class="code-toolbar"><span><span class="ts">TS</span> <span id="code-file"></span></span><div><button id="reset" title="Reset this code example">Reset</button><button id="run" hidden>▷ Run checks</button><span class="live-label"><span class="green-dot"></span> editable</span></div></div><div id="editor"></div><div id="output" role="status" hidden></div><div class="code-footer"><span>TypeScript</span><span>UTF-8 <span class="footer-separator">/</span> Monaco Editor</span></div></div><div class="takeaway"><span>↳</span><span id="takeaway-text"></span></div></section>
<footer class="navigation"><button id="notes-toggle" class="quiet">☰ &nbsp; Speaker notes <kbd>N</kbd></button><div class="pagination"><button id="previous" aria-label="Previous slide">←</button><span id="counter"></span><button id="next" aria-label="Next slide">→</button></div><span class="key-hint">Navigate with <kbd>←</kbd> <kbd>→</kbd></span></footer><div id="notes" hidden></div></main></div>
<div class="statusbar"><span>⑂ &nbsp; main <span class="status-divider">✓ &nbsp; All changes are local</span></span><span id="status-topic"></span><span>Made for developers <span class="status-divider">{ }</span></span></div>`;
monaco.editor.defineTheme('talk', { base:'vs-dark', inherit:true, rules:[{token:'comment',foreground:'6D7D89',fontStyle:'italic'},{token:'keyword',foreground:'C3A6F5'},{token:'string',foreground:'B5D6A1'},{token:'number',foreground:'E7BD8A'},{token:'type.identifier',foreground:'86CBCB'}], colors:{'editor.background':'#15191F','editor.foreground':'#CAD3DE','editorLineNumber.foreground':'#4F5968','editorLineNumber.activeForeground':'#B3BDCE','editor.lineHighlightBackground':'#1B2029','editorCursor.foreground':'#B4F39A','editor.selectionBackground':'#344C48','editorIndentGuide.background1':'#242B35'} });
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({target:monaco.languages.typescript.ScriptTarget.ESNext, strict:true});
const models = slides.map((slide,i)=> { let value=slide.code; try {value=localStorage.getItem(`talk-slide-${i}`) ?? value;} catch {} return monaco.editor.createModel(value,'typescript',monaco.Uri.parse(`file:///slide-${i}.ts`)); });
const editor = monaco.editor.create(document.querySelector('#editor'),{model:models[0],theme:'talk',fontFamily:'"SFMono-Regular", Consolas, "Liberation Mono", monospace',fontSize:14,lineHeight:25,padding:{top:20,bottom:20},minimap:{enabled:false},scrollBeyondLastLine:false,automaticLayout:true,renderLineHighlight:'none',lineNumbersMinChars:3,folding:false,overviewRulerLanes:0,hideCursorInOverviewRuler:true,scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5},wordWrap:'on',tabSize:2,stickyScroll:{enabled:false}});
models.forEach((model,i)=>model.onDidChangeContent(()=>{try{localStorage.setItem(`talk-slide-${i}`,model.getValue());}catch{}}));
let current = 0;
let transitions;
const $ = (id)=>document.getElementById(id);
function show(index) {
 transitions?.restore();
 current=Math.max(0,Math.min(2,index));const slide=slides[current];
 for(const id of ['tab-name','crumb','code-file']) $(id).textContent=slide.file;
 $('eyebrow').textContent=slide.label;$('title').innerHTML=slide.title;$('description').innerHTML=slide.description;
 $('takeaway-text').textContent=slide.takeaway;$('notes').textContent=slide.notes;
 $('counter').innerHTML=`<b>0${current+1}</b><span> / </span>03`;$('status-topic').textContent=`0${current+1} — ${slide.short}`;
 $('author').hidden=current!==0;document.querySelector('.principles').hidden=current!==0;
 $('previous').disabled=current===0;$('next').disabled=current===2;$('run').hidden=current!==2;$('output').hidden=true;
 document.querySelectorAll('.slide-link').forEach((el,i)=>{el.classList.toggle('selected',i===current);el.setAttribute('aria-current',i===current?'step':'false');});
 editor.setModel(models[current]);history.replaceState(null,'',`#${current+1}`);
 transitions?.reset();
}
document.querySelectorAll('[data-slide]').forEach(el=>el.onclick=()=>show(Number(el.dataset.slide)));
$('previous').onclick=()=>transitions.previous();$('next').onclick=()=>transitions.next();
$('reset').onclick=()=>{transitions.reset();models[current].setValue(slides[current].code);$('output').hidden=true;};
$('notes-toggle').onclick=()=>{$('notes').hidden=!$('notes').hidden;$('notes-toggle').setAttribute('aria-expanded',String(!$('notes').hidden));};
let presenting = false;
function setPresenting(active) {
 presenting = active;
 document.documentElement.classList.toggle('presenting', active);
 $('present').querySelector('span').textContent = active ? 'Exit presentation' : 'Present';
 $('present').setAttribute('aria-pressed', String(active));
 requestAnimationFrame(() => editor.layout());
}
async function fullscreen() {
 const active = !presenting;
 setPresenting(active);
 try {
  if (active && !document.fullscreenElement) await document.documentElement.requestFullscreen();
  else if (!active && document.fullscreenElement) await document.exitFullscreen();
 } catch {
  // Presentation layout remains available when embedded browsers deny fullscreen.
 }
}
document.addEventListener('fullscreenchange', () => setPresenting(Boolean(document.fullscreenElement)));
document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && presenting) {
  setPresenting(false);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
 }
});
$('present').onclick=fullscreen;
document.addEventListener('keydown',e=>{if(editor.hasTextFocus()||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();transitions.next();}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();transitions.previous();}if(e.key.toLowerCase()==='n')$('notes-toggle').click();if(e.key.toLowerCase()==='f')fullscreen();});
window.addEventListener('hashchange',()=>show(Number(location.hash.slice(1))-1||0));
$('run').onclick=async()=>{
 const output=$('output');output.hidden=false;output.className='';output.textContent='Running checks…';$('run').disabled=true;
 let worker,url;
 try{
  const model = editor.getModel();
  const getWorker=await monaco.languages.typescript.getTypeScriptWorker();const client=await getWorker(model.uri);const result=await client.getEmitOutput(model.uri.toString());
  const js=result.outputFiles.find(f=>f.name.endsWith('.js'))?.text;if(!js)throw new Error('Could not compile the example.');
  url=URL.createObjectURL(new Blob([js+'\npostMessage({ok:true});'],{type:'text/javascript'}));worker=new Worker(url,{type:'module'});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Checks timed out after 3 seconds.')),3000);worker.onmessage=()=>{clearTimeout(timer);resolve();};worker.onerror=e=>{clearTimeout(timer);reject(new Error(e.message));};});
  output.className='success';output.textContent='✓ Example completed without assertion errors';
 }catch(error){output.className='failure';output.textContent=`✕ ${error.message}`;}finally{worker?.terminate();if(url)URL.revokeObjectURL(url);$('run').disabled=false;}
};
transitions = createTransitions({ monaco, editor, models, getSlide: () => current, goToSlide: show, runChecks: () => $('run').click() });
setPresenting(true);
show(Number(location.hash.slice(1))-1||0);
