// Run: node headline-glass.check.mjs — native browser paint is checked separately.
import assert from 'node:assert/strict';
import {lensMap, lensPoint, initHeadlineGlass} from './headline-glass.mjs';

for (const [width, height, diameter] of [[500,230,192],[280,140,118],[200,100,80]]) {
  const map = lensMap(width, height, diameter);
  for (const [x,y] of [[0,0],[map.width-1,0],[0,map.height-1],[map.width-1,map.height-1]]) {
    assert.deepEqual(Array.from(map.pixels.slice((y*map.width+x)*4,(y*map.width+x)*4+4)),[128,128,128,255], 'Outside lens remains exactly neutral and opaque');
  }
  const center = Math.floor(map.height/2)*map.width+Math.floor(map.width/2);
  assert.ok(map.pixels.some((value,index)=>index%4<2 && Math.abs(value-128)>5), 'Map contains real optical displacement');
  assert.ok(Math.abs(map.pixels[center*4]-128)<=2);
  for (const [x,y] of [[-100,-100],[1e4,1e4],[width/2,height/2]]) {
    const point=lensPoint(x,y,width,height,diameter), edge=diameter/2+2;
    assert.ok(point.x>=edge && point.x<=width-edge && point.y>=edge && point.y<=height-edge, 'Lens stays inside headline bounds');
  }
}

class Target {
  events=new Map();style={removeProperty(name){delete this[name];}};attributes={};dataset={};hidden=false;
  classList={add(){}};
  addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
  removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
  emit(name,event={}){for(const fn of this.events.get(name)||[])fn(event);}
  setAttribute(name,value){this.attributes[name]=value;}
  remove(){this.removed=true;}
}
class Observer {
  static all=[];
  constructor(callback){this.callback=callback;Observer.all.push(this);}
  observe(){}
  disconnect(){this.disconnected=true;}
}
let now=0,next=0,draws=0,selection=false,contextAvailable=true;
const queue=new Map(), queries=[];
const heading=new Target();heading.textContent='Hello, possibility.';
heading.getBoundingClientRect=()=>({left:0,top:0,width:500,height:230});
const stage=new Target();stage.querySelector=()=>heading;stage.append=(...nodes)=>{stage.children=nodes;};
const documentTarget=new Target();documentTarget.hidden=false;documentTarget.getSelection=()=>({isCollapsed:!selection,containsNode:()=>selection});
documentTarget.querySelectorAll=()=>[];
documentTarget.createElementNS=()=>{const node=new Target();node.image=new Target();node.displacement=new Target();node.querySelector=tag=>tag==='feImage'?node.image:node.displacement;return node;};
documentTarget.createElement=tag=>tag==='canvas'?{getContext:()=>contextAvailable?{createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}}:null,toDataURL:()=> 'data:image/png;base64,proof'}:new Target();
const windowTarget=new Target();
Object.assign(globalThis,{
  document:documentTarget,window:windowTarget,ResizeObserver:Observer,IntersectionObserver:Observer,
  getComputedStyle:()=>({fontSize:'120px'}),performance:{now:()=>now},
  Image:class {set src(value){this.onload();}},
  matchMedia:query=>{const target=new Target();target.matches=query.includes('pointer:fine');queries.push(target);return target;},
  requestAnimationFrame:fn=>{const id=next++;queue.set(id,fn);return id;},cancelAnimationFrame:id=>queue.delete(id)
});
function tick(time){now=time;const pending=[...queue.values()];queue.clear();for(const callback of pending){draws++;callback(time);}}
const dispose=initHeadlineGlass(stage);
assert.equal(initHeadlineGlass(stage),dispose,'Initialization has one owner');
Observer.all.at(-1).callback([{isIntersecting:true}]);
assert.equal(queue.size,1,'Only one render can be pending');
tick(16);
assert.equal(heading.style.filter,'url(#headline-refraction)');
assert.equal(queue.size,0,'Stationary effect does not animate');
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});
stage.emit('pointermove',{pointerType:'mouse',clientX:390,clientY:110});
assert.equal(queue.size,1,'Pointer events coalesce');
for(let t=32;t<=1600;t+=16)tick(t);
assert.equal(queue.size,0,'Rendering stops within the settling deadline');
const settled=draws;tick(11600);assert.equal(draws,settled,'Ten idle seconds add zero renders');
selection=true;documentTarget.emit('selectionchange');
assert.equal(heading.style.filter,undefined,'Selection restores native unfiltered text');
selection=false;documentTarget.emit('selectionchange');tick(11616);
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});
Observer.all.at(-1).callback([{isIntersecting:false}]);
assert.equal(queue.size,0,'Offscreen rendering cancels immediately');
Observer.all.at(-1).callback([{isIntersecting:true}]);tick(11632);
queries[1].matches=true;queries[1].emit('change');tick(11648);
assert.equal(stage.dataset.glassState,'static','Reduced motion is stationary');
assert.equal(stage.children[1].style.width,'128px','Static lens keeps the smaller treatment');
stage.emit('pointermove',{pointerType:'mouse',clientX:100,clientY:110});assert.equal(queue.size,0);
stage.emit('pointerleave');assert.equal(queue.size,0,'Static treatment does not redraw on pointer exit');
queries[0].matches=false;queries[0].emit('change');tick(11656);
assert.equal(stage.dataset.glassState,'static','Coarse pointers retain a still treatment');
for (let index=2;index<5;index++) {
  queries[index].matches=true;queries[index].emit('change');
  assert.equal(heading.style.filter,undefined,'Contrast/transparency preferences keep plain native text');
  queries[index].matches=false;queries[index].emit('change');tick(11660+index);
}
documentTarget.hidden=true;documentTarget.emit('visibilitychange');assert.equal(queue.size,0);
documentTarget.hidden=false;documentTarget.emit('visibilitychange');tick(11664);
windowTarget.emit('beforeprint');assert.equal(heading.style.filter,undefined);
windowTarget.emit('afterprint');tick(11680);
windowTarget.emit('pagehide',{persisted:true});assert.equal(queue.size,0);
windowTarget.emit('pageshow');tick(11696);
dispose();dispose();
assert.equal(queue.size,0);
assert.equal(heading.textContent,'Hello, possibility.');
assert.ok(Observer.all.every(observer=>observer.disconnected));
assert.ok([stage,documentTarget,windowTarget,...queries].every(target=>[...target.events.values()].every(set=>!set.size)),'Every owned listener is removed');
assert.ok(stage.children.every(node=>node.removed));
contextAvailable=false;
const disposeFallback=initHeadlineGlass(stage);
Observer.all.at(-1).callback([{isIntersecting:true}]);
assert.equal(stage.dataset.glassState,'fallback');
assert.equal(heading.style.filter,undefined,'Failed initialization retains readable HTML');
disposeFallback();
console.log('PASS: neutral/real displacement, bounded placement, single ownership, finite frames, idle/offscreen/selection/reduced-motion/print/bfcache modes, failure and cleanup');
