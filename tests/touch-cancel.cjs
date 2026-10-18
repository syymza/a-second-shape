async function cancelTouch(page,cdp){
 // Chromium's non-blocking touchCancel acknowledgement can precede DOM delivery.
 await page.evaluate(()=>{
  window.__touchCancelDelivered=false;
  document.addEventListener('pointercancel',()=>{
   window.__touchCancelDelivered=true;
  },{once:true});
 });
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await page.waitForFunction(()=>window.__touchCancelDelivered,null,{timeout:5000});
}
module.exports={cancelTouch};
