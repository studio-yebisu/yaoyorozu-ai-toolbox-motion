import json
"""Draw an original social cover using actual motion specimens and local fonts."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = Path("C:/Windows/Fonts/meiryo.ttc")
BOLD = Path("C:/Windows/Fonts/meiryob.ttc")
if not FONT.exists():
    raise SystemExit("Set FONT and BOLD to Japanese fonts installed on your OS.")

SCALE = 2
im = Image.new("RGB", (1200*SCALE,630*SCALE), "#f5f2ec")
d = ImageDraw.Draw(im)

def f(size,bold=False):
    return ImageFont.truetype(str(BOLD if bold and BOLD.exists() else FONT), int(size*SCALE))

def text(x,y,value,size=16,color="#20252b",bold=False):
    d.text((x*SCALE,y*SCALE),value,font=f(size,bold),fill=color)

def rect(box,fill,outline=None,r=0):
    scaled=tuple(v*SCALE for v in box)
    if r: d.rounded_rectangle(scaled,r*SCALE,fill=fill,outline=outline,width=SCALE)
    else: d.rectangle(scaled,fill=fill,outline=outline,width=SCALE)

rect((48,40,95,87),"#20252b",r=10)
text(58,40,"m",29,"#f5f2ec",True)
text(111,45,"八百万図AIツールボックス / 日本語ガイド",16)
text(51,128,"CLAUDE OPUS 5.5  /  MOTION DESIGN",16,"#697078")
text(48,165,"Claudeでつくる、",43,bold=True)
text(48,225,"モーショングラフィック。",43,bold=True)
total=len(json.loads((ROOT/"data/curation.json").read_text(encoding="utf-8"))["projects"])
text(51,304,f"{total}本の動く作例から、スキルとツールを選ぶ。",21,"#697078")
rect((905,136,1151,334),"#0b5546",r=12)
text(928,143,str(total),88,"#f5f2ec",True)
text(936,267,"動く作例",20,"#f5f2ec",True)
text(936,307,"6カテゴリ / 日本語",14,"#d4e8df")

labels=[("制作スキル","#cbe681"),("動画書き出し","#f2c078"),("UI・文字","#c8b7f0"),("3D","#99d6d5"),("2D・ベクター","#eba9ad"),("データ・図解","#aebee8")]
poster_ids=["remotion-skills","hyperframes","gsap","three","pixi","deck"]
for i,(label,color) in enumerate(labels):
    x=51+i*184
    rect((x,382,x+170,540),"#1c2329",r=9)
    poster=Image.open(ROOT/"assets"/"previews"/f"{poster_ids[i]}.webp").convert("RGB").resize((170*SCALE,106*SCALE),Image.Resampling.LANCZOS)
    mask=Image.new("L",poster.size,0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,poster.width-1,poster.height-1),radius=8*SCALE,fill=255)
    im.paste(poster,(x*SCALE,382*SCALE),mask)
    text(x+15,498,label,16,"#f5f2ec",True)

text(52,579,"GIF・制作コード付き",18,"#0f7a63",True)
text(815,580,"studio-yebisu.github.io",16,"#697078")
im=im.resize((1200,630),Image.Resampling.LANCZOS)
for name in ("og-card-motion-v4.png","og-card.png"):
    out=ROOT/"assets"/name
    out.parent.mkdir(parents=True,exist_ok=True)
    im.save(out,optimize=True)
    print(f"Saved {out.name}: 1200×630, {out.stat().st_size} bytes")
