// Source artwork for the native Rive character. All coordinates are authored
// Bezier paths; no image, SVG renderer, or external runtime is used in the rig.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let serial = 1000;
const ids = new Map();
const id = (name) => {
  if (!ids.has(name)) ids.set(name, `0:${serial++}`);
  return ids.get(name);
};
const num = (v) => Number(v.toFixed(5));
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const attrs = (o) => Object.entries(o).filter(([,v]) => v !== undefined).map(([k,v]) => ` ${k}="${esc(v)}"`).join('');
const element = (tag, props={}, children='') => `<${tag}${attrs(props)}>${children}</${tag}>`;
const color = (value) => value.length === 6 ? `FF${value}` : value;
const solid = (c) => element('SolidColor', {colorValue:color(c), name:'Cor'});
const gradient = (stops, p=[0,0,0,640], radial=false) => element(radial?'RadialGradient':'LinearGradient', {
  name:'Luz',startX:p[0],startY:p[1],endX:p[2],endY:p[3]
}, stops.map(([c,v])=>element('GradientStop',{colorValue:color(c),position:v})).join(''));
const fill = (c) => element('Fill',{name:'Preenchimento'},c.startsWith('<')?c:solid(c));
const stroke = (c,w=2) => element('Stroke',{name:'Contorno',thickness:w,cap:'round',join:'round'},solid(c));
const skin = (p=[210,180,390,380]) => gradient([['F7B370',0],['E99350',0.52],['CE703B',1]],p);
const hair = (p=[220,90,370,380]) => gradient([['513124',0],['3A231C',0.55],['2C1B17',1]],p);
const coral = (p=[230,425,420,590]) => gradient([['FF8255',0],['F3673F',0.48],['D9472F',1]],p);

// A small path notation: M start, C two controls and end, L end, Z close.
// Rive represents each vertex with incoming and outgoing polar handles.
function geometry(commands, name='Curva') {
  const verts=[]; let closed=false;
  for (const command of commands) {
    const [op,...p]=command;
    if(op==='M') verts.push({x:p[0],y:p[1]});
    else if(op==='L') verts.push({x:p[0],y:p[1]});
    else if(op==='C') {
      const last=verts.at(-1); last.out=[p[0],p[1]];
      verts.push({x:p[4],y:p[5],in:[p[2],p[3]]});
    } else if(op==='Z') closed=true;
    else throw new Error(`Unknown path command ${op}`);
  }
  if(closed && verts.length>1 && verts[0].x===verts.at(-1).x && verts[0].y===verts.at(-1).y) {
    verts[0].in=verts.at(-1).in; verts.pop();
  }
  return element('PointsPath',{name,isClosed:closed},verts.map(v=>{
    const polar=(p)=>p?[num(Math.atan2(p[1]-v.y,p[0]-v.x)),num(Math.hypot(p[0]-v.x,p[1]-v.y))]:[0,0];
    const [inRotation,inDistance]=polar(v.in);const [outRotation,outDistance]=polar(v.out);
    return element('CubicDetachedVertex',{x:v.x,y:v.y,inRotation,inDistance,outRotation,outDistance});
  }).join(''));
}
const P=(name,commands,c,outline=null,w=2,props={})=>element('Shape',{name,id:id(name),...props},geometry(commands)+(c?fill(c):'')+(outline?stroke(outline,w):''));
const E=(name,x,y,w,h,c,outline=null,sw=2,props={})=>element('Shape',{name,x,y,id:id(name),...props},element('Ellipse',{name:'Elipse',width:w,height:h,originX:0.5,originY:0.5})+(c?fill(c):'')+(outline?stroke(outline,sw):''));
// Artist-friendly back-to-front order; RML has the opposite draw order.
const G=(name,children,props={})=>element('Node',{name,id:id(name),...props},[...children].reverse().join(''));
const pivot=(name,x,y,children,props={})=>G(name,[G(`${name} · desenho`,children,{x:-x,y:-y})],{x,y,...props});

const backHair=[
 P('Silhueta cacheada',[
 ['M',174,420],['C',142,421,127,395,141,369],['C',116,351,127,319,139,300],
 ['C',117,276,133,249,148,235],['C',124,207,145,174,171,162],
 ['C',164,125,188,102,216,96],['C',229,53,280,41,320,55],
 ['C',350,38,390,52,410,81],['C',449,81,474,108,473,139],
 ['C',510,154,514,191,496,215],['C',521,239,520,269,503,286],
 ['C',531,313,513,340,503,350],['C',524,381,499,412,472,413],
 ['C',457,447,427,449,405,436],['C',381,461,349,442,324,444],
 ['C',296,459,268,449,251,435],['C',228,454,188,450,174,420],['Z']
 ],hair(), '2A1A15',2.5),
 P('Mechas inferiores',[
 ['M',164,333],['C',144,355,147,380,170,390],['C',155,418,186,436,210,421],
 ['C',221,441,248,439,262,421],['C',288,438,316,427,320,407],
 ['C',339,434,373,437,396,414],['C',421,436,452,426,453,402],
 ['C',489,414,505,387,482,362],['C',446,335,206,317,164,333],['Z']
 ],'342018'),
 P('Cacho externo esquerdo',[
 ['M',169,167],['C',145,178,139,194,153,214],['C',164,230,135,247,143,269],
 ['C',157,294,144,311,153,331],['C',168,350,188,337,184,316],
 ['C',175,296,197,281,184,260],['C',175,244,197,225,185,205],
 ['C',177,192,193,173,169,167],['Z']
 ],gradient([['553226',0],['37211A',1]],[150,180,194,338])),
 P('Cacho externo direito',[
 ['M',473,204],['C',508,229,489,248,477,266],['C',492,285,501,311,484,329],
 ['C',472,347,491,364,478,386],['C',462,406,442,389,450,365],
 ['C',460,342,437,318,450,296],['C',467,273,447,229,473,204],['Z']
 ],gradient([['4F2D22',0],['2D1B16',1]],[460,208,478,392]))
];

const torso=[
 P('Pescoço',[
 ['M',288,348],['C',293,368,294,388,280,405],['C',292,438,350,439,367,405],
 ['C',349,389,350,366,355,348],['Z']
 ],skin([300,350,344,420]),'B86B38',2),
 P('Sombra sob o queixo',[
 ['M',288,351],['C',307,363,337,365,354,350],['L',351,381],['C',331,394,308,389,293,383],['Z']
 ],'BB6837'),
 P('Camiseta · silhueta',[
 ['M',277,399],['C',255,394,227,405,208,423],['C',194,439,184,460,183,481],
 ['C',201,495,222,500,238,495],['L',240,577],['C',272,597,373,602,405,580],
 ['L',410,492],['C',429,498,449,490,466,478],['C',459,448,448,419,426,409],
 ['C',409,400,386,396,367,399],['C',354,423,295,429,277,399],['Z']
 ],coral(),'BC462D',2.5),
 P('Tecido · lado sombreado',[
 ['M',397,418],['C',385,448,389,484,394,506],['L',393,567],['C',359,584,279,587,241,570],
 ['L',240,578],['C',289,605,375,602,405,580],['L',410,491],['C',432,499,451,488,466,478],
 ['L',455,451],['C',443,468,425,475,411,471],['C',407,448,407,429,397,418],['Z']
 ],'30A33122'),
 P('Tecido · luz',[
 ['M',282,423],['C',298,438,340,444,370,430],['C',377,465,374,491,377,519],
 ['C',349,540,281,535,260,519],['C',258,479,266,444,282,423],['Z']
 ],'24FFC288'),
 P('Costura da gola',[
 ['M',274,402],['C',286,438,352,439,371,402]
 ],null,'D25434',3),
 P('Costura manga esquerda',[
 ['M',229,427],['C',222,446,224,475,235,494]
 ],null,'D75835',2.4),
 P('Costura manga direita',[
 ['M',410,425],['C',414,445,409,468,409,491]
 ],null,'BF492E',2.4),
 P('Barra coral',[
 ['M',241,566],['C',278,584,367,587,403,569]
 ],null,'CB492F',2.5),
 P('Cintura verde-petróleo',[
 ['M',240,577],['C',279,597,372,600,405,580],['L',420,610],
 ['C',363,626,283,624,228,609],['Z']
 ],gradient([['518D8A',0],['356D6D',1]],[300,580,325,626]),'315E5D',2),
 P('Costura cintura',[
 ['M',237,592],['C',282,609,363,612,410,595]
 ],null,'72A3A0',2),
 E('Botão dourado',324,604,8,8,'CEB36F')
];

const leftArm=[
 P('Braço de acolhida',[
 ['M',208,464],['C',206,478,207,505,224,519],['C',239,533,265,515,279,500],
 ['L',300,477],['C',306,469,317,469,322,479],['C',324,486,314,501,307,511],
 ['C',284,549,261,573,230,571],['C',192,570,177,541,178,510],
 ['L',181,480],['C',189,474,198,470,208,464],['Z']
 ],skin([186,472,260,566]),'B76838',2.3),
 P('Mão no peito',[
 ['M',279,501],['C',276,490,278,480,284,471],['L',307,442],
 ['C',311,436,319,438,318,444],['L',304,466],
 ['L',328,443],['C',334,438,340,442,337,448],['L',316,473],
 ['L',341,457],['C',348,453,353,459,348,465],['L',325,487],
 ['L',346,479],['C',352,477,356,483,351,488],['L',322,509],
 ['C',306,519,290,518,279,501],['Z']
 ],skin([288,448,326,516]),'BB6B38',2),
 P('Mão · detalhe dos dedos',[
 ['M',297,480],['C',306,479,314,485,315,494]
 ],null,'CC7841',2),
 P('Braço · luz',[
 ['M',187,503],['C',183,540,205,562,230,558],['C',204,551,199,532,200,514]
 ],null,'36FFCF8E',7)
];

const rightArm=[
 P('Braço da flor',[
 ['M',413,479],['C',413,504,420,537,444,550],['C',471,565,493,547,493,524],
 ['C',493,505,482,488,470,475],['L',447,476],['C',454,495,460,515,452,516],
 ['C',441,514,441,494,443,484],['Z']
 ],skin([423,480,491,549]),'B76838',2.3)
];

const flower=[
 P('Haste da flor',[
 ['M',460,521],['C',455,485,470,441,479,397]
 ],null,'477D4F',6),
 P('Folha esquerda',[
 ['M',466,462],['C',442,464,426,448,429,432],['C',447,432,461,443,466,462],['Z']
 ],gradient([['7DA253',0],['3E743E',1]],[430,431,465,463])),
 P('Folha direita',[
 ['M',470,446],['C',475,423,489,414,504,416],['C',503,435,489,447,470,446],['Z']
 ],gradient([['739D52',0],['3C7244',1]],[494,417,469,447])),
 E('Luz da flor',480,389,115,115,gradient([['70FFCB53',0],['00FFCA51',1]],[0,0,58,0],true)),
 ...[[-1,-23,0],[23,-7,1.15],[14,20,2.5],[-16,18,-2.4],[-24,-8,-1.2]].map(([x,y,r],i)=>E(`Pétala ${i+1}`,480+x,389+y,23,35,gradient([['FFF9BD',0],['FFD96A',0.65],['EFB348',1]],[-6,-15,8,17]),'E8B855',0.7,{rotation:r})),
 E('Miolo luminoso',480,389,22,22,gradient([['FFFEEF',0],['FFE69B',1]],[0,-4,11,0],true),'FFD36B',1),
 P('Mão que segura a flor',[
 ['M',446,492],['C',438,489,436,480,441,475],['C',446,470,459,474,466,478],
 ['C',469,470,478,471,481,478],['L',489,501],['C',491,513,485,527,475,531],
 ['C',465,535,448,525,446,514],['C',443,508,444,499,446,492],['Z']
 ],skin([443,475,489,535]),'B76838',2.2),
 P('Dedos da flor 1',[['M',446,488],['C',453,484,464,488,469,493]],null,'BD6E3A',2),
 P('Dedos da flor 2',[['M',447,500],['C',454,496,463,500,468,505]],null,'BD6E3A',2),
 P('Dedos da flor 3',[['M',451,511],['C',456,508,463,512,467,515]],null,'BD6E3A',2)
];

const face=[
 E('Orelha esquerda',204,287,47,61,skin([-20,-20,24,30]),'A95730',2.5,{rotation:-0.14}),
 P('Orelha esquerda · interior',[['M',208,275],['C',193,264,188,286,198,296],['C',203,298,208,293,203,290]],null,'C77640',4),
 E('Orelha direita',440,278,41,60,skin([-16,-21,19,28]),'A95730',2.5,{rotation:0.12}),
 P('Orelha direita · interior',[['M',436,268],['C',449,256,457,277,444,288]],null,'C77640',4),
 P('Visage · contour',[
 ['M',274,147],['C',298,135,325,126,345,138],['C',367,154,411,172,423,207],
 ['C',437,244,438,292,420,327],['C',406,357,370,375,334,379],
 ['C',291,383,249,369,228,338],['C',207,308,204,267,213,229],
 ['C',220,193,242,164,274,147],['Z']
 ],skin([228,179,412,364]),'A75D35',2.7),
 P('Ombre du visage',[
 ['M',416,209],['C',437,253,433,300,414,330],['C',393,361,355,373,322,372],
 ['C',284,373,247,357,232,333],['C',248,368,291,386,335,379],
 ['C',382,374,414,352,425,323],['C',442,282,432,235,416,209],['Z']
 ],'20A54C27'),
 E('Joue gauche',248,310,53,29,gradient([['65D46D43',0],['00D46D43',1]],[0,0,26,0],true)),
 E('Joue droite',402,303,49,28,gradient([['5FDA7043',0],['00DA7043',1]],[0,0,25,0],true)),
 P('Nez · modelé',[
 ['M',326,257],['C',320,269,310,283,315,291],['C',321,301,338,298,341,287],
 ['C',342,280,334,275,330,272],['C',328,267,329,261,326,257],['Z']
 ],gradient([['F5A05A',0],['D7763D',1]],[316,268,339,296])),
 E('Nez · lumière',325,282,17,10,'35FFD89C'),
 P('Nez · courbe',[['M',315,289],['C',321,296,333,296,339,289]],null,'55B46637',1.8),
 pivot('Mouth',324,330,[
   P('Sourire calme',[['M',302,323],['C',313,335,334,338,348,322]],null,'733A29',4),
   P('Lèvre inférieure',[['M',313,341],['C',323,344,333,343,339,340]],null,'44B76843',2)
 ]),
 pivot('MouthOpen',324,330,[
   P('Sourire ouvert',[['M',301,319],['C',316,328,336,328,351,317],['C',349,350,308,360,301,319],['Z']],'773121'),
   P('Langue',[['M',314,339],['C',321,332,335,333,341,337],['C',334,347,321,350,314,339],['Z']],'D77857')
 ],{opacity:0})
];

function eye(side,x,y) {
 return pivot(`Eye${side}`,x,y,[
   P(`${side} · blanc de l'œil`,[
    ['M',x-23,y+2],['C',x-24,y-25,x+9,y-34,x+23,y-7],
    ['C',x+30,y+17,x+8,y+30,x-10,y+24],['C',x-20,y+20,x-24,y+12,x-23,y+2],['Z']
   ],'FFF0D4'),
   pivot(`Pupil${side}`,x+4,y,[
     E(`${side} · iris`,x+4,y,29,44,gradient([['513022',0],['2C1C18',1]],[-10,-18,12,20])),
     E(`${side} · reflet`,x-2,y-11,7,9,'FFF5D6')
   ]),
   P(`${side} · cils`,[
    ['M',x-24,y],['C',x-22,y-23,x+6,y-31,x+22,y-9],['C',x+25,y-9,x+27,y-13,x+28,y-15]
   ],null,'4D2B21',4.5)
 ]);
}
const eyes=[eye('Left',271,256),eye('Right',372,250)];
const brows=[
 pivot('BrowLeft',271,204,[P('Sourcil gauche',[
 ['M',249,207],['C',258,194,275,190,284,195],['C',290,198,288,204,282,204],
 ['C',270,202,260,205,252,209],['C',249,211,246,211,249,207],['Z']
 ],'452A20')]),
 pivot('BrowRight',371,197,[P('Sourcil droit',[
 ['M',354,194],['C',364,185,386,190,395,201],['C',396,205,393,208,389,205],
 ['C',377,199,367,198,359,201],['C',352,202,348,198,354,194],['Z']
 ],'452A20')])
];
const glasses=[
 P('Branche gauche',[['M',219,244],['L',200,254],['L',204,269]],null,'703F1D',7),
 P('Branche droite',[['M',418,237],['L',435,235],['L',438,253]],null,'703F1D',7),
 P('Pont',[['M',316,251],['C',323,244,331,244,338,249]],null,'653D1D',7),
 P('Pont · lumière',[['M',316,249],['C',323,243,331,243,338,247]],null,'BD8839',3),
 E('Monture gauche · ombre',269,258,94,94,null,'743F21',7),
 E('Monture droite · ombre',377,250,88,91,null,'743F21',7),
 E('Monture gauche · or',269,255,94,94,null,'AD742B',4.3),
 E('Monture droite · or',377,247,88,91,null,'AD742B',4.3),
 P('Monture gauche · reflet',[['M',232,230],['C',247,209,279,205,299,225]],null,'DCB16A',2),
 P('Monture droite · reflet',[['M',347,219],['C',363,203,392,203,407,221]],null,'DCB16A',2)
];
const foreHair=[
 P('Frange · gauche',[
 ['M',174,231],['C',143,219,156,185,185,172],['C',178,144,195,121,222,112],
 ['C',224,79,269,59,305,67],['C',326,58,347,64,351,83],
 ['C',355,107,336,124,313,130],['C',291,136,279,135,267,153],
 ['C',256,168,264,184,244,199],['C',229,211,213,211,207,229],
 ['C',198,247,180,251,174,231],['Z']
 ],hair([223,82,279,236]),'332018',2.1),
 P('Frange · lumière gauche',[
 ['M',181,194],['C',204,176,215,163,228,138],['C',242,105,273,88,305,85],
 ['C',323,85,330,93,315,107],['C',299,121,272,116,257,135],
 ['C',241,155,246,174,225,185],['C',212,193,194,194,181,203],['Z']
 ],gradient([['685038',0],['00563B2B',1]],[228,96,240,204])),
 P('Frange · droite',[
 ['M',348,85],['C',365,69,395,87,404,110],['C',435,113,452,139,445,159],
 ['C',474,172,482,200,463,221],['C',477,245,455,266,438,256],
 ['C',427,250,433,225,418,208],['C',407,194,407,172,389,162],
 ['C',370,151,349,150,342,131],['C',335,114,335,97,348,85],['Z']
 ],hair([354,92,449,254]),'332018',2.1),
 P('Frange · lumière droite',[
 ['M',356,94],['C',375,91,388,107,393,126],['C',406,127,425,139,429,154],
 ['C',408,148,400,141,383,139],['C',366,137,348,119,356,94],['Z']
 ],gradient([['71513A',0],['004E3226',1]],[358,98,405,157])),
 P('Boucle tempe gauche',[
 ['M',183,222],['C',173,247,187,269,183,287],['C',171,305,190,326,204,314],
 ['C',212,304,198,285,207,271],['C',219,253,205,223,198,215],['Z']
 ],'42271E')
];

const head=pivot('Head',322,385,[...face,...eyes,...brows,...glasses,...foreHair]);
const character=G('Alumia',[
 pivot('BackHair',322,385,backHair),G('Torso',torso),pivot('ArmRight',427,465,rightArm),head,
 pivot('ArmLeft',211,485,leftArm),pivot('Flower',460,518,flower)
]);

const K=(name,prop,keys,ease='cubic')=>element('KeyedObject',{objectId:id(name)},element('KeyedProperty',{propertyKey:prop},keys.map(([frame,value])=>element('KeyFrameDouble',{frame,value,interpolationType:ease},ease==='cubic'?element('CubicEaseInterpolator',{x1:0.42,y1:0,x2:0.58,y2:1}):'')).join('')));
const timeline=(name,duration,tracks,loop=true)=>element('LinearAnimation',{name,id:id(name),fps:60,duration,loopValue:loop?'loop':'oneShot'},tracks.join(''));
const anims=[
 timeline('idle',360,[
  K('Head',15,[[0,-0.018],[150,0.013],[270,-0.026],[360,-0.018]]),
  K('Head',14,[[0,385],[180,381],[360,385]]),
  K('BackHair',15,[[0,-0.018],[157,0.013],[277,-0.026],[360,-0.018]]),
  K('BackHair',14,[[0,385],[188,381],[360,385]]),
  K('Torso',17,[[0,1],[180,1.008],[360,1]]),
  K('Flower',15,[[0,-0.025],[180,0.024],[360,-0.025]]),
  K('ArmLeft',15,[[0,0],[180,0.013],[360,0]])
 ]),
 timeline('blink',302,[
  K('EyeLeft',17,[[0,1],[147,1],[152,0.04],[155,0.04],[161,1],[285,1],[290,0.04],[293,1],[302,1]],'linear'),
  K('EyeRight',17,[[0,1],[147,1],[152,0.04],[155,0.04],[161,1],[285,1],[290,0.04],[293,1],[302,1]],'linear')
 ]),
 timeline('expressionNeutral',60,[K('BrowLeft',14,[[0,204]]),K('BrowRight',14,[[0,197]]),K('Mouth',18,[[0,1]]),K('MouthOpen',18,[[0,0]])]),
 timeline('listen',180,[K('BrowLeft',14,[[0,201],[90,199],[180,201]]),K('BrowRight',14,[[0,193],[90,192],[180,193]]),K('Mouth',18,[[0,1]]),K('MouthOpen',18,[[0,0]])]),
 timeline('greet',108,[
  K('BrowLeft',14,[[0,200],[54,198],[108,204]]),K('BrowRight',14,[[0,194],[54,191],[108,197]]),
  K('Mouth',18,[[0,1],[14,0],[88,0],[108,1]],'linear'),K('MouthOpen',18,[[0,0],[14,1],[88,1],[108,0]],'linear')
 ],false)
];
const vm='0:40',vmi='0:41',hover='0:42',greet='0:43';
const bind=(prop,kind,key,write=false,value)=>element(`BindableProperty${kind}`,{propertyValue:value},element('DataBindContext',{sourcePathIds:`${vm}-${prop}`,propertyKey:key,direction:write?true:undefined}));
const condition=(prop,kind,key,value)=>element('TransitionViewModelCondition',{},element('TransitionPropertyViewModelComparator',{},bind(prop,kind,key))+element(`TransitionValue${kind}Comparator`,{value}));
const trans=(to,conditionXml='',props={})=>element('StateTransition',{stateToId:to,duration:220,...props},conditionXml);
const loopLayer=(name,animation,x)=>element('StateMachineLayer',{name},
 element('AnyState',{x:200,y:-100})+element('ExitState',{x:400,y:-100})+
 element('EntryState',{},trans(id(`${name}State`)))+
 element('AnimationState',{x:200,y:100,id:id(`${name}State`),animationId:id(animation)}));
const exprN=id('NeutralState'),exprL=id('ListenState'),exprG=id('GreetState');
const machine=element('StateMachine',{name:'AlumiaPresence',id:'0:7'},
 loopLayer('Breathing','idle')+loopLayer('Blink','blink')+
 element('StateMachineLayer',{name:'Expression'},
  element('AnyState',{x:420,y:-160},trans(exprG,condition(greet,'Trigger',686,0)))+
  element('ExitState',{x:640,y:-160})+
  element('EntryState',{x:0,y:0},trans(exprN))+
  element('AnimationState',{id:exprN,x:210,y:0,animationId:id('expressionNeutral')},trans(exprL,condition(hover,'Boolean',634,true)))+
  element('AnimationState',{id:exprL,x:420,y:140,animationId:id('listen')},trans(exprN,condition(hover,'Boolean',634,false)))+
  element('AnimationState',{id:exprG,x:640,y:0,animationId:id('greet'),reset:true},trans(exprN,'',{enableExitTime:true,exitTimeIsPercetange:true,exitTime:100}))
 )+
 ['enter','exit'].map(type=>element('StateMachineListenerSingle',{name:type==='enter'?'Atenção ao aproximar':'Voltar ao repouso',targetId:id('InteractionArea'),listenerTypeValue:type},element('ListenerViewModelChange',{},bind(hover,'Boolean',634,true,type==='enter')))).join('')+
 element('StateMachineListenerSingle',{name:'Cumprimentar ao tocar',targetId:id('InteractionArea'),listenerTypeValue:'click'},element('ListenerViewModelChange',{},bind(greet,'Trigger',686,true,1)))
);
const hitArea=E('InteractionArea',321,330,405,540,'00000000');
const scene=element('Rive',{version:1,kind:'fragment'},
 element('Artboard',{name:'Alumia · busto',id:'0:2',width:640,height:640,styleId:'0:5',defaultStateMachineId:'0:7',viewModelId:vm,viewModelInstanceId:vmi},
 element('LayoutComponentStyle',{name:'Artboard Style',id:'0:5'})+hitArea+character+machine+anims.join(''))+
 element('ViewModel',{name:'AlumiaCharacter',id:vm,defaultInstanceId:vmi},
  element('ViewModelPropertyBoolean',{name:'isListening',id:hover})+
  element('ViewModelPropertyTrigger',{name:'greet',id:greet})+
  element('ViewModelInstance',{name:'Default',id:vmi,exports:true},
   element('ViewModelInstanceBoolean',{viewModelPropertyId:hover,propertyValue:false})+
   element('ViewModelInstanceTrigger',{viewModelPropertyId:greet,propertyValue:0})))
);
writeFileSync(fileURLToPath(new URL('./scene.rml',import.meta.url)),scene.replaceAll('><','>\n<')+'\n');
console.log(`Authored ${ids.size} named native objects and animation references.`);
