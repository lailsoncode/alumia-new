// Rive mesh study using the unchanged canonical PNG. Run this authoring script
// to rebuild scene.rml. Illustration pixels are never repainted or resampled here.
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const W=1312,H=1199;
const n=v=>Number(v.toFixed(6));
const xml=(tag,p={},body='')=>`<${tag}${Object.entries(p).map(([k,v])=>` ${k}="${String(v).replaceAll('&','&amp;').replaceAll('"','&quot;')}"`).join('')}>${body}</${tag}>`;
const points=[],lookup=new Set();
const add=(x,y,edge=false)=>{const key=`${x},${y}`;if(!lookup.has(key)){lookup.add(key);points.push({x,y,edge});}};
// The boundary precedes interior mesh points, as expected by the Rive editor.
for(let x=0;x<W;x+=48)add(x,0,true);add(W,0,true);
for(let y=48;y<H;y+=48)add(W,y,true);add(W,H,true);
for(let x=W-48;x>0;x-=48)add(x,H,true);add(0,H,true);
for(let y=H-48;y>0;y-=48)add(0,y,true);
for(let y=48;y<H;y+=48)for(let x=48;x<W;x+=48)add(x,y);

// Bowyer-Watson triangulation, applied only to the rig's geometry.
function triangulate(original){
 const pts=[...original,{x:-W*8,y:-H*4},{x:W*9,y:-H*4},{x:W/2,y:H*9}];
 const circle=(a,b,c)=>{
  const p=pts[a],q=pts[b],r=pts[c];
  const d=2*(p.x*(q.y-r.y)+q.x*(r.y-p.y)+r.x*(p.y-q.y));
  if(Math.abs(d)<1e-7)return null;
  const p2=p.x*p.x+p.y*p.y,q2=q.x*q.x+q.y*q.y,r2=r.x*r.x+r.y*r.y;
  const x=(p2*(q.y-r.y)+q2*(r.y-p.y)+r2*(p.y-q.y))/d;
  const y=(p2*(r.x-q.x)+q2*(p.x-r.x)+r2*(q.x-p.x))/d;
  return {a,b,c,x,y,r2:(x-p.x)**2+(y-p.y)**2};
 };
 let ts=[circle(original.length,original.length+1,original.length+2)];
 for(let i=0;i<original.length;i++){
  const p=pts[i],edges=new Map(),keep=[];
  for(const t of ts){
   if((p.x-t.x)**2+(p.y-t.y)**2<=t.r2+1e-5){
    for(const [a,b] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){const key=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}
   }else keep.push(t);
  }
  for(const [a,b]of edges.values()){const t=circle(a,b,i);if(t)keep.push(t);}ts=keep;
 }
 return ts.filter(t=>t.a<original.length&&t.b<original.length&&t.c<original.length).flatMap(t=>[t.a,t.b,t.c]);
}
const triangles=triangulate(points);
const encoded=[];for(let value of triangles){while(value>=128){encoded.push((value&127)|128);value>>>=7;}encoded.push(value);}
const meshBytes=Buffer.from(encoded).toString('base64');
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=x=>x*x*(3-2*x);
const vertexId=i=>`0:${100+i}`;
const vertices=points.map((p,i)=>{
 // The neck blends head and torso; above the jaw the image follows the head.
 const head=Math.round(255*(1-smooth(clamp((p.y-748)/180,0,1))));
 const values=head|((255-head)<<8);
 return xml(p.edge?'ContourMeshVertex':'MeshVertex',{name:`v${i}`,id:vertexId(i),x:p.x,y:p.y,u:n(p.x/W),v:n(p.y/H)},xml('Weight',{indices:513,values}));
}).join('');
const skin=xml('Skin',{name:'Ligação cabeça e busto',tx:0,ty:0},
 xml('Tendon',{name:'Cabeça',boneId:'0:20',tx:700,ty:820})+
 xml('Tendon',{name:'Busto',boneId:'0:21',tx:700,ty:1110}));
const picture=xml('Image',{name:'Arte canônica · malha',id:'0:10',assetId:'0:60',originX:0,originY:0},
 xml('Mesh',{name:'Malha de deformação',id:'0:11',triangleIndexBytes:meshBytes},vertices+skin));
const blinkMask=xml('Shape',{name:'Máscara interna das lentes',id:'0:84'},
 xml('Ellipse',{name:'Lente esquerda',x:552,y:548,width:174,height:164,rotation:-0.18})+
 xml('Ellipse',{name:'Lente direita',x:822,y:487,width:174,height:174,rotation:-0.20}));
const blinkOverlay=xml('Node',{name:'Pálpebras ilustradas',id:'0:83',x:-700,y:-820,opacity:0},
 xml('Image',{name:'Piscada · recorte registrado',id:'0:82',assetId:'0:61',originX:0,originY:0},
 xml('ClippingShape',{name:'Preservar armação',sourceId:'0:84'}))+blinkMask);
const world=xml('Node',{name:'Alumia · ilustração preservada',x:5,y:14,scaleX:0.48,scaleY:0.48},
 xml('RootBone',{name:'Cabeça',id:'0:20',x:700,y:820,length:100},blinkOverlay)+picture+
 xml('RootBone',{name:'Busto',id:'0:21',x:700,y:1110,length:100}));

const key=(objectId,propertyKey,values,ease='cubic')=>xml('KeyedObject',{objectId},xml('KeyedProperty',{propertyKey},values.map(([frame,value])=>xml('KeyFrameDouble',{frame,value:n(value),interpolationType:ease},ease==='cubic'?xml('CubicEaseInterpolator',{x1:0.42,y1:0,x2:0.58,y2:1}):'')).join('')));
const timeline=(name,id,duration,tracks,loop='loop')=>xml('LinearAnimation',{name,id,duration,fps:60,loopValue:loop},tracks.join(''));
const idle=timeline('Respirar','0:30',360,[
 key('0:20',15,[[0,0],[130,0.012],[270,-0.012],[360,0]]),
 key('0:20',14,[[0,820],[180,817],[360,820]]),
 key('0:21',17,[[0,1],[180,1.004],[360,1]])
]);

// Discrete eyelid replacement avoids ghosted pupils during a crossfade.
const blinkTracks=[key('0:83',18,[[0,0],[160,0],[163,1],[169,1],[173,0],[322,0],[325,1],[328,1],[332,0],[360,0]],'hold')];
const blink=timeline('Piscar','0:31',360,blinkTracks);
const neutral=timeline('Acolher · repouso','0:32',60,[key('0:20',16,[[0,1]])]);
const listen=timeline('Escutar','0:33',240,[key('0:20',16,[[0,1.008],[120,1.013],[240,1.008]])]);
const greet=timeline('Cumprimentar','0:34',120,[key('0:20',16,[[0,1],[22,1.018],[54,1.012],[120,1]])],'oneShot');
const transition=(to,body='',p={})=>xml('StateTransition',{stateToId:to,duration:180,...p},body);
const basicLayer=(name,state,anim)=>xml('StateMachineLayer',{name},
 xml('AnyState',{x:200,y:-120})+xml('ExitState',{x:400,y:-120})+
 xml('EntryState',{},transition(state))+xml('AnimationState',{id:state,x:200,y:100,animationId:anim}));
const bind=(id,kind,key,write=false,value)=>xml(`BindableProperty${kind}`,value===undefined?{}:{propertyValue:value},xml('DataBindContext',{sourcePathIds:`0:40-${id}`,propertyKey:key,...(write?{direction:true}:{})}));
const condition=(id,kind,key,value)=>xml('TransitionViewModelCondition',{},xml('TransitionPropertyViewModelComparator',{},bind(id,kind,key))+xml(`TransitionValue${kind}Comparator`,{value}));
const machine=xml('StateMachine',{name:'AlumiaPresence',id:'0:7'},
 basicLayer('Respiração','0:71','0:30')+basicLayer('Piscada','0:72','0:31')+
 xml('StateMachineLayer',{name:'Atenção'},
 xml('AnyState',{x:400,y:-160},transition('0:75',condition('0:43','Trigger',686,0)))+
 xml('ExitState',{x:650,y:-160})+
 xml('EntryState',{},transition('0:73'))+
 xml('AnimationState',{id:'0:73',x:200,y:0,animationId:'0:32'},transition('0:74',condition('0:42','Boolean',634,true)))+
 xml('AnimationState',{id:'0:74',x:400,y:130,animationId:'0:33'},transition('0:73',condition('0:42','Boolean',634,false)))+
 xml('AnimationState',{id:'0:75',x:650,y:0,animationId:'0:34',reset:true},transition('0:73','',{enableExitTime:true,exitTimeIsPercetange:true,exitTime:100})))+
 ['enter','exit'].map(type=>xml('StateMachineListenerSingle',{name:type==='enter'?'Aproximar':'Afastar',targetId:'0:80',listenerTypeValue:type},xml('ListenerViewModelChange',{},bind('0:42','Boolean',634,true,type==='enter')))).join('')+
 xml('StateMachineListenerSingle',{name:'Toque',targetId:'0:80',listenerTypeValue:'click'},xml('ListenerViewModelChange',{},bind('0:43','Trigger',686,true,1))));
const hit=xml('Shape',{name:'Área de interação',id:'0:80',x:320,y:305},xml('Ellipse',{name:'Limite',width:530,height:570,originX:0.5,originY:0.5})+xml('Fill',{name:'Transparente'},xml('SolidColor',{name:'Cor',colorValue:'00000000'})));
const vm=xml('ViewModel',{name:'AlumiaCharacter',id:'0:40',defaultInstanceId:'0:41'},
 xml('ViewModelPropertyBoolean',{name:'isListening',id:'0:42'})+xml('ViewModelPropertyTrigger',{name:'greet',id:'0:43'})+
 xml('ViewModelInstance',{name:'Default',id:'0:41',exports:true},xml('ViewModelInstanceBoolean',{viewModelPropertyId:'0:42',propertyValue:false})+xml('ViewModelInstanceTrigger',{viewModelPropertyId:'0:43',propertyValue:0})));
const scene=xml('Rive',{version:1,kind:'fragment'},
 xml('Artboard',{name:'Alumia · busto fiel',id:'0:2',width:640,height:600,styleId:'0:5',defaultStateMachineId:'0:7',viewModelId:'0:40',viewModelInstanceId:'0:41'},
 xml('LayoutComponentStyle',{name:'Estilo',id:'0:5'})+hit+world+machine+idle+blink+neutral+listen+greet)+
 xml('ImageAsset',{file:'../reference-pack-v2/alumia-bust-master-v2.png',name:'Alumia · referência canônica',id:'0:60'})+
 xml('ImageAsset',{file:'../reference-pack-v2/alumia-bust-blink-v2.png',name:'Alumia · piscada registrada',id:'0:61'})+vm);
writeFileSync(fileURLToPath(new URL('./scene.rml',import.meta.url)),scene.replaceAll('><','>\n<')+'\n');
console.log(`${points.length} vertices, ${triangles.length/3} triangles, ${blinkTracks.length} eyelid tracks. Original illustration embedded unchanged.`);
