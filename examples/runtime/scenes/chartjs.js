import {Chart,registerables} from 'chart.js';

Chart.register(...registerables);
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};

export async function create({root,width,height,fps}) {
  root.style.background='#f2efe8';
  root.innerHTML=`<div style="position:absolute;left:62px;top:61px"><div class="mono" style="font-size:15px;color:#547364;letter-spacing:2px">FICTIONAL DATA / 12 WEEK FORECAST</div><h1 style="font-size:53px;letter-spacing:-2px;margin:17px 0">See the trend take shape.</h1></div><div style="position:absolute;right:64px;top:63px;text-align:right"><span class="mono" style="font-size:13px;color:#64786c">WEEK 12</span><div id="chart-kpi" style="font-size:59px;font-weight:800;letter-spacing:-3px;line-height:1.15;color:#23583f">82</div></div><div style="position:absolute;left:62px;top:185px;width:836px;height:302px"><canvas id="chart-canvas" width="836" height="302"></canvas></div><div style="position:absolute;left:72px;top:513px;display:flex;gap:25px;font-size:14px" class="mono"><span style="color:#23583f">● PROJECTED</span><span style="color:#8d9990">— BASELINE</span></div><div id="chart-state" class="mono" style="position:absolute;right:64px;top:513px;font-size:13px;color:#547364">BUILDING THE SERIES</div>`;
  const projected=[32,38,36,43,50,46,58,61,68,65,75,82];
  const revised=[32,38,36,43,50,46,60,67,74,77,85,92];
  const baseline=[31,34,36,38,41,44,47,51,54,58,62,66];
  const canvas=root.querySelector('#chart-canvas');
  let cursor=0;
  const marker={id:'frameCursor',afterDraw(chart){
    const {ctx,chartArea,scales}=chart;
    if(!chartArea)return;
    const x=scales.x.getPixelForValue(cursor);
    ctx.save();ctx.strokeStyle='#23583f42';ctx.setLineDash([4,5]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,chartArea.top+4);ctx.lineTo(x,chartArea.bottom);ctx.stroke();ctx.restore();
  }};
  const chart=new Chart(canvas,{
    type:'line',
    data:{datasets:[
      {label:'Baseline',data:baseline.map((y,x)=>({x,y})),borderColor:'#a2aea5',borderWidth:2,pointRadius:0,borderDash:[5,6],tension:.3},
      {label:'Projected',data:[],borderColor:'#23583f',backgroundColor:'#23583f17',borderWidth:4,fill:true,tension:.35,clip:false,pointRadius:ctx=>Math.abs((ctx.raw?.x??-100)-cursor)<.15?6:0,pointBackgroundColor:'#23583f',pointBorderColor:'#f2efe8',pointBorderWidth:3}
    ]},
    options:{responsive:false,devicePixelRatio:1,animation:false,events:[],parsing:false,normalized:true,plugins:{legend:{display:false},tooltip:{enabled:false}},layout:{padding:{top:10,right:12}},scales:{
      x:{type:'linear',min:0,max:11,grid:{display:false},border:{display:false},ticks:{stepSize:1,color:'#758075',font:{family:'JetBrains Mono',size:12},callback:value=>`W${Number(value)+1}`}},
      y:{min:20,max:100,grid:{color:'#d9ded4',lineWidth:1},border:{display:false},ticks:{stepSize:20,padding:13,color:'#758075',font:{family:'JetBrains Mono',size:12},callback:value=>`${value}k`}}
    }},plugins:[marker]
  });
  return {label:'CHART.JS / A FORECAST IN MOTION',feature:"Chart, line datasets, scriptable pointRadius, canvas plugin, update('none')",seek(frame){
    const t=frame/fps,reveal=ease((t-.35)/2.8),revision=ease((t-4.1)/1.8);
    cursor=11*reveal;
    const values=projected.map((y,i)=>y+(revised[i]-y)*revision);
    const end=Math.floor(cursor);
    const data=values.slice(0,end+1).map((y,x)=>({x,y}));
    if(end<11&&cursor>end)data.push({x:cursor,y:values[end]+(values[end+1]-values[end])*(cursor-end)});
    chart.data.datasets[1].data=data;
    chart.update('none');
    root.querySelector('#chart-kpi').textContent=`${Math.round(values[11])}k`;
    root.querySelector('#chart-state').textContent=t<3.2?'BUILDING THE SERIES':t<4.1?'BASELINE + PROJECTION':revision<1?'UPDATING THE ASSUMPTIONS':'REVISED FORECAST / SAME AXES';
  }};
}
