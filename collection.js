import * as THREE from './vendor/three.module.js';

function path(commands){const s=new THREE.Shape();for(const [op,...a]of commands)s[op](...a);return s;}
const M='moveTo',L='lineTo',C='bezierCurveTo',Q='quadraticCurveTo';
function ellipseHole(s,x,y,rx,ry){const p=new THREE.Path();p.absellipse(x,y,rx,ry,0,Math.PI*2,true);s.holes.push(p);}
function bird(){const s=path([[M,-1.48,-.56],[L,-.91,-.03],[C,-1.29,.49,-1.02,1.01,-.48,1.22],[C,-.11,1.36,.01,1.57,.10,1.92],[C,.17,2.31,.59,2.45,.94,2.26],[C,1.05,2.19,1.10,2.09,1.11,1.99],[L,1.85,1.70],[L,1.07,1.73],[C,1,1.47,.77,1.28,.61,1.1],[C,.81,.65,.62,.11,.22,-.13],[C,.19,-.30,.16,-.48,.18,-.59],[Q,.38,-.60,.57,-.65],[Q,.63,-.68,.55,-.70],[Q,.30,-.65,.13,-.67],[Q,.06,-.66,.075,-.58],[L,.04,-.23],[C,-.22,-.36,-.54,-.30,-.73,-.14],[L,-1.48,-.56]]);ellipseHole(s,.73,2.08,.076,.076);return s;}
function hare(){const s=path([
 [M,-1.22,-.65],[Q,-1.53,-.35,-1.31,-.02],[Q,-1.32,.85,-.56,1.02],[Q,-.40,1.27,-.15,1.40],
 [C,-.22,1.97,-.09,2.48,.06,2.44],[C,.23,2.39,.22,1.91,.23,1.68],
 [C,.42,2.07,.73,2.29,.88,2.17],[C,1.03,2.05,.54,1.62,.43,1.47],
 [Q,.96,1.42,1.03,1.08],[L,1.31,.91],[Q,1.43,.79,1.20,.72],[L,.82,.65],
 [Q,.67,.19,.45,-.10],[Q,.48,-.44,.60,-.56],[Q,.86,-.57,.94,-.68],[Q,.89,-.76,.72,-.74],
 [L,.29,-.74],[Q,.16,-.44,.08,-.26],[Q,-.18,-.58,-.52,-.62],[Q,-.34,-.67,-.28,-.76],
 [L,-1.22,-.76],[Q,-1.39,-.72,-1.22,-.65]]);ellipseHole(s,.72,1.11,.050,.050);return s;}
function whale(){const s=path([
 [M,-1.47,.11],[C,-1.66,.79,-1.02,1.40,-.22,1.29],[C,.47,1.24,.85,.77,1.11,.97],
 [Q,1.40,1.27,1.24,1.70],[Q,.80,1.71,.61,2.03],[Q,1.07,2.13,1.47,1.89],
 [Q,1.71,2.22,2.01,2.16],[Q,1.99,1.65,1.63,1.52],[C,1.77,.66,1.03,.02,.20,-.22],
 [C,.14,-.37,.06,-.55,-.14,-.66],[Q,-.37,-.65,-.43,-.54],[Q,-.31,-.44,-.26,-.20],
 [C,-.94,-.42,-1.42,-.14,-1.47,.11]]);ellipseHole(s,-1.02,.76,.050,.050);return s;}
function butterfly(){return path([
 [M,-.055,-.53],[Q,-.13,-.18,-.11,.20],[C,-.58,-.36,-1.25,-.37,-1.27,.19],[Q,-1.30,.50,-.86,.84],
 [C,-1.43,1.35,-1.69,2.12,-1.25,2.12],[C,-.83,2.08,-.31,1.47,-.13,1.20],
 [L,-.10,1.61],[L,-.30,1.97],[Q,-.33,2.07,-.25,2.02],[L,0,1.67],
 [L,.23,2.04],[Q,.31,2.08,.28,1.98],[L,.09,1.61],[L,.13,1.20],
 [C,.35,1.50,.89,2.12,1.30,2.04],[C,1.73,1.95,1.38,1.22,.88,.84],
 [Q,1.30,.52,1.24,.16],[C,1.16,-.34,.58,-.38,.11,.20],[Q,.13,-.18,.055,-.53],[Q,0,-.65,-.055,-.53]]);}
function fox(){const s=path([
 [M,-1.35,-.56],[C,-1.75,.03,-1.54,.97,-.85,1.29],[Q,-1.18,.76,-.83,.32],[Q,-.60,.08,-.31,.09],
 [Q,-.60,.58,-.39,1.10],[L,-.39,2.03],[L,.10,1.69],[L,.58,2.02],[L,.65,1.40],
 [Q,.83,1.25,1.29,1.08],[Q,1.45,.98,1.27,.93],[L,.83,.84],[Q,.62,.63,.38,.51],
 [Q,.32,.08,.43,-.50],[Q,.66,-.54,.73,-.66],[Q,.63,-.73,.43,-.73],[L,.11,-.73],
 [Q,.04,-.51,-.12,-.31],[Q,-.49,-.92,-1.35,-.56]]);ellipseHole(s,.48,1.30,.050,.050);return s;}
function deer(){const s=path([
 [M,-.67,-.77],[C,-.63,-.40,-.36,-.06,-.33,.36],[Q,-.57,.73,-.91,1.06],[Q,-.58,1.20,-.22,1.02],[L,-.20,1.36],
 [C,-.58,1.56,-.75,1.97,-.85,2.28],[Q,-.78,2.33,-.74,2.20],[L,-.55,1.91],[L,-.58,2.32],
 [Q,-.50,2.38,-.48,2.24],[L,-.45,1.80],[Q,-.30,1.62,-.13,1.54],[L,-.04,2.10],
 [Q,-.22,2.18,-.28,2.40],[Q,-.23,2.47,-.17,2.32],[L,.02,2.16],[L,.17,2.45],
 [Q,.25,2.46,.20,2.30],[L,.09,2.02],[L,.13,1.52],[Q,.39,1.69,.48,1.92],
 [L,.54,2.32],[Q,.62,2.36,.63,2.23],[L,.63,2.01],[L,.84,2.25],[Q,.94,2.29,.88,2.15],
 [Q,.71,1.68,.36,1.40],[L,.37,1.19],[Q,.69,1.39,.95,1.27],[Q,.86,1.02,.62,.94],
 [Q,.80,.67,1.00,.59],[Q,1.18,.52,1.13,.40],[Q,1.03,.24,.81,.33],[L,.59,.39],
 [Q,.45,.06,.50,-.25],[Q,.53,-.55,.69,-.74],[Q,.20,-.64,-.13,-.74],[L,-.67,-.77]]);
 ellipseHole(s,.43,.91,.035,.035);return s;}
function elephant(){const s=path([
 [M,-1.25,-.54],[Q,-1.40,-.54,-1.38,-.38],[L,-1.27,.40],[L,-1.48,.62],
 [Q,-1.55,.41,-1.62,.28],[Q,-1.72,.26,-1.66,.43],[L,-1.48,.95],
 [C,-1.08,1.85,-.16,1.95,.51,1.57],[Q,.63,1.72,.78,1.65],
 [C,1.03,1.98,1.49,1.71,1.51,1.29],[Q,1.58,1.08,1.56,.88],
 [C,1.60,.52,1.63,.12,1.50,-.14],[Q,1.37,-.41,1.13,-.26],[Q,1.05,-.17,1.13,-.10],
 [Q,1.33,-.23,1.36,.04],[L,1.25,.72],[Q,1.09,.60,.93,.69],[Q,.92,.45,.74,.38],
 [Q,.69,.14,.75,-.32],[Q,.82,-.49,.66,-.53],[L,.34,-.53],[Q,.21,-.50,.26,-.33],
 [L,.21,.18],[Q,-.20,.04,-.74,.20],[L,-.86,-.34],[Q,-.87,-.52,-1.03,-.54],[L,-1.25,-.54]]);
 ellipseHole(s,1.27,1.32,.043,.043);
 const ear=new THREE.Path();ear.moveTo(.49,1.49);ear.bezierCurveTo(.22,1.27,.31,.91,.67,.77);ear.bezierCurveTo(.42,1.04,.40,1.28,.49,1.49);s.holes.push(ear);return s;}
function cat(){return path([
 [M,-1.01,-.73],[C,-1.77,-.39,-1.63,.88,-1.11,1.12],[Q,-1.47,.39,-.92,.06],[Q,-.68,.07,-.64,.43],
 [L,-.55,1.20],[Q,-.86,1.52,-.78,1.85],[L,-.74,2.21],[L,-.36,1.97],[Q,-.12,2.08,.12,1.99],
 [L,.42,2.24],[L,.47,1.84],[Q,.67,1.44,.34,1.15],[C,.44,.87,.64,.40,.63,.04],
 [Q,.71,-.31,.79,-.58],[Q,.84,-.74,.58,-.74],[L,.08,-.74],[Q,.02,-.66,0,-.43],
 [L,-.10,-.73],[L,-1.01,-.73]]);}
function seahorse(){const s=path([
 [M,-.62,-.64],[C,-1.23,-.36,-.82,.20,-.31,.04],[Q,-.10,-.11,-.25,-.31],
 [Q,-.36,-.43,-.48,-.27],[Q,-.57,-.41,-.43,-.48],[C,-.08,-.70,.26,-.30,.10,.05],
 [C,-.57,.48,-.55,1.05,-.19,1.40],[Q,-.29,1.52,-.34,1.61],[Q,-.20,1.68,-.16,1.76],
 [Q,-.28,1.83,-.26,1.91],[L,.02,1.96],[C,.23,2.36,.88,2.32,1.04,1.95],
 [L,1.42,1.82],[Q,1.49,1.68,1.44,1.62],[L,.96,1.58],[Q,.81,1.30,.48,1.27],
 [Q,.39,.96,.66,.70],[Q,.62,.62,.49,.58],[Q,.54,.48,.59,.45],[Q,.51,.38,.40,.34],
 [C,.94,-.58,-.06,-1.05,-.62,-.64]]);ellipseHole(s,.75,1.94,.050,.050);return s;}
function tortoise(){const s=path([
 [M,-1.55,.12],[L,-1.80,.23],[L,-1.46,.39],[C,-1.32,1.20,-.14,1.47,.70,1.05],
 [C,.98,.92,1.03,.64,1.07,.43],[Q,1.20,.42,1.24,.57],[C,1.36,.83,1.67,.84,1.82,.68],
 [Q,1.99,.52,1.83,.38],[Q,1.66,.22,1.39,.30],[Q,1.25,.19,1.12,.17],
 [C,1.12,-.02,1.34,-.25,1.22,-.42],[Q,1.10,-.56,.85,-.47],[Q,.82,-.43,.85,-.36],
 [L,.70,.02],[Q,.31,-.10,-.13,-.09],[C,-.26,-.10,-.28,-.40,-.43,-.56],
 [Q,-.53,-.68,-.77,-.58],[Q,-.87,-.53,-.80,-.44],[Q,-.84,-.16,-1.01,.05],[Q,-1.36,.07,-1.55,.12]]);
 ellipseHole(s,1.73,.57,.035,.035);const rim=new THREE.Path();rim.moveTo(-1.15,.35);rim.bezierCurveTo(-.59,.19,.24,.17,.86,.35);rim.bezierCurveTo(.23,.24,-.55,.28,-1.15,.35);s.holes.push(rim);return s;}
const birdSites=[[-.91,.29],[-.72,.82],[-.30,.23],[-.23,.79],[.17,.37],[.13,1.12],[.25,1.59],[.29,2.03],[.65,2.23],[.97,2.03],[1.44,1.83],[.84,1.55],[.48,.85],[.52,.16],[-.82,-.11],[-1.16,-.35],[.12,-.38],[.40,-.71]];
const designs=[
 {id:'bird',name:'A small bird',shape:bird,kind:'cells',points:birdSites,profile:'dome',thickness:.018,bulge:.035,depth:(x,y)=>.53+.085*Math.sin(y*2.1)+.025*Math.cos(x*2.6),construction:'Eighteen curved porcelain fragments'},
 {id:'hare',name:'A hare',shape:hare,kind:'vertical',count:13,profile:'reed',thickness:.014,bulge:.040,depth:(x,y,i)=>.54+.085*Math.sin(i*1.8),construction:'Slender bowed reeds in staggered planes'},
 {id:'fox',name:'A fox',shape:fox,kind:'cells',count:13,profile:'fold',thickness:.015,bulge:.045,depth:(x,y,i)=>.54+.080*Math.sin(i*2.1),construction:'Soft-folded angular ceramic petals'},
 {id:'deer',name:'A deer',shape:deer,kind:'cells',count:11,profile:'scoop',thickness:.016,bulge:.045,depth:(x,y,i)=>.55+.075*Math.cos(i*1.9),construction:'Curved leaf-like shells'},
 {id:'elephant',name:'An elephant',shape:elephant,kind:'cells',count:10,profile:'dome',thickness:.014,bulge:.035,depth:(x,y,i)=>.54+.095*Math.sin(i*2.39),construction:'Ten broad curved porcelain shells'},
 {id:'cat',name:'A cat',shape:cat,kind:'diagonal',count:10,profile:'scoop',thickness:.014,bulge:.045,depth:(x,y,i)=>.54+.080*Math.sin(i*1.9),construction:'Ten large bent sheets'},
 {id:'whale',name:'A whale',shape:whale,mirrorX:.5,kind:'diagonal',count:9,profile:'twist',thickness:.016,bulge:.038,depth:(x,y,i)=>.53+.090*Math.sin(i*1.31),construction:'Nine twisting water-like ribbons'},
 {id:'seahorse',name:'A seahorse',shape:seahorse,kind:'vertical',count:12,profile:'twist',thickness:.014,bulge:.042,depth:(x,y,i)=>.55+.075*Math.sin(i*1.05),construction:'Long gently twisting blades'},
 {id:'butterfly',name:'A butterfly',shape:butterfly,kind:'radial',count:12,center:[0,.65],profile:'fold',thickness:.012,bulge:.030,depth:(x,y,i)=>.54+.080*Math.cos(i*1.71),construction:'Twelve shallow folded radial panels'},
 {id:'tortoise',name:'A tortoise',shape:tortoise,kind:'horizontal',count:8,profile:'scoop',thickness:.018,bulge:.045,depth:(x,y,i)=>.55+.080*Math.sin(i*2.07),construction:'Eight open curved shell bands'}
];
const cache=new Map();
function inside(p,loop){let c=false;for(let i=0,j=loop.length-1;i<loop.length;j=i++)if((loop[i].y>p.y)!==(loop[j].y>p.y)&&p.x<(loop[j].x-loop[i].x)*(p.y-loop[i].y)/(loop[j].y-loop[i].y)+loop[i].x)c=!c;return c;}
export const collection=designs.map(({id,name,construction})=>({id,name,construction}));
export function getDesign(index=0){
 index=((index%designs.length)+designs.length)%designs.length;if(cache.has(index))return cache.get(index);
 const d={...designs[index]},source=d.shape().extractPoints(index===0?28:24);d.contour=source.shape;d.holes=source.holes;if(d.mirrorX!==undefined)for(const p of [...d.contour,...d.holes.flat()])p.x=d.mirrorX-p.x;d.triangles=THREE.ShapeUtils.triangulateShape(d.contour,d.holes);d.flat=[...d.contour,...d.holes.flat()];
 d.contains=(x,y)=>inside({x,y},d.contour)&&!d.holes.some(h=>inside({x,y},h));
 let points=d.points;
 if(!points&&d.kind==='cells'){
  points=[];for(let n=0;points.length<d.count&&n<3000;n++){const x=-1.45+((n*.61803398875+.17)%1)*3.35,y=-.75+((n*.41421356237+.31)%1)*3.10;if(d.contains(x,y)&&points.every(p=>Math.hypot(x-p[0],y-p[1])>.25))points.push([x,y]);}
 }
 d.regions=[];
 if(d.kind==='cells')d.regions=points.map(([x,y],i)=>({x,y,i,cuts:points.filter((_,j)=>j!==i).map(([xx,yy])=>[xx-x,yy-y,(xx*xx+yy*yy-x*x-y*y)/2])}));
 else if(d.kind==='radial')for(let i=0;i<d.count;i++){
  const [cx,cy]=d.center,a=i/d.count*Math.PI*2,b=(i+1)/d.count*Math.PI*2,mid=(a+b)/2;
  d.regions.push({i,x:cx+Math.cos(mid)*.75,y:cy+Math.sin(mid)*.75,axis:mid,cuts:[[Math.sin(a),-Math.cos(a),Math.sin(a)*cx-Math.cos(a)*cy],[-Math.sin(b),Math.cos(b),-Math.sin(b)*cx+Math.cos(b)*cy]]});
 }else{
  const n=d.kind==='vertical'?[1,0]:d.kind==='horizontal'?[0,1]:[.76,.65];
  const projections=d.flat.map(p=>p.x*n[0]+p.y*n[1]),lo=Math.min(...projections)-.0001,hi=Math.max(...projections)+.0001;
  for(let i=0;i<d.count;i++){const a=lo+(hi-lo)*i/d.count,b=lo+(hi-lo)*(i+1)/d.count,mid=(a+b)/2;d.regions.push({i,x:n[0]*mid,y:n[1]*mid,axis:Math.atan2(-n[0],n[1]),cuts:[[n[0],n[1],b],[-n[0],-n[1],-a]]});}
 }
 for(const r of d.regions)r.depth=d.depth(r.x,r.y,r.i);
 cache.set(index,d);return d;
}

export function surface(d,site,p,back=false){
 const a=site.axis??(site.i*.7),c=Math.cos(a),s=Math.sin(a),dx=p.x-site.x,dy=p.y-site.y,u=c*dx+s*dy,v=-s*dx+c*dy,A=d.bulge;
 let t,du,dv;const e=Math.exp(-(dx*dx+dy*dy)/.22);
 if(d.profile==='dome'||d.profile==='pebble'){
  const amp=back&&d.profile==='pebble'?-A*.7:A;
  t=site.depth-amp*e+(back?d.thickness:0);return {t,dx:2*amp/.22*dx*e,dy:2*amp/.22*dy*e};
 }
 if(d.profile==='twist'){t=site.depth+A*Math.sin(2*u)*v;du=2*A*Math.cos(2*u)*v;dv=A*Math.sin(2*u);}
 else if(d.profile==='fold'){const r=Math.sqrt(u*u+.05*.05);t=site.depth+A*r*2;du=2*A*u/r;dv=0;}
 else if(d.profile==='reed'){t=site.depth-A*Math.cos(u*2.2);du=2.2*A*Math.sin(u*2.2);dv=0;}
 else {const g=Math.exp(-v*v/.65);t=site.depth-A*Math.cos(u*1.7)*g;du=1.7*A*Math.sin(u*1.7)*g;dv=2*A/.65*v*Math.cos(u*1.7)*g;}
 return {t:t+(back?d.thickness:0),dx:du*c-dv*s,dy:du*s+dv*c};
}
