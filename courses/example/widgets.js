// Interactive labs: WIDGETS.<id>=function(box){...}; a lecture embeds one with <ix id="<id>" title="..."></ix>.
// Helpers from engine/widgets-core.html: plot(svg,W,H,pad,xs,[ys...],opts), svgTex(svg,tex,x,y,opts), setMath(node,html),
// line(label,html), T(tex) for control labels, ctrlTex(box), reg(box,redraw) (redraw once MathJax is ready), rafd(fn), tnum, tfr.
WIDGETS.samplinglab=function(box){
 box.innerHTML='<div class="ixctrl"><label>'+T('\\(f=\\)')+' <b class="fv"></b> Hz</label><input type="range" class="f" min="1" max="19" value="3">'
  +'<label>'+T('\\(f_s=\\)')+' <b class="sv"></b> Hz</label><input type="range" class="s" min="4" max="20" value="8"></div>'
  +'<div class="ixgrid"><svg class="ixsvg"></svg><div class="ixread"></div></div>';
 const svg=box.querySelector('svg'),read=box.querySelector('.ixread');
 function draw(){
  const f=+box.querySelector('.f').value,fs=+box.querySelector('.s').value;
  box.querySelector('.fv').textContent=f;box.querySelector('.sv').textContent=fs;
  const fa=Math.abs(f-Math.round(f/fs)*fs);
  const xs=[],ys=[],ya=[];for(let i=0;i<=400;i++){const t=i/400;xs.push(t);ys.push(Math.sin(2*Math.PI*f*t));ya.push(Math.sin(2*Math.PI*fa*t)*(f-Math.round(f/fs)*fs<0?-1:1))}
  const P=plot(svg,320,200,{l:40,r:10,t:12,b:36},xs,fa!==f?[ys,ya]:[ys],{xmin:0,xmax:1,ymin:-1.1,ymax:1.1,xlabel:'t\\ \\text{(s)}',ylabel:'x(t)',colors:['var(--accent)','var(--exam)'],xticks:[[0,'0'],[1,'1']]});
  for(let k=0;k<=fs;k++){const t=k/fs,y=Math.sin(2*Math.PI*f*t);svg.appendChild(el('circle',{cx:P.X(t),cy:P.Y(y),r:4,fill:'var(--ink)'}))}
  setMath(read,line('Nyquist','\\(f_s/2='+tnum(fs/2,1)+'\\) Hz, so \\(f\\) is <b>'+(f<fs/2?'below':'above')+'</b> it')
   +line('Alias','the samples are those of a \\('+tnum(fa,1)+'\\) Hz sine'+(fa!==f?' (orange): aliasing':'; no aliasing')))}
 box.querySelectorAll('input').forEach(i=>i.addEventListener('input',rafd(draw)));reg(box,()=>{ctrlTex(box);draw()});ctrlTex(box);draw()};
