import {Graph} from '@antv/g6';

const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const colours=['#137f81','#e1a141','#b16389'];
const labels=['GATEWAY','ACCOUNTS','ORDERS','SEARCH','CACHE','ASSETS','UPLOAD','RENDER','EXPORT','QUEUE','METRICS','AUDIT','ALERTS','REPORT','TRACE'];

export async function create({root,fps}) {
  root.style.background='#eff4f1';
  root.innerHTML=`<div class="mono" style="position:absolute;left:50px;top:55px;color:#5f8072;font-size:14px;letter-spacing:2px">FICTIONAL PLATFORM / SERVICE DEPENDENCIES</div><h1 style="position:absolute;left:46px;top:78px;font-size:57px;margin:0;letter-spacing:-2px">Find the structure.</h1><div id="g6-phase" class="mono" style="position:absolute;left:50px;top:151px;color:#137f81;font-size:14px"></div><div id="g6-host" style="position:absolute;left:40px;top:183px;width:880px;height:330px"></div><div style="position:absolute;left:51px;top:525px;font:12px 'JetBrains Mono';color:#6a8076">15 SERVICES · 3 DOMAINS · DEMO DATA</div>`;
  const bases=labels.map((label,i)=>{const group=Math.floor(i/5),j=i%5;return {id:`s${i}`,label,group,x:440+Math.cos(i*Math.PI*2/15)*281,y:157+Math.sin(i*Math.PI*2/15)*140,tx:145+group*289+Math.cos(j*Math.PI*2/5-Math.PI/2)*99,ty:162+Math.sin(j*Math.PI*2/5-Math.PI/2)*109};});
  const links=[];
  for(let g=0;g<3;g++)for(let j=0;j<5;j++)links.push({id:`l${g}-${j}`,source:`s${g*5+j}`,target:`s${g*5+(j+1)%5}`,group:g,bridge:false});
  links.push({id:'bridge-0',source:'s2',target:'s5',group:0,bridge:true},{id:'bridge-1',source:'s7',target:'s10',group:1,bridge:true},{id:'bridge-2',source:'s12',target:'s0',group:2,bridge:true});
  const graph=new Graph({container:root.querySelector('#g6-host'),width:880,height:330,animation:false,autoResize:false,behaviors:[],node:{type:'circle',style:{size:32,labelFontFamily:'Inter Tight',labelFontSize:11,labelFontWeight:600,labelFill:'#294a3c',labelPlacement:'bottom',labelOffsetY:8,stroke:'#eff4f1',lineWidth:3}},edge:{type:'line',style:{stroke:'#bccac2',lineWidth:1.6,opacity:.8}}});
  graph.setData({nodes:bases.map(n=>({id:n.id,style:{x:n.x,y:n.y,fill:colours[n.group],labelText:n.label}})),edges:links.map(l=>({id:l.id,source:l.source,target:l.target}))});
  await graph.render();
  async function seek(frame){
    const t=frame/fps;
    const arranged=smooth((t-.4)/2)*(1-smooth((t-6.1)/1.7));
    const focus=t>=3&&t<6?Math.min(2,Math.floor(t-3)):-1;
    const pulse=.5+.5*Math.sin(t*Math.PI*2/1.5);
    graph.updateNodeData(bases.map(n=>({id:n.id,style:{x:n.x+(n.tx-n.x)*arranged,y:n.y+(n.ty-n.y)*arranged,fill:colours[n.group],size:focus===n.group?36+4*pulse:32,opacity:focus<0||focus===n.group?1:.38}})));
    graph.updateEdgeData(links.map(l=>({id:l.id,style:{stroke:l.bridge?'#a2b8ab':colours[l.group],lineWidth:l.bridge?1.4:focus===l.group?3:1.8,opacity:focus<0?.72:focus===l.group?1:.19,lineDash:l.bridge?[5,5]:[0,0]}})));
    root.querySelector('#g6-phase').textContent=focus<0?(arranged<.5?'RELATIONSHIPS / ONE NETWORK':'GROUPED / THREE DOMAINS'):['DOMAIN 01 / CUSTOMER','DOMAIN 02 / MEDIA','DOMAIN 03 / OBSERVABILITY'][focus];
    await graph.draw();
  }
  await seek(0);
  return {label:'ANTV G6 / RELATIONSHIP NETWORK',feature:'@antv/g6 Graph, setData/render, circle nodes and line edges, updateNodeData/updateEdgeData/draw; fixed positions and animation:false for arbitrary-order frame seeking',seek};
}
