import mermaid from 'mermaid';

// Mermaid renders the original flowchart once. This example's frame controller
// adds the reveal and focus; Mermaid is not a video or timing-manifest engine.
export async function create({root, fps}) {
  root.style.background = '#f2efe8';
  root.innerHTML = `<div style="position:absolute;left:60px;top:58px"><span class="mono" style="font-size:15px;color:#6953a5;letter-spacing:2px">TEXT → SVG / ORIGINAL STORYBOARD</span><h1 style="font-size:56px;letter-spacing:-2px;margin:14px 0">Give the story a route.</h1></div><div id="diagram" style="position:absolute;left:58px;top:214px;width:844px;height:236px"></div><div class="mono" id="step" style="position:absolute;left:62px;top:476px;font-size:20px;color:#6953a5"></div><div style="position:absolute;right:62px;top:480px;font-size:15px;color:#716c77">SVG diagram + frame-driven focus</div>`;
  mermaid.initialize({
    startOnLoad:false, securityLevel:'strict', theme:'base', htmlLabels:false,
    fontFamily:'Inter Tight',
    themeVariables:{primaryColor:'#e8e0f4',primaryTextColor:'#292334',primaryBorderColor:'#c5b8d9',lineColor:'#a497b6',fontSize:'20px'},
    flowchart:{htmlLabels:false,curve:'basis',nodeSpacing:35,rankSpacing:60}
  });
  const definition = `flowchart LR
    BRIEF["01 · Brief"] --> BUILD["02 · Build"]
    BUILD --> REVIEW{"03 · Review"}
    REVIEW -->|revise| BUILD
    REVIEW -->|ready| EXPORT["04 · Export"]`;
  const {svg} = await mermaid.render('guide-mermaid-route', definition);
  const target = root.querySelector('#diagram');
  target.innerHTML = svg;
  const diagram = target.querySelector('svg');
  diagram.style.cssText = 'width:100%;height:100%;max-width:none;overflow:visible';
  const nodes = ['BRIEF','BUILD','REVIEW','EXPORT'].map(id => target.querySelector(`.node[id*="-flowchart-${id}-"]`));
  if(nodes.some(node=>!node)) throw new Error('Mermaid flowchart nodes missing');
  const paths = [...target.querySelectorAll('.flowchart-link')];
  const captions = ['01 / Define the message','02 / Build an editable scene','03 / Review, then revise','04 / Export the approved scene'];
  const smooth = x => {const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
  return {
    label:'MERMAID / TEXT-DEFINED SVG',
    feature:'mermaid.initialize + mermaid.render, original flowchart SVG; frame-derived reveal and emphasis added by the example',
    seek(frame) {
      const seconds=frame/fps;
      const active=Math.min(3,Math.floor(seconds/1.7));
      const fade=smooth(seconds/.7)*(1-smooth((seconds-7)/.95));
      nodes.forEach((node,index)=>{
        const visible=smooth((seconds-index*.32)/.5);
        node.style.opacity=String(.3+.7*visible);
        for(const shape of node.querySelectorAll('rect,polygon,path')) {
          shape.style.stroke=index===active&&fade>.05?'#6953a5':'#c5b8d9';
          shape.style.strokeWidth=index===active?String(1+2*fade):'1';
          shape.style.fill=index===active?`color-mix(in srgb, #c9b3ed ${Math.round(fade*65)}%, #e8e0f4)`:'#e8e0f4';
        }
      });
      paths.forEach((path,index)=>{
        path.style.opacity=String(.25+.75*smooth((seconds-.35-index*.16)/.8));
        path.style.stroke='#6953a5';
        path.style.strokeDasharray='7 7';
        path.style.strokeDashoffset=String(-seconds*24);
      });
      const step=root.querySelector('#step');
      step.textContent=captions[active];
      step.style.opacity=String(fade);
    }
  };
}
