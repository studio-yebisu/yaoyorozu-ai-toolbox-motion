/* Studio Yebisu original machine, MIT.
 * Machine Skill: AirsupHQ/machine-skill @ 35074a9, unmodified lab-kit.js.
 * Reference: Makita AC001G instruction manual (bore 36 mm, stroke 30 mm, tank 7.6 L,
 * 34 L/min at 0.62 MPa gauge). This is an original explanatory bench model, not its CAD.
 * Design assumptions: 55 mm conrod, 6% clearance, n=1.3, crank speed 1,400 rpm;
 * custom casings, motor, belt drive, frame and plumbing. All dimensions are metres.
 * Equations: slider-crank; V_s=pi D^2 S/4; eta_v=1+C-C(P2/P1)^(1/n);
 * Q=V_s*N*eta_v; polytropic work; four-branch p-V cycle. No CFD, valve loss or tank dynamics.
 * Failure: hold the intake reed open -> cylinder stays at inlet pressure -> delivery Q=0.
 * Motion shown at 1:30, numbers use physical rpm; Slow applies a further visual factor only.
 */
const { THREE, Lab, MAT, GEO, clamp, approach, fmt } = window.LabKit;
const PX = -0.083, CY = 0.234, AXIS_Z = 0, R = SPEC.stroke / 2;
const crownOffset = 0.008, topY = CY + R + SPEC.rod + crownOffset + SPEC.clearance * SPEC.stroke;
const initialView = { az:30, el:15, dist:2.50, target:[0,0.185,0], frameX:-0.16, fov:30 };
const lab = new Lab({
  prompt:'単気筒のエアコンプレッサー。断面で、空気を押し出す仕組みを見せて。',
  no:1, title:'Air compressor', sub:'回転が、圧縮に変わる。',
  size:0.432, view:initialView, pills:['Machine Skill','Three.js','Studio Yebisu'],
  cut:{a:[0,0,1],b:[0,0,1],center:[0,0.22,0],reach:0.3},
  bg:0xf3f2ee, saturation:1.0,
});
const applyView = lab._applyView.bind(lab);
lab._applyView = v => {
  if(innerWidth <= 760) {
    const gallery=lab.q.has('gallery')&&window.parent!==window;
    applyView({...v,dist:Math.max(gallery?6.0:4.7,v.dist),frameX:0});
    lab.camera.setViewOffset(innerWidth,innerHeight,0,innerHeight*(gallery?.26:.18),innerWidth,innerHeight);
    lab.camera.updateProjectionMatrix();
  } else applyView(v);
};
lab.setView(initialView);
const inGallery=lab.q.has('gallery')&&window.parent!==window;
if(inGallery){
  document.documentElement.classList.add('machine-gallery');
  document.querySelector('.study-home').removeAttribute('href');
  addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();window.parent.postMessage({type:'motion-example:close'},location.origin);}
  });
}
const oldTitle = lab.$('.lab-title'), title = document.getElementById('machine-title');
title.className=oldTitle.className; title.innerHTML=oldTitle.innerHTML; oldTitle.replaceWith(title);
lab.$('.lab-how summary').textContent='計算モデルと出典';

const paint = MAT.paint({color:[0.035,0.30,0.23],roughness:.3,clearcoat:.55});
const iron = MAT.castIron({color:[.12,.135,.14],roughness:.5});
const al = MAT.aluminiumMachined({roughness:.26});
const steel = MAT.steel({roughness:.24});
const copper = MAT.copper({roughness:.3});
const brass = MAT.brass({roughness:.26});
const rubber = MAT.rubber();
const dark = MAT.satin({color:[.025,.031,.033],roughness:.47});
const addMesh = (geo,material,name,pos,extra={}) => lab.mesh(geo,material,{name,pos,...extra});
const axisZ = geo => geo.rotateX(Math.PI/2);
const bolts = (n,r,y,parent,rot=[0,0,0],size=.0025) => {
  const b = lab.mesh(GEO.bolts(n,r,size,.005),steel,{name:'締結ボルト',parent,pos:[0,y,0],rot,count:n});
  return b;
};

// Assembly 1: grounded base, sealed receiver, cradle and the motor/pump mounting deck.
for(const x of [-.158,.158])for(const z of [-.066,.066])
  addMesh(GEO.disc(.014,.018,.001,24),rubber,'防振脚',[x,.009,z]);
addMesh(GEO.rbox(.37,.014,.158,.005),dark,'ベース',[0,.025,0]);
const tankProfile = [];
const tankR=SPEC.tankRadius, half=SPEC.tankStraight/2;
for(let i=0;i<=16;i++){const a=i/16*Math.PI/2;tankProfile.push([tankR*Math.sin(a),-half-tankR*Math.cos(a)]);}
for(let i=0;i<=16;i++){const a=i/16*Math.PI/2;tankProfile.push([tankR*Math.cos(a),half+tankR*Math.sin(a)]);}
// Closed 3 mm wall; the inside profile returns in the opposite direction.
const inside=tankProfile.slice().reverse().map(([r,y])=>[Math.max(0,r-.003),y-Math.sign(y)*.003]);
const tank=addMesh(GEO.lathe([...tankProfile,...inside],80).rotateZ(-Math.PI/2),paint,'レシーバータンク',[0,.115,0],{xray:'shell'});
for(const x of [-.114,.114]){
  addMesh(GEO.rbox(.025,.012,.143,.002),steel,'タンク支持座',[x,.038,0]);
  addMesh(GEO.rbox(.024,.124,.007,.002),steel,'タンク支持脚',[x,.095,-.075]);
  addMesh(GEO.rbox(.024,.124,.007,.002),steel,'タンク支持脚',[x,.095,.075]);
}
addMesh(GEO.rbox(.288,.012,.115,.003),dark,'モーター取付台',[0,.201,0]);
for(const x of [-.098,.098])for(const z of [-.055,.055])
  addMesh(GEO.disc(.006,.020,.001,20),steel,'台の支柱',[x,.186,z]);
lab.label(tank,'レシーバー',{at:[.08,0,0],value:()=>`${fmt(compressor(0).tankL,1)} L`,side:'left'});

// Assembly 2: motor can, windings, rotor, shaft, bearings, brackets and pulley.
const MX=.075, MY=CY, motorZ=-.018;
const motor=addMesh(axisZ(GEO.tube(.035,.029,.091,64)),iron,'モーター外殻',[MX,MY,motorZ],{xray:'shell',explode:[.08,0,-.04]});
for(let i=0;i<10;i++)addMesh(axisZ(GEO.tube(.039,.0345,.0025,48)),iron,'モーター放熱フィン',[MX,MY,motorZ-.038+i*.0085],{explode:[.08,0,-.04]});
const coils=[];
for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2;
  coils.push(addMesh(axisZ(GEO.disc(.005,.075,.001,20)),copper,'銅巻線',[MX+.0235*Math.sin(a),MY+.0235*Math.cos(a),motorZ],{explode:[.04,0,-.03]}));
}
const motorRotor=addMesh(axisZ(GEO.disc(.017,.082,.0015,48)),steel,'モーターローター',[MX,MY,motorZ],{explode:[.022,0,0]});
addMesh(axisZ(GEO.disc(.004,.143,.0006,32)),steel,'モーター軸',[MX,MY,.0035]);
for(const z of [-.068,.031])addMesh(axisZ(GEO.tube(.032,.0045,.008,48)),al,'モーターエンドベル',[MX,MY,z],{explode:[.04,0,z>0?.043:-.043]});
for(const x of [MX-.027,MX+.027])addMesh(GEO.rbox(.009,.017,.081,.002),iron,'モーター脚',[x,.212,motorZ]);
const motorPulley=addMesh(axisZ(GEO.disc(.0122,.009,.0007,48)),steel,'駆動プーリー',[MX,MY,.064]);
lab.label(motor,'電動モーター',{at:[0,0,-.03],value:()=>`${fmt(sim.rpm*.046/.0122)} rpm`,side:'right'});

// Assembly 3: crankcase and closed bearing/covers.
addMesh(GEO.rbox(.073,.021,.080,.003),al,'ポンプ台座',[PX,.217,0]);
const crankcase=addMesh(axisZ(GEO.tube(.044,.037,.048,64)),al,'クランクケース',[PX,CY,AXIS_Z],{xray:'shell',explode:[-.058,-.015,0]});
for(const z of [-.029,.029]){
  addMesh(axisZ(GEO.tube(.044,.007,.008,64)),al,'クランクカバー',[PX,CY,z],{xray:'shell',explode:[0,0,z>0?.070:-.070]});
  addMesh(axisZ(GEO.tube(.013,.006,.008,48)),steel,'軸受',[PX,CY,z],{explode:[0,0,z>0?.040:-.040]});
  const circle=new THREE.Group();circle.position.set(PX,CY,z+Math.sign(z)*.005);circle.rotation.x=Math.PI/2;
  lab.add(circle,{name:'カバーボルト',count:0,explode:[0,0,z>0?.07:-.07]});bolts(6,.037,0,circle);
}
const crank=new THREE.Group();crank.position.set(PX,CY,0);
lab.add(crank,{name:'クランク軸とウェブ',count:5});
const own=(parent,geo,mat,pos,rot)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);if(rot)m.rotation.set(...rot);parent.add(m);return m;};
own(crank,axisZ(GEO.disc(.006,.118,.0007,32)),steel,[0,0,.018]);
for(const z of [-.012,.012])own(crank,axisZ(GEO.disc(.025,.006,.001,48)),steel,[0,0,z]);
own(crank,axisZ(GEO.disc(.005,.025,.0005,32)),steel,[0,R,0]);
own(crank,GEO.rbox(.033,.009,.026,.003),steel,[0,-.012,0]);
const flywheel=addMesh(axisZ(GEO.tube(.046,.034,.008,64)),iron,'フライホイール',[PX,CY,.064],{explode:[0,0,.075]});
const spokes=new THREE.Group();spokes.position.set(PX,CY,.064);
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const m=own(spokes,GEO.rbox(.007,.037,.006,.001),iron,[.020*Math.sin(a),.020*Math.cos(a),0]);m.rotation.z=-a;}
own(spokes,axisZ(GEO.disc(.011,.012,.001,32)),al,[0,0,0]);
lab.add(spokes,{name:'フライホイールのスポーク',explode:[0,0,.075],count:7});

// A closed solid belt on the exact two external tangents, with eight-millimetre width.
const d=MX-PX,nx=(.046-.0122)/d,ny=Math.sqrt(1-nx*nx),a=Math.atan2(ny,nx);
const beltOuter=[];
for(let i=0;i<=38;i++){const t=a+(2*Math.PI-2*a)*i/38;beltOuter.push(new THREE.Vector3(PX+.0475*Math.cos(t),CY+.0475*Math.sin(t),.064));}
for(let i=0;i<=24;i++){const t=-a+2*a*i/24;beltOuter.push(new THREE.Vector3(MX+.0137*Math.cos(t),MY+.0137*Math.sin(t),.064));}
beltOuter.push(beltOuter[0].clone());
const belt=addMesh(GEO.pipe(beltOuter.map(p=>p.toArray()),.0015,{seg:180,radial:8}),rubber,'駆動ベルト',[0,0,0],{explode:[0,0,.078]});
// Guard is a formed metal hoop, leaving the flywheel and belt legible.
addMesh(GEO.pipe([[-.142,.205,.09],[-.145,.266,.09],[-.129,.293,.09],[-.073,.302,.09],[.105,.272,.09],[.11,.205,.09]],.0025,10),dark,'ベルトガードのフレーム',[0,0,0],{explode:[0,0,.10]});
for(const x of [-.142,.11]) addMesh(GEO.pipe([[x,.205,.09],[x,.205,.054],[x,.203,.049]],.0025,{seg:12,radial:8}),dark,'ベルトガード取付脚',[0,0,0],{explode:[0,0,.10]});

// Assembly 4: cylinder with real wall thickness, eight fins, piston, rings, wrist pin, rod.
const cylBase=CY+.030,cylH=topY-cylBase;
const barrel=addMesh(GEO.tube(.0255,SPEC.bore/2,cylH,64),iron,'シリンダー',[PX,cylBase+cylH/2,0],{xray:'shell',explode:[0,.061,0]});
for(let i=0;i<8;i++)addMesh(GEO.tube(.036,SPEC.bore/2,.0024,56),al,'シリンダー放熱フィン',[PX,cylBase+.002+i*(cylH-.004)/7,0],{explode:[0,.061,0]});
const pistonGroup=new THREE.Group();lab.add(pistonGroup,{name:'ピストンとリング',explode:[-.044,.008,0],count:3});
own(pistonGroup,GEO.lathe([[.012,-.010],[.01775,-.010],[.01775,.008],[0,.008],[0,.004],[.012,.004]],64),al,[0,0,0]);
for(const y of [.001,.0045])own(pistonGroup,GEO.tube(.0179,.0173,.001,48),steel,[0,y,0]);
const wrist=addMesh(axisZ(GEO.disc(.003,.034,.0004,32)),steel,'ピストンピン',[PX,CY+R+SPEC.rod,0],{explode:[0,0,.045]});
const rod=new THREE.Group();lab.add(rod,{name:'コネクティングロッド',explode:[-.025,0,.025],count:3});
own(rod,axisZ(GEO.tube(.009,.0051,.008,40)),steel,[0,-SPEC.rod/2,0]);
own(rod,axisZ(GEO.tube(.006,.0031,.007,40)),steel,[0,SPEC.rod/2,0]);
own(rod,GEO.rbox(.007,SPEC.rod-.012,.005,.0014),steel,[0,.001,0]);

// Assembly 5: gasket, ported valve plate, independent reeds and a two-compartment head.
const plateShape=new THREE.Shape();plateShape.moveTo(-.03,-.025);plateShape.lineTo(.03,-.025);plateShape.lineTo(.03,.025);plateShape.lineTo(-.03,.025);plateShape.closePath();
for(const x of [-.012,.012]){const h=new THREE.Path();h.absarc(x,-.009,.0035,0,Math.PI*2,true);plateShape.holes.push(h);}
const plateGeo=GEO.extrude(plateShape,.0012).rotateX(-Math.PI/2);
addMesh(plateGeo,copper,'ヘッドガスケット',[PX,topY,0],{explode:[0,.085,0]});
const valvePlate=addMesh(plateGeo.clone(),steel,'吸排気バルブプレート',[PX,topY+.0012,0],{explode:[0,.089,0]});
const head=new THREE.Group();head.position.set(PX,topY+.008,0);
own(head,GEO.rbox(.065,.007,.004,.001),al,[0,0,-.026]);own(head,GEO.rbox(.065,.007,.004,.001),al,[0,0,.026]);
for(const x of [-.0305,0,.0305])own(head,GEO.rbox(.004,.007,.052,.0008),al,[x,0,0]);
own(head,GEO.rbox(.065,.004,.055,.001),al,[0,.0055,0]);
lab.add(head,{name:'シリンダーヘッド',xray:'shell',explode:[0,.115,0],count:6});
const intake=addMesh(GEO.rbox(.010,.0005,.019,.00015),steel,'吸気リード弁',[PX-.012,topY+.0028,-.006],{explode:[-.008,.10,0]});
const exhaust=addMesh(GEO.rbox(.010,.0005,.019,.00015),steel,'排気リード弁',[PX+.012,topY+.0028,-.006],{explode:[.008,.10,0]});
for(const x of [PX-.023,PX+.023])for(const z of [-.020,.020])addMesh(GEO.disc(.003,.025,.0004,24),steel,'ヘッドボルト',[x,topY+.008,z],{explode:[0,.13,0]});
const filter=addMesh(GEO.disc(.013,.025,.0015,48),dark,'吸気フィルター',[PX-.052,topY+.010,-.009],{explode:[-.10,.035,0]});
addMesh(GEO.pipe([[PX-.032,topY+.008,-.009],[PX-.041,topY+.008,-.009],[PX-.044,topY+.008,-.009]],.0045,16),brass,'吸気ポート',[0,0,0],{explode:[-.03,.11,0]});
const outletPoints=[[PX+.032,topY+.008,-.009],[PX+.058,topY+.008,-.009],[PX+.075,topY-.016,-.009],[.029,.249,-.009],[.054,.249,-.009],[.063,.226,-.009],[.063,.196,-.009]];
addMesh(GEO.pipe(outletPoints,.0035,14),copper,'吐出冷却管',[0,0,0],{explode:[.071,.025,0]});
for(const [x,y] of [[PX+.032,topY+.008],[.063,.196]])addMesh(GEO.disc(.006,.012,.0006,6),brass,'配管継手',[x,y,-.009]);
addMesh(GEO.disc(.007,.018,.001,6),brass,'逆止弁',[.063,.197,-.009]);
addMesh(GEO.disc(.005,.021,.0005,6),brass,'安全弁',[.114,.200,-.015]);
addMesh(GEO.rbox(.033,.022,.026,.003),dark,'圧力スイッチ',[.133,.212,.010]);

// Gauge, drawn procedurally, attached to a brass manifold (not a floating UI billboard).
const gaugeTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#eae7dc';g.fillRect(0,0,256,256);g.strokeStyle='#1f3433';g.lineWidth=3;for(let i=0;i<=8;i++){const a=(.75+i/8*1.5)*Math.PI;g.beginPath();g.moveTo(128+78*Math.cos(a),128+78*Math.sin(a));g.lineTo(128+95*Math.cos(a),128+95*Math.sin(a));g.stroke();}g.font='18px sans-serif';g.textAlign='center';g.fillStyle='#273d3a';g.fillText('bar',128,187);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
addMesh(GEO.disc(.006,.038,.0006,6),brass,'圧力計の取付管',[.158,.209,.027]);
addMesh(axisZ(GEO.disc(.023,.010,.001,64)),steel,'圧力計外殻',[.158,.230,.031]);
addMesh(axisZ(GEO.disc(.020,.001,.0001,64)),MAT.enamel({color:[1,1,1],map:gaugeTexture,finish:null}),'圧力計文字盤',[.158,.230,.037]);
const gaugeNeedle=addMesh(GEO.rbox(.0012,.017,.0008,.0002),dark,'圧力計指針',[.158,.230,.038]);
gaugeNeedle.geometry.translate(0,.0065,0);gaugeNeedle.rotation.z=-.9;
addMesh(GEO.disc(.004,.025,.0005,6),brass,'ドレン弁',[.155,.024,0]);

// Visible labels and flow paths follow the mechanism.
const sim={rpm:1400,angle:.82,failed:false,headK:330,c:compressor(1400,.82)};
lab.label(barrel,'シリンダー',{at:[-.020,.016,-.005],value:()=>`内径 ${fmt(SPEC.bore*1000)} mm`,side:'left'});
lab.label(pistonGroup,'ピストン',{value:()=>`移動 ${fmt(sim.c.travel*1000,1)} / ${fmt(SPEC.stroke*1000)} mm`,side:'right'});
lab.label(crankcase,'クランクと連接棒',{at:[-.025,0,-.009],value:()=>`${fmt(sim.rpm)} rpm · 動き 1:30`,side:'left'});
lab.label(intake,'吸気弁',{value:()=>sim.failed?'開いたまま':sim.c.inletOpen?'開':'閉',side:'left'});
lab.label(exhaust,'排気弁',{value:()=>sim.c.outletOpen?'開':'閉',side:'right'});
const air=lab.flow({paths:[[[PX-.065,topY+.009,-.009],[PX-.03,topY+.009,-.009],[PX-.012,topY+.003,-.009],[PX,topY-.02,-.008]]],count:34,length:.025,color:()=>[.14,.45,.7],seed:13});
const delivery=lab.flow({paths:[[[PX+.012,topY-.009,-.009],[PX+.012,topY+.008,-.009],...outletPoints]],count:46,length:.025,color:()=>[.9,.40,.10],seed:27});

lab.hero({label:'理論吐出量',unit:'L/min',max:45,digits:1});
const speed=lab.slider({id:'rpm',label:'クランク回転数',min:0,max:1800,value:1400,step:10,unit:'rpm',ends:['停止','1,800 rpm']});
speed.el.setAttribute('aria-label','クランク回転数');
lab.onTick((dt,_,wallDt)=>{
  // Dynamics and readouts follow real wall time; only the visible crank is slowed.
  const physicalDt=lab.paused?0:wallDt;
  sim.rpm=approach(sim.rpm,speed.value,.55,physicalDt);
  sim.angle=(sim.angle+sim.rpm*2*Math.PI/60*dt/30)%(2*Math.PI);
  sim.c=compressor(sim.rpm,sim.angle,sim.failed);
  const c=sim.c;
  crank.rotation.z=-sim.angle;flywheel.rotation.z=-sim.angle;spokes.rotation.z=-sim.angle;
  motorPulley.rotation.z=-sim.angle*.046/.0122;motorRotor.rotation.z=motorPulley.rotation.z;
  lab.place(pistonGroup,PX,CY+c.pinY,0);lab.place(wrist,PX,CY+c.pinY,0);
  lab.place(rod,PX+c.crankX/2,CY+(c.crankY+c.pinY)/2,0);
  rod.rotation.z=Math.atan2(c.crankX,c.pinY-c.crankY);
  intake.rotation.z=sim.failed?-.24:c.inletOpen?-.085:0;exhaust.rotation.z=c.outletOpen?.085:0;
  sim.headK=approach(sim.headK,SPEC.inletK+.48*(c.outletK-SPEC.inletK),12,physicalDt);
  air.speed=(sim.rpm/1400)*.22;air.opacity=lab.state.cut*.8;
  delivery.speed=c.flowLmin/34*.23;delivery.opacity=lab.state.cut*(sim.failed?0:.9);
  gaugeNeedle.rotation.z=-(SPEC.outletGaugePa/100000/8*Math.PI*1.5-.75*Math.PI);
  lab.setHero(c.flowLmin,{state:sim.failed?'吸気弁が閉じない':sim.rpm<1?'停止':'運転中',bad:sim.failed,
    sub:`吐出先 ${fmt(SPEC.outletGaugePa/100000,1)} bar(g) · 所要動力 ${fmt(c.powerW)} W<span>シリンダー内 ${fmt(c.pressureGaugeBar,1)} bar(g) · 動き 1:30</span>`});
  lab._userAt=performance.now(); // The viewer chooses the orbit; no unattended camera spin.
  if(sim.failed)intake.material=brass;else intake.material=steel;
});
const updateLabels=lab._updateLabels.bind(lab);
lab._updateLabels=()=>{
  updateLabels();
  // Keep labels inside the illustration column when the camera moves in close.
  for(const L of lab.labels){
    const rect=L.el.getBoundingClientRect(),edge=innerWidth<=760?innerWidth-18:innerWidth*.665;
    if(rect.right>edge)L.el.style.left=`${parseFloat(L.el.style.left)-(rect.right-edge)}px`;
    if(rect.left<18)L.el.style.left=`${parseFloat(L.el.style.left)+18-rect.left}px`;
    if(rect.top<innerHeight*(innerWidth<=760?.15:.22)||rect.bottom>innerHeight*(innerWidth<=760?.44:.80))L.el.style.opacity='0';
  }
};
lab.breakIt({label:'吸気弁を故障させる',run:()=>{sim.failed=true;},reset:()=>{sim.failed=false;}});
lab.how(`小型コンプレッサーのしくみを説明する独自モデルです。内径36 mm、行程30 mm、タンク7.6 Lは<a href="https://cdn.makitatools.com/apps/cms/doc/prod/AC0/4de11a1e-2abb-436b-a293-7600a5d06a84_AC001G-IM_NA3-2204.pdf" target="_blank" rel="noopener">Makita AC001Gの公開仕様</a>を規模の参考にしています。外観とクランク回転数、余隙率6%、指数1.3はこの作例の設計値です。<br><br>吐出先の圧力を6.2 bar(g)に固定し、平均吐出量とポリトロープ圧縮の所要動力を計算します。1,400 rpmで約33.7 L/min。弁の圧損、漏れ、タンクの充填と温度変化は含みません。吸気弁が開いたままの故障では、室内圧力が大気圧に保たれ、吐出がゼロになります。<br><br>動きは1:30。「スロー」は動きだけをさらに遅くします。<a href="README.md">制作メモと全出典 ↗</a>`,[
  'Vs = π D² S / 4', 'ηv = 1 + C − C (P2/P1)^(1/n)', 'Q = Vs × rpm × ηv × 1000 [L/min]',
  'W = n/(n−1) × P1 × Q/60000 × [(P2/P1)^((n−1)/n)−1] / 0.84 + Wfriction',
]);
// Custom deterministic film: begin with an assembled machine, then inspect each layer.
lab.film('main',{len:28,shots:[
  {t:0,...initialView},{t:3,az:36,el:15,dist:2.50,target:[0,.19,0]},
  {t:6.6,az:36,el:15,dist:2.50,target:[0,.19,0]},
  {t:7.8,az:22,el:10,dist:1.16,target:[PX,.270,0],frameX:-.16},
  {t:13,az:8,el:4,dist:.87,target:[PX,.279,0],frameX:-.18},
  {t:15.4,az:24,el:12,dist:3.15,target:[-.03,.235,0],frameX:-.16},
  {t:20.2,az:25,el:10,dist:1.58,target:[PX,.275,0],frameX:-.18},
  {t:24.8,az:12,el:6,dist:1.10,target:[PX,.286,0],frameX:-.18},
  {t:28,...initialView},
],events:[
  {t:0,type:[0,1.3],beat:['01','回転が、圧縮に変わる。','単気筒コンプレッサーを、部品から見る。'],slider:{id:'rpm',to:850,dur:.1}},
  {t:3,beat:['02','回転数から、吐出量を求める。','36 mm × 30 mm。容積と余隙から計算。'],slider:{id:'rpm',to:1400,dur:2},cursor:{to:'slider:rpm:0.78',dur:1.3}},
  {t:6.2,cursor:{hide:true}},
  {t:7.8,beat:['03','切って、動きを見る。','クランクが回り、ピストンが空気を押す。'],set:{cut:1,labels:1}},
  {t:13.3,beat:['04','部品を、組立方向に分ける。','ヘッド、シリンダー、カバーが開く。'],set:{cut:0,labels:0,explode:1}},
  {t:18.6,set:{explode:0}},
  {t:20.3,beat:['05','吸気弁が、閉じなかったら。','圧縮できず、理論吐出量はゼロになる。'],set:{cut:1,labels:1},cursor:{to:'button:break',dur:.8}},
  {t:21.4,cursor:{click:true},do:()=>lab.breakNow()},
  {t:22,cursor:{hide:true}},
  {t:25.6,beat:['06','もう一度、しくみを確かめる。','ブラウザで回す・切る・分ける。'],do:()=>lab.resetBreak(),set:{cut:0,labels:0}},
]});
const sync=lab._syncButtons.bind(lab);
lab._syncButtons=()=>{sync();for(const b of lab.ui.querySelectorAll('[data-k]')){
  const k=b.dataset.k, names={run:lab.paused?'再生':'停止',explode:'分解',cut:'断面',xray:'X線',slow:'スロー',labels:'部品名',break:lab.broken?'弁を戻す':'吸気弁を故障させる'};
  b.firstChild.textContent=names[k];b.setAttribute('aria-pressed',String(k==='run'?!!lab.paused:k==='break'?lab.broken:lab.target[k]>.5));
}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(reduced.matches&&!lab.filmMode)lab._typePrompt=()=>{};
lab.start();
addEventListener('resize',()=>lab.setView(lab.view));
if(reduced.matches&&!lab.filmMode){lab._assembly=0;lab.toggle('run',true);}
reduced.addEventListener('change',e=>{if(e.matches&&!lab.filmMode){lab._assembly=0;lab.toggle('run',true);}});
let resumeOnVisible=false;
document.addEventListener('visibilitychange',()=>{if(lab.filmMode)return;if(document.hidden){resumeOnVisible=!lab.paused;lab.toggle('run',true);}else if(resumeOnVisible){lab.toggle('run',false);resumeOnVisible=false;}});
lab.render(0);
document.querySelector('.loading').remove();
window.__machineReady=true;
window.__machine={lab,sim,solve:compressor,spec:SPEC,pistonAt,source:'AirsupHQ/machine-skill@35074a9',motionScale:30};
if(inGallery)window.parent.postMessage({type:'motion-example:ready'},location.origin);
