import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ReactFlow, Background, Handle, Position, BaseEdge, getSmoothStepPath} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const h=React.createElement;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const nextPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

function StageNode({data}) {
  return h('div',{style:{width:150,height:78,border:`1.5px solid ${data.active?'#6253df':'#c9c5d8'}`,background:data.active?'#6253df':'#fff',color:data.active?'#fff':'#272335',borderRadius:14,padding:'13px 15px',boxShadow:data.active?'0 7px 24px #6253df22':'0 3px 9px #27233508'}},
    h(Handle,{type:'target',position:Position.Left,style:{background:'#9b92c4',width:8,height:8,border:'2px solid #fff'}}),
    h('div',{style:{fontSize:11,fontFamily:'JetBrains Mono',letterSpacing:1,opacity:.72}},data.step),
    h('div',{style:{fontSize:20,fontWeight:800,marginTop:4}},data.label),
    h(Handle,{type:'source',position:Position.Right,style:{background:'#9b92c4',width:8,height:8,border:'2px solid #fff'}}));
}

function PacketEdge(props) {
  const [path]=getSmoothStepPath({...props,borderRadius:22});
  return h(React.Fragment,null,
    h(BaseEdge,{id:props.id,path,style:{stroke:props.data.active?'#7567e8':'#cbc6dc',strokeWidth:props.data.active?3:2}}),
    h('path',{id:`xy-path-${props.id}`,d:path,fill:'none',stroke:'none'}),
    h('circle',{id:`xy-dot-${props.id}`,r:5,fill:'#29204f',opacity:props.data.active?1:0}));
}

const nodeTypes={stage:StageNode};
const edgeTypes={packet:PacketEdge};
const definitions=[
  ['brief','01 / INPUT','Brief',0,134,0],
  ['design','02 / BRANCH','Design',217,37,1],
  ['sound','02 / BRANCH','Sound',217,229,1],
  ['compose','03 / MERGE','Compose',444,134,2],
  ['review','04 / OUTPUT','Review',670,134,3],
];
const connections=[['brief','design',.2],['brief','sound',.2],['design','compose',1.4],['sound','compose',1.4],['compose','review',2.8]];

export async function create({root,fps}) {
  root.style.background='#f3f1f8';
  root.innerHTML=`<style>.react-flow__node,.react-flow__edge-path{transition:none!important;animation:none!important}.react-flow__attribution{font-size:9px!important;background:transparent!important}.react-flow__handle{pointer-events:none}</style><div style="position:absolute;left:49px;top:54px;color:#776b9b;font:14px 'JetBrains Mono';letter-spacing:2px">FICTIONAL STUDIO / WORKFLOW EDITOR</div><h1 style="position:absolute;left:45px;top:78px;font-size:57px;letter-spacing:-2px;margin:0">One brief. Two branches.</h1><div id="xy-status" class="mono" style="position:absolute;left:49px;top:152px;font-size:14px;color:#6253df"></div><div id="xy-host" style="position:absolute;left:50px;top:181px;width:860px;height:342px;border:1px solid #ddd8ea;border-radius:18px;overflow:hidden;background:#f9f7fc"></div>`;
  const host=root.querySelector('#xy-host');
  const react=createRoot(host);
  function render(frame) {
    const t=frame/fps;
    const run=clamp((t-.7)/4.5)*3.8;
    const settle=smooth((t-.4)/1.2)*(1-smooth((t-6.4)/1.3));
    const nodes=definitions.map(([id,step,label,x,y,stage])=>({id,type:'stage',position:{x:x+5,y:y+Math.sin(stage*1.9)*12*(1-settle)},width:150,height:78,draggable:false,data:{step,label,active:t>.7&&t<6.8&&run>=stage},style:{width:150,height:78}}));
    const edges=connections.map(([source,target,delay],i)=>({id:`e${i}`,type:'packet',source,target,animated:false,data:{active:t>.7&&t<6.8&&run>delay,progress:((run-delay)*.8%1+1)%1}}));
    flushSync(()=>react.render(h(ReactFlow,{nodes,edges,nodeTypes,edgeTypes,viewport:{x:7,y:0,zoom:1},onViewportChange:()=>{},nodesDraggable:false,nodesConnectable:false,elementsSelectable:false,panOnDrag:false,zoomOnScroll:false,zoomOnPinch:false,zoomOnDoubleClick:false,proOptions:{hideAttribution:false}},h(Background,{color:'#d6d1e4',gap:20,size:1}))));
    root.querySelector('#xy-status').textContent=t<.7?'01 / DEFINE THE BRIEF':t<2.2?'02 / WORK IN PARALLEL':t<4.3?'03 / JOIN THE RESULTS':t<6.8?'04 / READY FOR REVIEW':'RESET / SAME EDITABLE GRAPH';
    return edges;
  }
  async function seek(frame) {
    const edges=render(frame);
    await nextPaint();
    for(const edge of edges){
      const path=root.querySelector(`#xy-path-${edge.id}`),dot=root.querySelector(`#xy-dot-${edge.id}`);
      if(path&&dot){const point=path.getPointAtLength(path.getTotalLength()*edge.data.progress);dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);}
    }
  }
  await seek(0);
  return {label:'REACT FLOW / BRANCH + MERGE',feature:'@xyflow/react ReactFlow controlled nodes/edges, custom nodeTypes with Handle/Position, BaseEdge/getSmoothStepPath, Background; flushSync and frame-derived packets without CSS animation',seek};
}
