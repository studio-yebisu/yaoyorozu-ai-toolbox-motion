import Plotly from 'plotly.js-dist-min';

const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};

export async function create({root,width,height,fps}) {
  root.style.background='#f2efe8';
  root.innerHTML=`<div style="position:absolute;left:62px;top:62px"><div class="mono" style="font-size:15px;color:#62658f;letter-spacing:2px">FICTIONAL DATA / TWO VARIABLE SCENARIOS</div><h1 style="font-size:53px;letter-spacing:-2px;margin:17px 0">Find a better balance.</h1></div><div id="scenario-chart" style="position:absolute;left:54px;top:175px;width:632px;height:355px"></div><div style="position:absolute;left:742px;top:211px;width:160px"><span class="mono" style="font-size:13px;letter-spacing:1px;color:#62658f">SCENARIO F</span><div id="scenario-value" style="font-size:69px;font-weight:800;letter-spacing:-4px;line-height:1.15;color:#394f9d">70</div><span class="mono" style="font-size:12px;color:#62658f">OUTPUT INDEX</span><div style="margin-top:33px;border-top:1px solid #d7d5d1;padding-top:20px;font-size:19px;line-height:1.45">One plot.<br>Six possibilities.<br>Two dimensions.</div><div id="scenario-phase" class="mono" style="margin-top:22px;font-size:11px;line-height:1.6;color:#62658f">BASE POSITIONS</div></div>`;
  const plot=root.querySelector('#scenario-chart');
  const names=['A','B','C','D','E','F'];
  const startX=[2.2,3.1,5.8,7.4,8.3,9.3],startY=[22,35,41,60,54,70];
  const endX=[1.9,2.5,4.2,5.5,7.2,7.9],endY=[39,49,63,76,79,92];
  const colours=['#8c83a8','#716aa5','#5982bd','#394f9d','#bf806a','#a45c4d'];
  const traces=(p,frontier)=>{
    const x=startX.map((v,i)=>v+(endX[i]-v)*p),y=startY.map((v,i)=>v+(endY[i]-v)*p);
    return [
      {type:'scatter',mode:'markers',x:startX,y:startY,marker:{size:15,color:'#dedad3',line:{color:'#b6b0a8',width:1}},hoverinfo:'skip',showlegend:false},
      ...names.map((_,i)=>({type:'scatter',mode:'lines',x:[startX[i],x[i]],y:[startY[i],y[i]],line:{color:'#c3beb8',width:1.5,dash:'dot'},hoverinfo:'skip',showlegend:false})),
      {type:'scatter',mode:'lines',x:[x[0],x[1],x[3],x[5]],y:[y[0],y[1],y[3],y[5]],line:{color:'#394f9d',width:2,dash:'dash'},opacity:frontier,hoverinfo:'skip',showlegend:false},
      {type:'scatter',mode:'markers+text',x,y,text:names,textposition:'middle center',textfont:{family:'Inter Tight',size:17,color:'#fff'},marker:{size:[34,40,37,45,42,49],color:colours,line:{color:'#f2efe8',width:3}},cliponaxis:false,hoverinfo:'skip',showlegend:false}
    ];
  };
  const layout={width:632,height:355,margin:{l:57,r:16,t:9,b:48},paper_bgcolor:'#f2efe8',plot_bgcolor:'#f2efe8',font:{family:'JetBrains Mono',size:12,color:'#777580'},showlegend:false,transition:{duration:0},xaxis:{range:[0,11],tickvals:[0,2,4,6,8,10],fixedrange:true,showline:false,zeroline:false,gridcolor:'#dddad5',title:{text:'EFFORT / INDEX',font:{family:'JetBrains Mono',size:11,color:'#777580'},standoff:12}},yaxis:{range:[0,105],tickvals:[0,25,50,75,100],fixedrange:true,showline:false,zeroline:false,gridcolor:'#dddad5',title:{text:'OUTPUT / INDEX',font:{family:'JetBrains Mono',size:11,color:'#777580'},standoff:9}}};
  const config={staticPlot:true,displayModeBar:false,responsive:false,showTips:false};
  await Plotly.newPlot(plot,traces(0,0),layout,config);
  return {label:'PLOTLY.JS / SCATTER + SCENARIO UPDATE',feature:'Plotly.newPlot, Plotly.react, scatter traces, immutable data arrays, transition.duration=0',seek:async frame=>{
    const t=frame/fps,p=ease((t-.8)/3.6),frontier=ease((t-4.5)/1.3);
    await Plotly.react(plot,traces(p,frontier),layout,config);
    root.querySelector('#scenario-value').textContent=Math.round(startY[5]+(endY[5]-startY[5])*p);
    root.querySelector('#scenario-phase').textContent=t<.8?'BASE POSITIONS':p<1?'UPDATING SCENARIOS':frontier<1?'CONNECTING THE OPTIONS':'COMPARISON COMPLETE';
  }};
}
