import cytoscape from 'cytoscape';

const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};

export async function create({root,fps}) {
  root.style.background='#fbf1e5';
  root.innerHTML=`<div class="mono" style="position:absolute;left:49px;top:53px;font-size:14px;color:#a56d44;letter-spacing:2px">FICTIONAL DELIVERY GRID / WEIGHTED NETWORK</div><h1 style="position:absolute;left:45px;top:77px;font-size:58px;letter-spacing:-2px;margin:0">A shorter way through.</h1><div style="position:absolute;right:55px;top:155px;text-align:right"><div class="mono" style="font-size:11px;color:#a56d44">SHORTEST ROUTE</div><div id="cy-cost" style="font-size:32px;font-weight:800;color:#b7562c"></div></div><div id="cy-phase" class="mono" style="position:absolute;left:49px;top:156px;font-size:14px;color:#a56d44"></div><div id="cy-host" style="position:absolute;left:47px;top:216px;width:866px;height:293px"></div><div class="mono" style="position:absolute;left:49px;top:526px;font-size:12px;color:#a56d44">EDGE LABELS = FICTIONAL TRAVEL COST · A* SEARCH</div>`;
  const nodes=[];
  for(let row=0;row<3;row++)for(let col=0;col<5;col++)nodes.push({data:{id:`n${row*5+col}`,label:row===1&&col===0?'START':row===1&&col===4?'FINISH':`${String.fromCharCode(65+row)}${col+1}`},position:{x:47+col*190,y:48+row*97}});
  // Cytoscape owns/mutates element position objects. Preserve independent
  // coordinates so a seek never reuses the position from a previous frame.
  const basePositions=new Map(nodes.map(n=>[n.data.id,{...n.position}]));
  const edges=[];
  let ei=0;
  const edge=(a,b,cost)=>edges.push({data:{id:`e${ei++}`,source:`n${a}`,target:`n${b}`,cost}});
  for(let row=0;row<3;row++)for(let col=0;col<4;col++)edge(row*5+col,row*5+col+1,row===1?7:row===0?2:5);
  for(let row=0;row<2;row++)for(let col=0;col<5;col++)edge(row*5+col,(row+1)*5+col,col===0||col===4?2:4);
  const cy=cytoscape({container:root.querySelector('#cy-host'),elements:[...nodes,...edges],layout:{name:'preset',fit:false},zoom:1,pan:{x:0,y:0},userZoomingEnabled:false,userPanningEnabled:false,boxSelectionEnabled:false,autoungrabify:true,autounselectify:true,pixelRatio:1,style:[
    {selector:'node',style:{'width':35,'height':35,'background-color':'#e8c6a2','border-width':2,'border-color':'#fbf1e5','label':'data(label)','font-family':'Inter Tight','font-size':13,'font-weight':800,'color':'#8c532d','text-valign':'center','text-halign':'center'}},
    {selector:'edge',style:{'curve-style':'straight','line-color':'#dfc8b0','width':2,'label':'data(cost)','font-family':'JetBrains Mono','font-size':12,'color':'#a77952','text-background-color':'#fbf1e5','text-background-opacity':1,'text-background-padding':3,'text-rotation':'autorotate'}},
  ]});
  const output=document.createElement('img');
  output.alt='Cytoscape.jsで描画した架空配送網の最短経路';
  Object.assign(output.style,{position:'absolute',left:'47px',top:'216px',width:'866px',height:'293px'});
  root.appendChild(output);
  root.querySelector('#cy-host').style.opacity='0';
  const result=cy.elements().aStar({root:'#n5',goal:'#n9',weight:e=>e.data('cost'),directed:false});
  if(!result.found)throw new Error('Demo route not found');
  const routeNodes=result.path.nodes().map(n=>n.id());
  const routeEdges=new Set(result.path.edges().map(e=>e.id()));
  const routeOrder=new Map(routeNodes.map((id,i)=>[id,i]));
  async function seek(frame){
    const t=frame/fps;
    const progress=clamp((t-.7)/3.3);
    const reveal=progress*(routeNodes.length-1);
    const focus=smooth((t-3.8)/1.1)*(1-smooth((t-6.6)/1.2));
    cy.batch(()=>{
      cy.nodes().forEach(n=>{
        const base=basePositions.get(n.id());
        const order=routeOrder.get(n.id());
        const reached=order!==undefined&&order<=reveal;
        const pulse=order!==undefined?Math.exp(-Math.pow((reveal-order)*2,2)):0;
        n.position({x:base.x,y:base.y+(Number(n.id().slice(1))<5?-11*focus:0)});
        const size=n.id()==='n5'||n.id()==='n9'?51:35;
        n.style({'background-color':reached?'#b7562c':focus>.5?'#f0d8bd':'#e8c6a2','color':reached?'#fff':focus>.5?'#b58e68':'#8c532d','width':size+9*pulse,'height':size+9*pulse,'opacity':1});
      });
      cy.edges().forEach(e=>{
        const onRoute=routeEdges.has(e.id());
        const source=routeOrder.get(e.source().id()),target=routeOrder.get(e.target().id());
        const reached=onRoute&&Math.max(source,target)<=reveal;
        e.style({'line-color':reached?'#b7562c':focus>.5?'#ebd8c4':'#dfc8b0','width':reached?4.2:2,'color':reached?'#b7562c':focus>.5?'#b58e68':'#a77952','opacity':1});
      });
    });
    cy.resize();
    root.querySelector('#cy-cost').textContent=`${result.distance} units`;
    root.querySelector('#cy-phase').textContent=t<.7?'START → FINISH / COMPARE THE COST':progress<1?'FOLLOW THE MINIMUM-COST PATH':'6 STEPS / ONE CHEAPER ROUTE';
    // The official image export renders a fresh frame without the viewport's
    // history-dependent text texture cache. It keeps all drawing in Cytoscape.
    output.src=cy.png({full:false,scale:1,output:'base64uri'});
    await output.decode();
  }
  await seek(0);
  return {label:'CYTOSCAPE.JS / WEIGHTED SHORTEST PATH',feature:'cytoscape preset layout with explicit positions, elements().aStar weighted undirected route, collection path/nodes/edges, cy.batch with frame-controlled node.position and element.style, cy.png fresh frame export; no running layout or animation',seek};
}
