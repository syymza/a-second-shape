const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {cancelTouch}=require('./touch-cancel.cjs');
// Hold DOM delivery after acknowledgement to exercise the permitted non-blocking ordering.
function deferredCancel(cdp){
 let reached;
 const requested=new Promise(resolve=>{reached=resolve;});
 return {requested,driver:{async send(method,event){assert.equal(method,'Input.dispatchTouchEvent');assert.equal(event.type,'touchCancel');reached();}},deliver:()=>cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]})};
}
async function verifyCancellationHarness(browser,url,out){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();await page.goto(url);await page.waitForFunction(()=>window.shadowStudy?.state.ready);
  const cdp=await context.newCDPSession(page);
  async function grab(p=page,driver=cdp){await driver.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:420,id:1}]});await driver.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:181,y:420,id:1}]});assert(await p.evaluate(()=>window.shadowStudy.state.dragging));}
  const results=[];
  for(let n=0;n<10;n++){
   await grab();const old=deferredCancel(cdp);await old.driver.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
   const premature=await page.evaluate(()=>window.shadowStudy.state.dragging);
   assert.throws(()=>assert(!premature),assert.AssertionError,'old immediate assertion fails before delivery');
   await old.deliver();await page.waitForFunction(()=>!window.shadowStudy.state.dragging);
   await grab();const held=deferredCancel(cdp);let completed=false;
   const completion=cancelTouch(page,held.driver).then(()=>{completed=true;});await held.requested;
   assert(await page.evaluate(()=>window.shadowStudy.state.dragging));assert.equal(completed,false,'receipt must not complete at protocol acknowledgement');
   await held.deliver();await completion;assert(!(await page.evaluate(()=>window.shadowStudy.state.dragging)));
   results.push({iteration:n,oldAssertionFailedBeforeDelivery:true,fixedAssertionPassedAfterDelivery:true});
  }
  // A delivery receipt must not make missing application cleanup pass.
  const broken=await context.newPage();await broken.addInitScript(()=>{const add=HTMLCanvasElement.prototype.addEventListener;HTMLCanvasElement.prototype.addEventListener=function(type,...args){if(this.id==='art'&&['pointercancel','lostpointercapture'].includes(type))return;return add.call(this,type,...args);};});
  await broken.goto(url);await broken.waitForFunction(()=>window.shadowStudy?.state.ready);const badDriver=await context.newCDPSession(broken);await grab(broken,badDriver);await cancelTouch(broken,badDriver);
  const stuck=await broken.evaluate(()=>window.shadowStudy.state.dragging);assert.throws(()=>assert(!stuck),assert.AssertionError,'delivered cancellation must still fail when real cleanup handlers are broken');
  fs.writeFileSync(path.join(out,'touch-cancel-contract.json'),JSON.stringify({results,brokenCleanupStillFails:true},null,2));
 }finally{await context.close();}
}
module.exports={verifyCancellationHarness};
