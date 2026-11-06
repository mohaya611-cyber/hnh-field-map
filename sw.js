/* HNH Smart Field Map — offline cache */
const C='hnh-sfm-v2.0.0';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  if(u.origin===location.origin&&u.pathname.endsWith('field-data.json')){ // network first: latest verified data
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cl=r.clone();caches.open(C).then(c=>c.put(req,cl));}return r;}).catch(()=>caches.match(req)));return;}
  if(u.origin!==location.origin){ // fonts: cache as they come
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cl=r.clone();caches.open(C).then(c=>c.put(req,cl));return r;}).catch(()=>hit)));return;}
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).catch(()=>caches.match('./'))));
});
