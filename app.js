/* Biblioteca Externa v1.0.0 — sem empacotador, sem dependencias para renderizar UI. */
(() => {
  "use strict";
  const KEY = "owlbear.external.library.v1";
  const LEGACY = ["owlbear-external-library-v3", "owlbear-external-library", "biblioteca-externa-v03"];
  const TYPES = {MAP:"Mapa",CHARACTER:"Token",PROP:"Objeto",MOUNT:"Montaria",ATTACHMENT:"Anexo"};
  const $ = (id) => document.getElementById(id);
  let items = [];
  let bridge = null;
  let currentScene = false;
  let inOwlbear = false;
  let notifyTimer;

  const byId = (id) => $(id);
  function diagnostics(s) { byId("tech").textContent = "Diagnóstico: " + s; }
  function show(message, error=false) {
    const e=byId("message"); e.textContent=message; e.classList.toggle("error", error); e.hidden=false;
    clearTimeout(notifyTimer); notifyTimer=setTimeout(()=>{e.hidden=true;},8500);
  }
  function validUrl(raw) {
    try { const u=new URL(String(raw||"").trim()); return (u.protocol==="https:" || u.protocol==="http:") ? u.href : null; }
    catch { return null; }
  }
  function uid() { return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())+"-"+Math.random().toString(36).slice(2); }
  function normalize(raw) {
    if(!raw || typeof raw!=="object") return null;
    const url=validUrl(raw.url || raw.imageUrl || raw.src);
    if(!url) return null;
    const type = TYPES[raw.type] ? raw.type : (TYPES[raw.category] ? raw.category : "PROP");
    return {id:String(raw.id||uid()),name:String(raw.name||raw.title||"Imagem externa").slice(0,120),url,type,source:String(raw.source||raw.collection||"").slice(0,80),size:["original","1","2","4","10"].includes(String(raw.size))?String(raw.size):"original",createdAt:String(raw.createdAt||new Date().toISOString())};
  }
  function read() {
    try { const raw=localStorage.getItem(KEY); const data=raw?JSON.parse(raw):[]; return Array.isArray(data)?data.map(normalize).filter(Boolean):[]; }
    catch(err) { show("O navegador não permitiu ler a biblioteca: "+err.message,true); return []; }
  }
  function save() {
    try { localStorage.setItem(KEY,JSON.stringify(items)); return true; }
    catch(err) { show("Não foi possível salvar neste navegador. Exporte um backup: "+err.message,true); return false; }
  }
  function elt(tag, cls, text) {const n=document.createElement(tag); if(cls) n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function button(label,cls,callback) {const b=elt("button",cls,label);b.type="button";b.addEventListener("click",callback);return b;}
  function render() {
    byId("count").textContent=String(items.length);
    const gallery=byId("gallery"); gallery.replaceChildren();
    const filter=byId("filter").value, q=byId("search").value.toLowerCase().trim();
    const matching=items.filter(i=>(filter==="ALL"||i.type===filter)&&[i.name,i.source,i.url].some(s=>s.toLowerCase().includes(q)));
    if(!matching.length) { const empty=elt("div","empty"); empty.append(elt("strong","",items.length?"Nenhuma imagem encontrada":"Sua biblioteca começa aqui"),elt("span","",items.length?"Experimente outro filtro ou termo.":"Cole seu primeiro link de imagem no formulário acima."));gallery.append(empty);return; }
    for(const item of matching.slice().reverse()) {
      const card=elt("article","item");const thumb=elt("div","thumb");const image=elt("img"); image.src=item.url;image.alt=item.name;image.loading="lazy";image.referrerPolicy="no-referrer";
      image.addEventListener("error",()=>thumb.classList.add("broken"));thumb.append(image,elt("span","fallback","Prévia indisponível — confira o link"));
      const body=elt("div","item-body");const name=elt("div","item-title",item.name);name.title=item.name;
      const meta=elt("div","item-meta",`${TYPES[item.type]} · ${item.source || "Link externo"}`);
      const actions=elt("div","item-actions");
      actions.append(button("Inserir na cena","insert",()=>insert(item)), button("Copiar link","ghost",async()=>{try{await navigator.clipboard.writeText(item.url);show("Link copiado.")}catch{show("Copie o link: "+item.url)}}),button("Excluir","remove",()=>{if(confirm(`Excluir "${item.name}" da biblioteca?`)){items=items.filter(v=>v.id!==item.id);save();render();}}));
      body.append(name,meta,actions);card.append(thumb,body);gallery.append(card);
    }
  }
  function loadImage(url) {
    return new Promise((resolve,reject)=>{
      const img = new Image(); const timer=setTimeout(()=>{img.src="";reject(new Error("Tempo limite para abrir a imagem."));},10000);
      img.onload=()=>{clearTimeout(timer);resolve({width:img.naturalWidth,height:img.naturalHeight});};
      img.onerror=()=>{clearTimeout(timer);reject(new Error("Imagem não carregou. Use uma URL pública direta (.png, .jpg ou .webp)."));};
      img.referrerPolicy="no-referrer";img.src=url;
    });
  }
  function setStatus(text, mode) {const e=byId("connection");e.textContent=text;e.className="status status-"+mode;}

  /* O SDK só é importado em um iframe; se falhar, a biblioteca permanece utilizável. */
  async function connect() {
    if(window.parent===window) { diagnostics("site aberto diretamente; biblioteca disponível, inserção requer sala do Owlbear.");return; }
    setStatus("Conectando…","wait");
    try {
      let module;
      try {module=await import("https://cdn.jsdelivr.net/npm/@owlbear-rodeo/sdk@3.1.0/+esm");}
      catch(first) {module=await import("https://esm.sh/@owlbear-rodeo/sdk@3.1.0?bundle");}
      const OBR=module.default; const buildImage=module.buildImage;
      if(!OBR || !buildImage) throw new Error("SDK não exportou OBR e buildImage.");
      bridge={OBR,buildImage};
      OBR.onReady(async ()=>{
        try {
          inOwlbear=true;
          currentScene=await OBR.scene.isReady();
          setStatus(currentScene?"Owlbear conectado":"Abra uma cena",currentScene?"ok":"wait");
          diagnostics("SDK conectado; cena "+(currentScene?"ativa.":"ainda não aberta."));
          OBR.scene.onReadyChange(ready=>{currentScene=ready;setStatus(ready?"Owlbear conectado":"Abra uma cena",ready?"ok":"wait");});
        } catch(err) {diagnostics("Owlbear iniciou, mas falhou ao verificar cena: "+err.message);setStatus("Falha de cena","wait");}
      });
      diagnostics("SDK importado. Aguardando o Owlbear inicializar a extensão.");
    } catch(err) {
      diagnostics("Falha ao carregar SDK externo: "+err.message+". A biblioteca continua disponível.");
      setStatus("SDK indisponível","wait");
    }
  }
  function imageMime(url) {const pathname=new URL(url).pathname.toLowerCase();if(pathname.endsWith(".webp"))return"image/webp";if(pathname.endsWith(".gif"))return"image/gif";if(pathname.endsWith(".jpeg")||pathname.endsWith(".jpg"))return"image/jpeg";return"image/png";}
  async function insert(item) {
    if(!bridge || !inOwlbear) {show("Abra esta biblioteca pelo botão da extensão dentro da sala do Owlbear. O site fora do Owlbear funciona apenas como gerenciador.",true);return;}
    if(!currentScene) {show("Abra uma cena no Owlbear antes de inserir uma imagem.",true);return;}
    try {
      let natural;
      try{natural=await loadImage(item.url);}catch{natural={width:512,height:512};}
      const {OBR,buildImage}=bridge;
      const dpi=await OBR.scene.grid.getDpi();
      const cells=Number(item.size);
      const width=item.size==="original" ? natural.width : Math.round((dpi||150)*cells);
      const height=item.size==="original" ? natural.height : Math.max(1,Math.round(width*natural.height/natural.width));
      const image={url:item.url,mime:imageMime(item.url),width:natural.width,height:natural.height};
      // Grid defaults centered in original dimensions, scene size uses builder.scale.
      const builder=buildImage(image,{dpi:dpi||150,offset:{x:natural.width/2,y:natural.height/2}})
        .name(item.name).layer(item.type).position({x:0,y:0});
      if(item.size!=="original") builder.scale({x:width/natural.width,y:height/natural.height});
      const result=builder.build();
      await OBR.scene.items.addItems([result]);
      show(`"${item.name}" inserido na cena. Procure próximo à origem (0, 0) do mapa.`);
    }catch(err) {show("Falha ao inserir na cena: "+err.message,true);diagnostics("Falha do SDK em addItems: "+(err.stack||err.message));}
  }
  function start() {
    items=read();render();
    byId("asset-form").addEventListener("submit",(event)=>{
      event.preventDefault();const url=validUrl(byId("asset-url").value);
      if(!url){show("Informe um link HTTP/HTTPS válido.",true);return;}
      if(items.some(i=>i.url===url)){show("Este link já está na biblioteca.",true);return;}
      const item=normalize({url,name:byId("asset-name").value.trim()||"Imagem externa",type:byId("asset-type").value,source:byId("asset-source").value.trim(),size:byId("asset-size").value});
      items.push(item);save();render();byId("asset-url").value="";byId("asset-name").value="";show("Imagem adicionada à biblioteca.");
    });
    byId("test-url").addEventListener("click",async()=>{
      const url=validUrl(byId("asset-url").value);if(!url){show("Cole uma URL válida primeiro.",true);return;}
      byId("preview-state").textContent="Testando link…";
      try {const result=await loadImage(url);byId("preview-state").textContent=`Imagem carregada: ${result.width} × ${result.height} pixels`;show("Prévia carregada no navegador. Ainda pode haver restrições do host dentro do Owlbear.");}
      catch(err){byId("preview-state").textContent="Não foi possível abrir a imagem";show(err.message,true);}
    });
    byId("filter").addEventListener("change",render);byId("search").addEventListener("input",render);
    byId("export").addEventListener("click",()=>{
      const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:"application/json"});const link=document.createElement("a");const u=URL.createObjectURL(blob);link.href=u;link.download="owlbear-biblioteca-backup.json";link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
    });
    byId("import").addEventListener("click",()=>byId("import-file").click());
    byId("import-file").addEventListener("change",async(e)=>{
      const file=e.target.files[0];if(!file)return;
      try {const data=JSON.parse(await file.text());const list=Array.isArray(data)?data:data.items;if(!Array.isArray(list))throw new Error("O JSON não contém uma lista de imagens.");const incoming=list.map(normalize).filter(Boolean);const seen=new Set(items.map(i=>i.url));let count=0;for(const i of incoming){if(!seen.has(i.url)){items.push(i);seen.add(i.url);count++;}}save();render();show(`${count} recurso(s) importado(s).`);}
      catch(err){show("Erro no backup: "+err.message,true);}finally{e.target.value="";}
    });
    byId("clear").addEventListener("click",()=>{if(!items.length)return;if(confirm(`Excluir os ${items.length} recursos deste navegador? Exporte um backup antes.`)){items=[];save();render();show("Biblioteca limpa.");}});
    window.addEventListener("error",(e)=>{diagnostics("Erro de JavaScript: "+e.message);show("Falha de JavaScript: "+e.message,true);});
    window.addEventListener("unhandledrejection",(e)=>{diagnostics("Erro assíncrono: "+String(e.reason));});
    connect();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
