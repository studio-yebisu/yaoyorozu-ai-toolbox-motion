import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Bar} from '@nivo/bar';

const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};

export async function create({root,width,height,fps}) {
  root.style.background='#f2efe8';
  root.innerHTML=`<div style="position:absolute;left:62px;top:62px"><div class="mono" style="font-size:15px;color:#537796;letter-spacing:2px">FICTIONAL DATA / TEAM CAPACITY MIX</div><h1 style="font-size:53px;letter-spacing:-2px;margin:17px 0">Where the week goes.</h1></div><div id="capacity-phase" class="mono" style="position:absolute;right:65px;top:142px;font-size:14px;color:#537796">INITIAL PLAN</div><div id="capacity-chart" style="position:absolute;left:52px;top:178px;width:856px;height:326px"></div><div style="position:absolute;left:182px;top:515px;display:flex;gap:34px;font-size:13px" class="mono"><span style="color:#3257a8">● DESIGN</span><span style="color:#7298ce">● BUILD</span><span style="color:#90a8b7">● REVIEW</span></div><span class="mono" style="position:absolute;right:67px;top:515px;font-size:12px;color:#537796">EACH WEEK = 100 UNITS</span>`;
  const reactRoot=createRoot(root.querySelector('#capacity-chart'));
  const e=React.createElement;
  const rows=['WEEK 01','WEEK 02','WEEK 03','WEEK 04'];
  const from=[[54,34,12],[41,46,13],[26,55,19],[18,49,33]];
  const to=[[43,38,19],[32,45,23],[21,49,30],[12,42,46]];
  const theme={text:{fontFamily:'JetBrains Mono',fontSize:12,fill:'#648098'},axis:{domain:{line:{stroke:'transparent'}},ticks:{line:{stroke:'transparent'},text:{fontFamily:'JetBrains Mono',fontSize:12,fill:'#648098'}},legend:{text:{fontFamily:'JetBrains Mono',fontSize:12,fill:'#648098'}}},grid:{line:{stroke:'#d7dfe3',strokeWidth:1}},labels:{text:{fontFamily:'Inter Tight',fontSize:22,fontWeight:600,fill:'#fff'}}};
  const render=(p,reveal)=>{
    const data=rows.map((week,i)=>{const design=from[i][0]+(to[i][0]-from[i][0])*p,build=from[i][1]+(to[i][1]-from[i][1])*p,review=100-design-build;return {week,Design:design*reveal,Build:build*reveal,Review:review*reveal};}).reverse();
    flushSync(()=>reactRoot.render(e(Bar,{
      width:856,height:326,data,indexBy:'week',keys:['Design','Build','Review'],layout:'horizontal',groupMode:'stacked',
      margin:{top:3,right:20,bottom:42,left:130},padding:.28,innerPadding:3,borderRadius:4,
      minValue:0,maxValue:100,valueScale:{type:'linear'},indexScale:{type:'band',round:true},
      colors:['#3257a8','#7298ce','#b4cbd9'],colorBy:'id',theme,
      axisTop:null,axisRight:null,axisLeft:{tickSize:0,tickPadding:18},axisBottom:{tickSize:0,tickPadding:14,tickValues:[0,25,50,75,100],format:v=>`${v}%`},
      enableGridX:true,enableGridY:false,gridXValues:[0,25,50,75,100],
      enableLabel:true,label:d=>`${Math.round(Number(d.value))}`,labelSkipWidth:42,labelSkipHeight:18,labelTextColor:d=>d.data.id==='Review'?'#32516c':'#fff',
      animate:false,isInteractive:false,role:'img',ariaLabel:'Fictional weekly team capacity split into design, build and review'
    })));
  };
  render(0,0);
  return {label:'NIVO / DECLARATIVE CAPACITY MIX',feature:'React Bar, stacked horizontal layout, keys, valueScale, animate=false, flushSync renders',seek(frame){
    const t=frame/fps,reveal=ease((t-.2)/1.5),p=ease((t-3.1)/2.2);
    render(p,reveal);
    root.querySelector('#capacity-phase').textContent=t<3.1?'INITIAL PLAN':p<1?'REALLOCATING THE MIX':'REVIEW GETS MORE ROOM';
  }};
}
