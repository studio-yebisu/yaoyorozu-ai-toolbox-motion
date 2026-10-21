import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

const palette=['#78e8bd','#efb56f','#ac9ced'];
function seededRandom(seed){let state=seed>>>0;return()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};}

export async function create({root,fps}) {
  root.style.background='#101e2c';
  root.innerHTML=`<div class="mono" style="position:absolute;left:49px;top:54px;color:#90adaf;font-size:14px;letter-spacing:2px">FICTIONAL RESEARCH LAB / COLLABORATION MAP</div><h1 style="position:absolute;left:45px;top:78px;font-size:57px;margin:0;color:#ecf1ec;letter-spacing:-2px">Connections have depth.</h1><div id="fg-phase" class="mono" style="position:absolute;left:50px;top:153px;color:#78e8bd;font-size:13px"></div><div id="fg-host" style="position:absolute;left:248px;top:171px;width:670px;height:365px"></div><div style="position:absolute;left:50px;top:235px;width:181px;color:#e1e9e5"><div style="font-size:58px;font-weight:800;line-height:1">36</div><div class="mono" style="font-size:11px;letter-spacing:1.5px;color:#8ba6a9;margin-top:9px">RESEARCH TEAMS</div><div style="height:1px;background:#2a3e4a;margin:24px 0"></div><div id="fg-groups"></div><div class="mono" style="margin-top:24px;font-size:11px;color:#7d9a9e;line-height:1.8">DEMO DATA<br>LAYOUT SEED 260613</div></div>`;
  root.querySelector('#fg-groups').innerHTML=['MATERIALS','SYSTEMS','ENERGY'].map((name,i)=>`<div style="font:13px 'JetBrains Mono';margin:14px 0;color:${palette[i]}"><span style="display:inline-block;width:9px;height:9px;background:${palette[i]};border-radius:50%;margin-right:9px"></span>${name}</div>`).join('');
  const rand=seededRandom(260613);
  const nodes=Array.from({length:36},(_,id)=>({id,group:Math.floor(id/12),x:(rand()-.5)*140,y:(rand()-.5)*100,z:(rand()-.5)*120}));
  const links=[];
  for(let group=0;group<3;group++)for(let j=0;j<12;j++){
    const id=group*12+j;
    if(j)links.push({source:group*12,target:id,group});
    if(j>1)links.push({source:id-1,target:id,group});
  }
  links.push({source:0,target:12,group:3},{source:12,target:24,group:3},{source:24,target:0,group:3});
  const objects=new Map();
  let stopped;
  const ready=new Promise(resolve=>{stopped=resolve;});
  const graph=new ForceGraph3D(root.querySelector('#fg-host'),{rendererConfig:{antialias:true,preserveDrawingBuffer:true}})
    .width(670).height(365).backgroundColor('#101e2c').showNavInfo(false)
    .enableNodeDrag(false).enableNavigationControls(false).enablePointerInteraction(false)
    .warmupTicks(260).cooldownTicks(0).cooldownTime(Infinity)
    .nodeThreeObject(n=>{
      const radius=n.id%12===0?6:3.2;
      const obj=new THREE.Mesh(new THREE.SphereGeometry(radius,18,12),new THREE.MeshStandardMaterial({color:palette[n.group],roughness:.36,metalness:.15,emissive:palette[n.group],emissiveIntensity:.08}));
      objects.set(n.id,obj);return obj;
    })
    .linkColor(l=>l.group===3?'#d5e4df':palette[l.group]).linkWidth(l=>l.group===3?1.1:.5).linkOpacity(.4)
    .onEngineStop(()=>stopped()).graphData({nodes,links});
  graph.d3Force('charge').strength(-54);
  graph.d3Force('link').distance(l=>l.group===3?72:27).strength(.6);
  // The library dry-runs a fixed number of force ticks before rendering. Once
  // it reports the frozen layout, stop its RAF loop and draw only on seek().
  await ready;
  graph.pauseAnimation();
  graph.controls().enabled=false;
  const renderer=graph.renderer();
  renderer.setPixelRatio(1);
  renderer.setSize(670,365);
  const box=graph.getGraphBbox();
  const radius=Math.max(...Object.values(box).flat().map(Math.abs));
  const distance=Math.max(235,radius*3.45);
  const basePositions=new Map(nodes.map(n=>[n.id,{x:n.x,y:n.y,z:n.z}]));
  const camera=graph.camera();
  camera.fov=36;camera.updateProjectionMatrix();
  function seek(frame){
    const t=frame/fps;
    // A complete, gentle orbit returns to the original view at eight seconds.
    const angle=.35*Math.sin(t*Math.PI/4);
    graph.cameraPosition({x:Math.sin(angle)*distance,y:distance*.19,z:Math.cos(angle)*distance},{x:0,y:0,z:0},0);
    camera.lookAt(0,0,0);
    const group=t>=1.5&&t<6.3?Math.min(2,Math.floor((t-1.5)/1.6)):-1;
    for(const n of nodes){
      const mesh=objects.get(n.id),base=basePositions.get(n.id);
      mesh.position.set(base.x,base.y,base.z);
      const active=group<0||n.group===group;
      mesh.material.emissiveIntensity=active?.14+.10*(.5+.5*Math.sin(t*3+n.id*.7)):.025;
      mesh.material.color.set(palette[n.group]).multiplyScalar(active?1:.32);
      const scale=active&&n.id%12===0?1.08+.07*Math.sin(t*3):1;
      mesh.scale.setScalar(scale);
    }
    root.querySelector('#fg-phase').textContent=group<0?'3 COMMUNITIES / 3 BRIDGES':`FOCUS / ${['MATERIALS','SYSTEMS','ENERGY'][group]}`;
    renderer.render(graph.scene(),camera);
  }
  seek(0);
  return {dark:true,label:'3D FORCE GRAPH / COLLABORATION DEPTH',feature:'3d-force-graph ForceGraph3D graphData with seeded positions, d3Force charge/link, warmupTicks(260)/cooldownTicks(0), onEngineStop/pauseAnimation, custom nodeThreeObject, cameraPosition(0ms), renderer().render(scene(),camera()); frozen force layout and pure frame-controlled camera',seek};
}
