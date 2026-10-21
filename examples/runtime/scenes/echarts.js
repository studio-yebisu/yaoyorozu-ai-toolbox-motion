import * as echarts from 'echarts';

const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};

export async function create({root,width,height,fps}) {
  root.style.background='#f2efe8';
  root.innerHTML=`<div style="position:absolute;left:62px;top:62px"><div class="mono" style="font-size:15px;color:#a15c49;letter-spacing:2px">FICTIONAL DATA / CAMPAIGN ACTIVITY</div><h1 style="font-size:53px;letter-spacing:-2px;margin:17px 0">A launch leaves a pattern.</h1></div><div id="heat-phase" class="mono" style="position:absolute;right:62px;top:146px;font-size:14px;color:#a15c49">DAY 01</div><div id="heat-chart" style="position:absolute;left:52px;top:179px;width:856px;height:349px"></div>`;
  const chart=echarts.init(root.querySelector('#heat-chart'),null,{renderer:'svg',width:856,height:349});
  const days=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));
  const channels=['DIRECT','SEARCH','SOCIAL','EMAIL','PARTNERS','COMMUNITY'];
  const base=channels.flatMap((_,row)=>days.map((__,col)=>9+((row*19+col*7+13)%17)));
  const series=(time)=>{
    const focus=11*ease((time-.5)/6.6),intro=ease(time/.8);
    return channels.flatMap((_,row)=>days.map((__,col)=>{
      const burst=67*Math.exp(-Math.pow((col-focus)/1.45,2))*[.55,.72,1,.83,.48,.9][row];
      const trail=22*Math.exp(-Math.pow((col-focus+2.3)/2.2,2));
      return {value:[col,row,Math.round((base[row*12+col]+burst+trail)*intro)],itemStyle:{borderColor:Math.abs(col-focus)<.5?'#a45338':'#f2efe8',borderWidth:Math.abs(col-focus)<.5?2:4}};
    }));
  };
  chart.setOption({animation:false,textStyle:{fontFamily:'Inter Tight'},tooltip:{show:false},grid:{left:121,right:8,top:6,bottom:85},xAxis:{type:'category',data:days,position:'top',axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:'JetBrains Mono',fontSize:12,color:'#8b776e',margin:13},splitArea:{show:false}},yAxis:{type:'category',inverse:true,data:channels,axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:'JetBrains Mono',fontSize:12,color:'#685b55',margin:18}},visualMap:{min:0,max:100,calculable:false,orient:'horizontal',left:123,bottom:5,itemWidth:14,itemHeight:256,inRange:{color:['#eee5d5','#e2c2a6','#d8996f','#c97149','#a45338']},text:['HIGH ACTIVITY','LOW'],textGap:14,textStyle:{fontFamily:'JetBrains Mono',fontSize:11,color:'#8b776e'},show:true},series:[{id:'activity',type:'heatmap',data:series(0),silent:true,progressive:0,label:{show:false},emphasis:{disabled:true}}]});
  return {label:'APACHE ECHARTS / ACTIVITY HEATMAP',feature:'echarts.init, heatmap series, visualMap, setOption, SVG renderer, animation=false',seek(frame){
    const t=frame/fps;
    chart.setOption({series:[{id:'activity',data:series(t)}]},{lazyUpdate:false});
    const day=1+Math.round(11*ease((t-.5)/6.6));
    root.querySelector('#heat-phase').textContent=`DAY ${String(day).padStart(2,'0')} / 12`;
  }};
}
