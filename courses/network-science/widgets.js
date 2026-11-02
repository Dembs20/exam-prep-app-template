// Interactive labs for this course. Uses the helpers of engine/widgets-core.html.
// ---------- shared editable graph ----------
const PRESETS={example:{n:6,l:[[1,2],[1,3],[1,6],[2,3],[2,5],[2,6],[3,4],[4,5],[5,6]]},k4e:{n:4,l:[[1,2],[1,3],[2,3],[2,4],[3,4]]},complete:'K',ring:'C',star:'S',path:'P',hw:{n:4,l:[[1,2],[1,3],[2,3],[3,4]]}};
function makeGraph(n,links){const A=Array.from({length:n},()=>Array(n).fill(0));links.forEach(([a,b])=>{if(a<=n&&b<=n){A[a-1][b-1]=1;A[b-1][a-1]=1}});return A}
function presetLinks(name,n){if(name==='K'){const l=[];for(let i=1;i<=n;i++)for(let j=i+1;j<=n;j++)l.push([i,j]);return l}
 if(name==='C'){const l=[];for(let i=1;i<=n;i++)l.push([i,i%n+1]);return l}if(name==='S'){const l=[];for(let i=2;i<=n;i++)l.push([1,i]);return l}if(name==='P'){const l=[];for(let i=1;i<n;i++)l.push([i,i+1]);return l}return name.l.filter(([a,b])=>a<=n&&b<=n)}
function analyse(A){const n=A.length;const d=A.map(r=>r.reduce((a,b)=>a+b,0));const L=d.reduce((a,b)=>a+b,0)/2;
 const Q=A.map((r,i)=>r.map((v,j)=>i===j?d[i]:-v));
 const ea=eig(A),eq=eig(Q);const lam=ea.val,mu=eq.val;
 const tri=lam.reduce((a,x)=>a+x*x*x,0)/6;
 // local clustering
 let cg=0;for(let v=0;v<n;v++){if(d[v]<2)continue;let y=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(A[v][i]&&A[v][j]&&A[i][j])y++;cg+=2*y/(d[v]*(d[v]-1))}cg/=n;
 const dd=d.reduce((a,x)=>a+x*(x-1),0);const ct=dd?6*tri/dd:0;
 // BFS distances
 const H=A.map(()=>Array(n).fill(Infinity));for(let s=0;s<n;s++){H[s][s]=0;const q=[s];while(q.length){const u=q.shift();for(let w=0;w<n;w++)if(A[u][w]&&H[s][w]===Infinity){H[s][w]=H[s][u]+1;q.push(w)}}}
 let conn=true,rho=0,sumH=0;for(let i=0;i<n;i++)for(let j=0;j<n;j++){if(i!==j){if(H[i][j]===Infinity)conn=false;else{rho=Math.max(rho,H[i][j]);sumH+=H[i][j]}}}
 const EH=conn&&n>1?sumH/(n*(n-1)):null;
 const comps=mu.filter(x=>Math.abs(x)<1e-7).length;
 const a=n>1?mu[n-2]:0;const trees=comps===1?Math.round(mu.slice(0,n-1).reduce((p,x)=>p*x,1)/n):0;
 // pseudoinverse
 let Qd=null,RG=null;if(comps===1){Qd=Array.from({length:n},()=>Array(n).fill(0));for(let k=0;k<n-1;k++){const z=eq.vec[k];for(let i=0;i<n;i++)for(let j=0;j<n;j++)Qd[i][j]+=z[i]*z[j]/mu[k]}RG=n*Qd.reduce((s,r,i)=>s+r[i],0)}
 const dmax=Math.max(...d),dmin=Math.min(...d);const Ed=2*L/n;const varD=d.reduce((s,x)=>s+(x-Ed)*(x-Ed),0)/n;
 return{n,d,L,Q,lam,mu,tri,cg,ct,dd,H,conn,rho,EH,sumH,comps,a,trees,Qd,RG,dmax,dmin,Ed,varD,fiedler:n>1?eq.vec[n-2]:null,x1:ea.vec[0]}}

function graphWidget(box,mode){
 const st={n:mode==='resistor'?4:6,links:presetLinks(PRESETS[mode==='resistor'?'k4e':'example'],mode==='resistor'?4:6),sel:null,a:0,b:3};
 box.innerHTML='<div class="ixctrl"><label>Nodes \\(N=\\) <b class="nv"></b></label><input type="range" class="nslider" min="3" max="8" value="'+st.n+'"><span class="hint">Click two nodes to add or remove the link between them.</span></div>'
 +'<div class="ixctrl presets"><button class="btn small" data-p="example">Lecture example (\\(N=6\\))</button><button class="btn small" data-p="k4e">\\(K_4\\) minus a link</button><button class="btn small" data-p="hw">Homework 2 circuit</button><button class="btn small" data-p="complete">Complete \\(K_N\\)</button><button class="btn small" data-p="ring">Ring \\(C_N\\)</button><button class="btn small" data-p="star">Star \\(K_{1,N-1}\\)</button><button class="btn small" data-p="path">Path \\(P_N\\)</button></div>'
 +(mode==='resistor'?'<div class="ixctrl"><label>Current in at <select class="selA"></select></label><label>out at <select class="selB"></select></label><span class="hint">Unit current \\(I=1\\), unit resistances, potentials normalised so that \\(u^Tv=0\\).</span></div>':'')
 +'<div class="ixgrid"><svg class="ixsvg" viewBox="0 0 320 300"></svg><div class="ixread"></div></div>';
 box.querySelectorAll('.ixctrl').forEach(c=>{c.querySelectorAll('label,button,span').forEach(n=>{if(n.children.length===0||n.tagName==='LABEL'){n.childNodes.forEach(cn=>{if(cn.nodeType===3&&/\\\(/.test(cn.data)){const sp=document.createElement('span');sp.className='ixtex';sp.dataset.tex=cn.data;cn.replaceWith(sp)}})}})});
 function staticTex(){box.querySelectorAll('.ixtex').forEach(sp=>{sp.innerHTML=texHTML(sp.dataset.tex)})}
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread');
 function pos(i){const n=st.n,ang=-Math.PI/2+2*Math.PI*i/n;return[160+110*Math.cos(ang),150+110*Math.sin(ang)]}
 function toggle(i,j){const k=st.links.findIndex(([a,b])=>(a===i+1&&b===j+1)||(a===j+1&&b===i+1));if(k>=0)st.links.splice(k,1);else st.links.push([i+1,j+1]);}
 function draw(){
  const A=makeGraph(st.n,st.links);const r=analyse(A);svg.innerHTML='';
  let v=null,y=null,w=null;
  if(mode==='resistor'&&r.Qd&&st.a!==st.b){v=r.Qd.map(row=>row[st.a]-row[st.b]);w=v[st.a]-v[st.b];y={};st.links.forEach(([a,b])=>{y[a+'-'+b]=v[a-1]-v[b-1]})}
  const maxY=y?Math.max(1e-9,...Object.values(y).map(Math.abs)):1;
  st.links.forEach(([a,b])=>{const [x1,y1]=pos(a-1),[x2,y2]=pos(b-1);const cur=y?y[a+'-'+b]:0;const sw=y?1+5*Math.abs(cur)/maxY:2;
   svg.appendChild(el('line',{x1,y1,x2,y2,stroke:y&&Math.abs(cur)<1e-9?'var(--muted)':'var(--accent)',opacity:y&&Math.abs(cur)<1e-9?.4:1,'stroke-width':sw,'stroke-linecap':'round'}));
   if(y&&Math.abs(cur)>1e-9){const s=cur>0?1:-1;const mx=(x1+x2)/2+s*(x2-x1)*0.18,my=(y1+y2)/2+s*(y2-y1)*0.18;const ang=Math.atan2(s*(y2-y1),s*(x2-x1));svg.appendChild(el('path',{d:'M'+mx+','+my+' l-7,-4 l0,8z',fill:'var(--ink)',transform:'rotate('+(ang*180/Math.PI)+' '+mx+' '+my+')'}));svgTex(svg,tfr(Math.abs(cur)),(x1+x2)/2+10,(y1+y2)/2-6,{fs:12,anchor:'start',fallback:fmt(Math.abs(cur),2)})}});
  for(let i=0;i<st.n;i++){const[x,yy]=pos(i);let fill='var(--accent)';if(mode==='spectrum'&&r.fiedler&&r.comps===1)fill=r.fiedler[i]>=0?'var(--accent)':'var(--hw)';if(mode==='resistor'){fill=i===st.a?'var(--ok)':i===st.b?'var(--bad)':'var(--accent)'}
   const g=el('g',{class:'node','data-i':i,style:'cursor:pointer'});g.appendChild(el('circle',{cx:x,cy:yy,r:15,fill,stroke:st.sel===i?'var(--ink)':'none','stroke-width':3}));g.appendChild(el('text',{x,y:yy+1,'text-anchor':'middle','dominant-baseline':'central',fill:'var(--accent-ink)','font-size':'12','font-family':'IBM Plex Mono,monospace'},i+1));svg.appendChild(g);
   if(v)svgTex(svg,'v_{'+(i+1)+'}='+tfr(v[i]),x,yy-21,{fs:12,color:'var(--ink)',fallback:'v='+fmt(v[i],2)})}
  box.querySelector('.nv').textContent=st.n;
  let h='';const n=r.n,M=n*(n-1)/2;
  if(mode==='graph'){
   h=line('Size','\\(N='+n+',\\;L='+r.L+'\\), degree vector \\(d='+tvec(r.d,0)+'\\), \\(E[D]=\\tfrac{2L}{N}='+tfr(r.Ed)+'\\)')
   +line('Triangles','\\(\\triangle_G=\\tfrac16\\sum_k\\lambda_k^3='+Math.round(r.tri)+'\\)')
   +line('Clustering','\\(c_G=\\tfrac1N\\sum_v c_G(v)='+tnum(r.cg,3)+'\\), \\(\\check c_G=\\dfrac{6\\triangle_G}{\\sum_j d_j(d_j-1)}='+(r.dd?'\\tfrac{'+Math.round(6*r.tri)+'}{'+r.dd+'}='+tnum(r.ct,3):'0')+'\\)')
   +line('Distances',r.conn?'connected, diameter \\(\\rho='+r.rho+'\\), \\(E[H]=\\tfrac{1}{N(N-1)}\\sum_{i\\ne j}H_{ij}='+tfr(r.EH)+'\\)':'disconnected: '+r.comps+' components, so \\(\\rho=\\infty\\)')
   +line('Degrees','\\(d_{\\max}='+r.dmax+',\\;d_{\\min}='+r.dmin+'\\)')
   +line('Counting','labelled graphs with this \\(N,L\\): \\(\\binom{N(N-1)/2}{L}=\\binom{'+M+'}{'+r.L+'}='+binom(M,r.L).toLocaleString('en').replace(/,/g,'\\,')+'\\)')}
  else if(mode==='spectrum'){
   const s1=r.lam.reduce((a,b)=>a+b,0),s2=r.lam.reduce((a,b)=>a+b*b,0),s3=r.lam.reduce((a,b)=>a+b*b*b,0);
   const walk=r.Ed*Math.sqrt(1+r.varD/(r.Ed*r.Ed||1));
   h=line('Adjacency','\\(\\lambda='+tvec(r.lam,2)+'\\)')
   +line('','\\(\\sum_k\\lambda_k='+tnum(s1,2)+'\\), \\(\\sum_k\\lambda_k^2='+tnum(s2,2)+'=2L\\), \\(\\sum_k\\lambda_k^3='+tnum(s3,2)+'=6\\cdot'+Math.round(r.tri)+'\\) triangles')
   +line('Bounds','\\(\\tfrac{2L}{N}='+tnum(r.Ed,3)+'\\le E[D]\\sqrt{1+\\tfrac{\\operatorname{Var}[D]}{E[D]^2}}='+tnum(walk,3)+'\\le\\lambda_1='+tnum(r.lam[0],3)+'\\le d_{\\max}='+r.dmax+'\\)')
   +line('','\\(\\lambda_1\\ge\\sqrt{d_{\\max}}='+tnum(Math.sqrt(r.dmax),3)+'\\) (largest star in \\(G\\))')
   +line('Laplacian','\\(\\mu='+tvec(r.mu,2)+'\\), \\(E[\\mu]=\\tfrac{2L}{N}='+tfr(r.Ed)+'\\)')
   +line('','\\(a(G)=\\mu_{N-1}='+tnum(Math.abs(r.a)<1e-9?0:r.a,3)+'\\); zero eigenvalues: '+r.comps+' \\(\\Rightarrow\\) '+r.comps+' component'+(r.comps>1?'s':''))
   +(r.comps===1?line('','\\(\\xi(G)=\\tfrac1N\\prod_{k<N}\\mu_k='+r.trees+'\\) spanning trees, \\(R_G=N\\sum_{k<N}\\tfrac{1}{\\mu_k}='+tnum(r.RG,3)+'\\)'):'');
   if(r.fiedler&&r.comps===1){const G1=[],G2=[];r.fiedler.forEach((x,i)=>(x>=0?G1:G2).push(i+1));const cut=st.links.filter(([a,b])=>(r.fiedler[a-1]>=0)!==(r.fiedler[b-1]>=0)).length;
    h+=line('Fiedler cut','\\(G_1=\\{'+G1.join(',')+'\\}\\) (teal), \\(G_2=\\{'+G2.join(',')+'\\}\\) (purple), cut links \\(R=\\tfrac14 y^TQy='+cut+'\\)')}}
  else{ if(!r.conn)h='The graph is disconnected: \\(a(G)=0\\), so there is no pseudoinverse and no finite effective resistance.';else if(st.a===st.b)h='Choose two different nodes.';else{const A1=st.a+1,B1=st.b+1;
   const foster=st.links.reduce((s,[a,b])=>s+r.Qd[a-1][a-1]+r.Qd[b-1][b-1]-2*r.Qd[a-1][b-1],0);
   h=line('Injection','\\(x=e_{'+A1+'}-e_{'+B1+'}\\), potentials \\(v=Q^\\dagger x\\) shown on the nodes, \\(u^Tv=0\\)')
   +line('Effective resistance','\\(\\omega_{'+A1+B1+'}=Q^\\dagger_{'+A1+A1+'}+Q^\\dagger_{'+B1+B1+'}-2Q^\\dagger_{'+A1+B1+'}=v_{'+A1+'}-v_{'+B1+'}='+tfr(w)+'\\)')
   +line('Power','\\(\\wp=x^Tv=I^2\\omega_{'+A1+B1+'}='+tfr(w)+'\\)')
   +line('Graph resistance','\\(R_G=N\\operatorname{trace}Q^\\dagger='+tfr(r.RG)+'\\ge N-1='+(n-1)+'\\)')
   +line('Foster','\\(\\sum_{i\\sim j}\\omega_{ij}='+tfr(foster)+'=N-1\\)')
   +line('','Links drawn thicker carry more current; greyed links carry none. Labels on links are the currents \\(|y_l|\\).')}}
  setMath(read,h);
  if(mode==='resistor'){const sa=box.querySelector('.selA'),sb=box.querySelector('.selB');if(sa.options.length!==st.n){[sa,sb].forEach(s=>{s.innerHTML='';for(let i=0;i<st.n;i++)s.add(new Option('node '+(i+1),i))});sa.value=st.a;sb.value=st.b}}
 }
 box.querySelector('.nslider').addEventListener('input',e=>{st.n=+e.target.value;st.links=st.links.filter(([a,b])=>a<=st.n&&b<=st.n);st.a=Math.min(st.a,st.n-1);st.b=Math.min(st.b,st.n-1);st.sel=null;draw()});
 box.querySelector('.presets').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=PRESETS[b.dataset.p];if(p&&p.n){st.n=p.n;box.querySelector('.nslider').value=p.n}st.links=presetLinks(p,st.n);st.a=0;st.b=st.n-1;st.sel=null;draw()});
 svg.addEventListener('click',e=>{const g=e.target.closest('.node');if(!g)return;const i=+g.dataset.i;if(st.sel===null)st.sel=i;else{if(st.sel!==i)toggle(st.sel,i);st.sel=null}draw()});
 if(mode==='resistor'){box.querySelector('.selA').addEventListener('change',e=>{st.a=+e.target.value;draw()});box.querySelector('.selB').addEventListener('change',e=>{st.b=+e.target.value;draw()})}
 reg(box,()=>{staticTex();draw()});staticTex();draw();
}
WIDGETS.graphlab=b=>graphWidget(b,'graph');WIDGETS.spectrumlab=b=>graphWidget(b,'spectrum');WIDGETS.resistorlab=b=>graphWidget(b,'resistor');


// ---------- ER lab ----------
WIDGETS.erlab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(N=\\)')+' <b class="nv"></b></label><input type="range" class="n" min="10" max="500" value="100"><label>'+T('\\(p=\\)')+' <b class="pv"></b></label><input type="range" class="p" min="1" max="60" value="10"></div><div class="ixgrid"><svg class="ixsvg"></svg><svg class="ixsvg"></svg></div><div class="ixread"></div>';
 const [s1,s2]=box.querySelectorAll('svg'),read=box.querySelector('.ixread');
 function draw(){const N=+box.querySelector('.n').value,p=+box.querySelector('.p').value/100;box.querySelector('.nv').textContent=N;box.querySelector('.pv').textContent=p.toFixed(2);
  const ED=(N-1)*p,sig=Math.sqrt(N*p*(1-p)),pc=Math.log(N)/N,iso=N*Math.pow(1-p,N-1),pconn=Math.exp(-iso),l1=(N-2)*p+1;
  const ks=[],pk=[];let lp=[];for(let k=0;k<=N-1;k++){let lg=0;for(let i=1;i<=k;i++)lg+=Math.log(N-1-k+i)-Math.log(i);lg+=k*Math.log(p)+(N-1-k)*Math.log(1-p);lp.push(Math.exp(lg))}
  const kmax=Math.min(N-1,Math.ceil(ED+4*sig+2));for(let k=0;k<=kmax;k++){ks.push(k);pk.push(lp[k])}
  plot(s1,300,200,{l:46,r:10,t:12,b:40},ks,[pk],{bars:true,xlabel:'\\text{degree } k',ylabel:'\\Pr[D=k]',xticks:[[0,'0'],[Math.round(ED),String(Math.round(ED))],[kmax,String(kmax)]]});
  const xs=[],ys=[];for(let i=0;i<=80;i++){const x=-2*sig+4*sig*i/80;xs.push(x);ys.push(Math.sqrt(Math.max(0,4*sig*sig-x*x))/(2*Math.PI*sig*sig))}
  const xmax=Math.max(l1*1.1,2*sig*1.1);const P=plot(s2,300,200,{l:46,r:10,t:12,b:40},xs,[ys],{xmin:-2*sig*1.1,xmax,xlabel:'\\text{eigenvalue } x',ylabel:'f_\\lambda(x)',xticks:[[-2*sig,'-2\\sigma'],[0,'0'],[2*sig,'2\\sigma']]});
  s2.appendChild(el('line',{x1:P.X(l1),y1:P.Y(0),x2:P.X(l1),y2:22,stroke:'var(--exam)','stroke-width':2,'stroke-dasharray':'4 3'}));svgTex(s2,'E[\\lambda_1]',P.X(l1)-3,20,{fs:12,color:'var(--exam)',anchor:'end'});
  setMath(read,line('Degrees','\\(D\\sim\\mathrm{Bin}(N-1,p)\\), \\(E[D]=(N-1)p='+tnum(ED,2)+'\\), \\(E[L]=p\\binom N2='+tnum(p*N*(N-1)/2,0)+'\\), \\(\\sigma=\\sqrt{Np(1-p)}='+tnum(sig,2)+'\\)')
   +line('Connectivity','\\(p_c\\approx\\tfrac{\\ln N}{N}='+tnum(pc,4)+'\\), so \\(p\\) is <b>'+(p>pc?'above':'below')+'</b> the threshold; isolated nodes \\(N(1-p)^{N-1}='+tnum(iso,3)+'\\), \\(\\Pr[\\text{connected}]\\approx e^{-N(1-p)^{N-1}}='+tnum(pconn,3)+'\\)')
   +line('Spectrum','\\(E[\\lambda_1]\\approx(N-2)p+1='+tnum(l1,2)+'\\); semicircle radius \\(2\\sigma='+tnum(2*sig,2)+'\\Rightarrow\\lambda_N\\gtrsim'+tnum(-2*sig,2)+'\\)')
   +line('Other','clustering \\(c=p='+p.toFixed(2)+'\\); a random neighbour has expected degree \\(1+(N-2)p='+tnum(1+(N-2)*p,2)+'>E[D]\\) (friendship paradox)'))}
 box.querySelectorAll('input').forEach(i=>i.addEventListener('input',rafd(draw)));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()}

// ---------- RGG lab ----------
WIDGETS.rgglab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(r/l=\\)')+' <b class="rv"></b></label><input type="range" class="r" min="1" max="100" value="20"></div><div class="ixgrid"><svg class="ixsvg"></svg><div class="ixread"></div></div>';
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread');
 const exact=q=>Math.PI*q*q-8/3*q*q*q+0.5*q*q*q*q;
 function draw(){const q=+box.querySelector('.r').value/100;box.querySelector('.rv').textContent=q.toFixed(2);
  const xs=[],e=[],naive=[];for(let i=0;i<=100;i++){const x=i/100;xs.push(x);e.push(exact(x));naive.push(Math.min(1,Math.PI*x*x))}
  const P=plot(svg,320,205,{l:46,r:10,t:12,b:40},xs,[e,naive],{ymax:1.05,xlabel:'r/l',ylabel:'\\text{link density } p',xticks:[[0,'0'],[0.5,'0.5'],[1,'1']],yticks:[[0,'0'],[0.5,'0.5'],[1,'1']]});
  svg.appendChild(el('circle',{cx:P.X(q),cy:P.Y(exact(q)),r:5,fill:'var(--exam)'}));
  svgTex(svg,'\\text{exact}',62,28,{fs:12,color:'var(--accent)',anchor:'start'});svgTex(svg,'\\pi(r/l)^2',62,46,{fs:12,color:'var(--hw)',anchor:'start'});
  setMath(read,line('Model','hard RGG in a square of side \\(l\\), nodes i.i.d. uniform, linked iff \\(\\|x_i-x_j\\|\\le r\\)')
   +line('Exact','\\(p=\\pi\\left(\\tfrac rl\\right)^2-\\tfrac83\\left(\\tfrac rl\\right)^3+\\tfrac12\\left(\\tfrac rl\\right)^4='+tnum(exact(q),4)+'\\)')
   +line('Naive','\\(\\pi\\left(\\tfrac rl\\right)^2='+tnum(Math.PI*q*q,4)+'\\) (purple) ignores that the disc is cut off at the boundary and overestimates; for \\(r/l=0.2\\) (Homework 2 C.2d) \\(0.105\\) versus \\(0.126\\)')
   +line('Sphere','with \\(r_0\\ll Z\\) the boundary is negligible and \\(p=\\left(\\tfrac{r_0}{Z}\\right)^3\\) (Exam prep Q19)'))}
 box.querySelector('.r').addEventListener('input',rafd(draw));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()}

// ---------- WS lab ----------
WIDGETS.wslab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(N=\\)')+' <b class="nv"></b></label><input type="range" class="n" min="100" max="5000" step="100" value="1000"><label>'+T('\\(d=\\)')+' <b class="dv"></b></label><input type="range" class="d" min="4" max="20" step="2" value="10"><label>'+T('\\(p_{\\text{rew}}=\\)')+' <b class="pv"></b></label><input type="range" class="p" min="0" max="100" value="30"></div><div class="ixgrid"><svg class="ixsvg"></svg><div class="ixread"></div></div>';
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread');
 const c0=d=>3*(d-2)/(4*(d-1));const cof=(d,p)=>c0(d)*Math.pow(1-p,3);
 const rho=(N,d,p)=>p<=0?N/d:Math.max(1,Math.min(N/d,Math.log(N*p*d)/(p*d)));
 function draw(){const N=+box.querySelector('.n').value,d=+box.querySelector('.d').value,pv=+box.querySelector('.p').value;const p=pv===0?0:Math.pow(10,-4+4*pv/100);
  box.querySelector('.nv').textContent=N;box.querySelector('.dv').textContent=d;box.querySelector('.pv').textContent=p===0?'0':p.toExponential(1);
  const xs=[],cc=[],rr=[];for(let i=0;i<=100;i++){const pp=Math.pow(10,-4+4*i/100);xs.push(i);cc.push(cof(d,pp)/c0(d));rr.push(rho(N,d,pp)/(N/d))}
  const P=plot(svg,320,205,{l:46,r:10,t:12,b:40},xs,[cc,rr],{ymax:1.05,xlabel:'p_{\\text{rew}}\\ (\\log\\text{ scale})',ylabel:'\\text{normalised}',xticks:[[0,'10^{-4}'],[25,'10^{-3}'],[50,'10^{-2}'],[75,'10^{-1}'],[100,'1']],yticks:[[0,'0'],[0.5,'0.5'],[1,'1']]});
  if(p>0){const xi=(Math.log10(p)+4)/4*100;svg.appendChild(el('line',{x1:P.X(xi),y1:P.Y(0),x2:P.X(xi),y2:12,stroke:'var(--exam)','stroke-dasharray':'4 3'}))}
  svgTex(svg,'c(p)/c(0)',58,28,{fs:12,color:'var(--accent)',anchor:'start'});svgTex(svg,'\\rho(p)/\\rho(0)',58,46,{fs:12,color:'var(--hw)',anchor:'start'});
  setMath(read,line('Clustering','\\(c(p_{\\text{rew}})\\approx\\dfrac{3(d-2)}{4(d-1)}(1-p_{\\text{rew}})^3='+tnum(cof(d,p),3)+'\\); lattice value \\('+tnum(c0(d),3)+'\\), ER value \\(\\tfrac{d}{N-1}='+tnum(d/(N-1),4)+'\\)')
   +line('Diameter','\\(\\rho(0)\\approx\\tfrac Nd='+tnum(N/d,0)+'\\) hops; \\(\\rho(p_{\\text{rew}})\\sim\\dfrac{\\ln(Np_{\\text{rew}}d)}{p_{\\text{rew}}d}='+tnum(rho(N,d,p),1)+'\\) hops'+(p>0?'; shortcut ends every \\(\\xi=\\tfrac{1}{p_{\\text{rew}}d}='+tnum(1/(p*d),1)+'\\) nodes':''))
   +line('Links','\\(L=\\tfrac{Nd}{2}='+(N*d/2)+'\\), \\(p=\\tfrac{d}{N-1}='+tnum(d/(N-1),4)+'\\): rewiring moves links but never adds or removes them')
   +line('','The small-world window is where clustering is still close to the lattice value while the diameter has already collapsed to logarithmic growth.'))}
 box.querySelectorAll('input').forEach(i=>i.addEventListener('input',rafd(draw)));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()}

// ---------- power-law lab ----------
WIDGETS.plawlab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(\\tau=\\)')+' <b class="tv"></b></label><input type="range" class="t" min="150" max="450" value="250"><label>'+T('\\(\\log_{10}N=\\)')+' <b class="nv"></b></label><input type="range" class="n" min="2" max="9" value="5"></div><div class="ixgrid"><svg class="ixsvg"></svg><div class="ixread"></div></div>';
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread');
 const zeta=s=>{if(s<=1)return Infinity;let z=0;for(let k=1;k<=20000;k++)z+=Math.pow(k,-s);z+=Math.pow(20000,1-s)/(s-1);return z};
 function draw(){const t=+box.querySelector('.t').value/100,ln=+box.querySelector('.n').value,N=Math.pow(10,ln);box.querySelector('.tv').textContent=t.toFixed(2);box.querySelector('.nv').textContent=ln;
  const z=zeta(t);const xs=[],ys=[];for(let i=0;i<=60;i++){const lk=3*i/60;xs.push(lk);ys.push(Math.log10(Math.pow(Math.pow(10,lk),-t)/z))}
  plot(svg,320,205,{l:50,r:10,t:12,b:40},xs,[ys],{ymin:-10,ymax:0,xlabel:'\\log_{10}k',ylabel:'\\log_{10}\\Pr[D=k]',xticks:[[0,'1'],[1,'10'],[2,'10^2'],[3,'10^3']],yticks:[[0,'0'],[-5,'-5'],[-10,'-10']]});
  const ED=t>2?zeta(t-1)/z:Infinity,ED2=t>3?zeta(t-2)/z:Infinity;
  const regime=t<2?'\\(\\tau<2\\): \\(E[D]\\) diverges and \\(D_{\\max}\\) grows faster than \\(N\\), so no large power-law network can exist':t<3?'\\(2<\\tau<3\\): scale-free regime, \\(E[D]\\) finite but \\(E[D^2]\\) diverges, ultra-small world \\(E[H]\\sim\\ln\\ln N\\)':'\\(\\tau>3\\): random regime, \\(E[D]\\) and \\(E[D^2]\\) finite, small world \\(E[H]\\sim\\tfrac{\\ln N}{\\ln E[D]}\\)';
  setMath(read,line('Law','\\(\\Pr[D=k]=\\dfrac{k^{-\\tau}}{\\zeta(\\tau)}\\), \\(\\zeta('+t.toFixed(2)+')='+tnum(z,3)+'\\); slope on log–log axes \\(=-\\tau\\)')
   +line('Moments','\\(E[D]=\\dfrac{\\zeta(\\tau-1)}{\\zeta(\\tau)}='+tnum(ED,3)+'\\), \\(E[D^2]=\\dfrac{\\zeta(\\tau-2)}{\\zeta(\\tau)}='+tnum(ED2,2)+'\\)')
   +line('Largest degree','\\(D_{\\max}\\sim N^{1/(\\tau-1)}='+tnum(Math.pow(N,1/(t-1)),0)+'\\) for \\(N=10^{'+ln+'}\\)')
   +line('Regime',regime))}
 box.querySelectorAll('input').forEach(i=>i.addEventListener('input',rafd(draw)));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()}

// ---------- ring lab ----------
WIDGETS.ringlab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(n=\\)')+' <b class="nv"></b></label><input type="range" class="n" min="3" max="16" value="8"><label>'+T('\\(d=|i-j|=\\)')+' <b class="dv"></b></label><input type="range" class="d" min="1" max="8" value="3"></div><div class="ixgrid"><svg class="ixsvg" viewBox="0 0 320 240"></svg><div class="ixread"></div></div>';
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread'),nd=box.querySelector('.d');
 function draw(){const n=+box.querySelector('.n').value;nd.max=n-1;let d=Math.min(+nd.value,n-1);nd.value=d;box.querySelector('.nv').textContent=n;box.querySelector('.dv').textContent=d;
  svg.innerHTML='';const pos=i=>{const a=-Math.PI/2+2*Math.PI*i/n;return[160+95*Math.cos(a),125+95*Math.sin(a)]};
  for(let i=0;i<n;i++){const j=(i+1)%n;const[x1,y1]=pos(i),[x2,y2]=pos(j);const onArc=i<d;svg.appendChild(el('line',{x1,y1,x2,y2,stroke:onArc?'var(--accent)':'var(--hw)','stroke-width':4,'stroke-linecap':'round'}))}
  for(let i=0;i<n;i++){const[x,y]=pos(i);svg.appendChild(el('circle',{cx:x,cy:y,r:11,fill:i===0||i===d?'var(--exam)':'var(--panel)',stroke:'var(--ink)','stroke-width':1.5}));svg.appendChild(el('text',{x,y:y+1,'text-anchor':'middle','dominant-baseline':'central','font-size':'10','font-family':'IBM Plex Mono,monospace',fill:'var(--ink)'},i))}
  const w=d*(n-d)/n,RGc=n*(n*n-1)/12,RGp=n*(n*n-1)/6;const mu=[];for(let k=0;k<n;k++)mu.push(4*Math.pow(Math.sin(Math.PI*k/n),2));
  const spec=n*mu.slice(1).reduce((s,m)=>s+1/m,0);
  setMath(read,line('Two arcs','in parallel: \\(dR='+d+'R\\) (teal) and \\((n-d)R='+(n-d)+'R\\) (purple)')
   +line('Effective resistance','\\(\\omega_{0,'+d+'}=\\dfrac{dR\\cdot(n-d)R}{nR}=R\\,\\dfrac{d(n-d)}{n}='+tfr(w)+'\\,R\\)')
   +line('Ring','\\(R_G(C_n)=R\\,\\dfrac{n(n^2-1)}{12}='+tfr(RGc)+'\\,R\\); spectral check \\(n\\sum_{k\\ge1}\\tfrac1{\\mu_k}='+tnum(spec,3)+'\\,R\\)')
   +line('Path','\\(R_G(P_n)=R\\,\\dfrac{n(n^2-1)}{6}='+tfr(RGp)+'\\,R=2R_G(C_n)\\): cutting one resistor doubles the effective graph resistance')
   +line('Spectrum','\\(\\mu_k=\\tfrac4R\\sin^2\\tfrac{\\pi k}{n}\\): \\('+tvec(mu,2)+'\\)'))}
 box.querySelectorAll('input').forEach(i=>i.addEventListener('input',rafd(draw)));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()}
