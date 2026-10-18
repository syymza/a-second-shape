const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium,webkit}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
const engines=(process.env.TEST_ENGINES||'chromium').split(','),results=[];
const remote=process.env.TEST_URL;let server;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function state(p){return p.evaluate(()=>window.shadowStudy.state);}
async function settled(p){await p.waitForFunction(()=>window.shadowStudy?.state.ready&&!window.shadowStudy.state.transitioning);await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function run(engine,mobile){
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine!=='webkit'?{...(process.env.CHROME_CHANNEL?{channel:process.env.CHROME_CHANNEL}:{}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
 const id=engine+'-'+(mobile?'mobile':'desktop'),errors=[],badRequests=[];
 try{
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:960},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,acceptDownloads:true,recordVideo:process.env.RECORD?{dir:out,size:mobile?{width:390,height:844}:{width:960,height:640}}:undefined});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)badRequests.push(r.url());});
 await page.goto(remote||'http://127.0.0.1:4176/gallery/');await settled(page);
 const initial=await state(page);assert.equal(initial.currentIndex,0);assert.equal(initial.count,10);assert(initial.connectedComponents===1);assert(!initial.found);assert.equal(await page.locator('header button,header a').count(),0);assert.equal(await page.locator('#dial-help').evaluate(e=>getComputedStyle(e).clipPath),'inset(50%)');assert(!/\p{Extended_Pictographic}/u.test(await page.locator('#studio').innerText()),'no emoji glyphs in visible UI');
 const box=await page.locator('#dial').boundingBox();assert(box.height>=44);assert(box.y+box.height<=(mobile?844:960));
 await page.screenshot({path:path.join(out,id+'-initial.png')});
 const cdp=mobile&&engine==='chromium'?await context.newCDPSession(page):null;
 async function down(x,y){if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});else{await page.mouse.move(x,y);await page.mouse.down();}}
 async function move(x,y){if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]});else await page.mouse.move(x,y);}
 async function up(cancel=false){if(cdp)await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});else{if(cancel)await page.keyboard.press('Escape');await page.mouse.up();}}
 const cx=box.x+box.width/2,cy=box.y+box.height/2;
 await down(cx,cy);await move(cx+43,cy);await move(cx-43,cy);await move(cx,cy);await up();await settled(page);
 assert.equal((await state(page)).currentIndex,0,'rapid reversal preserves all detents');
 await down(cx,cy);await move(cx-44,cy);await up(true);await settled(page);assert.equal((await state(page)).currentIndex,9,'previous wraps from first');assert(!(await state(page)).dialDragging);
 await page.locator('#dial').focus();await page.keyboard.press('ArrowRight');await settled(page);assert.equal((await state(page)).currentIndex,0);
 // Multiple input events during a fade must accumulate, including complete wraps.
 await page.locator('#dial').focus();for(let n=0;n<23;n++)await page.keyboard.press('ArrowRight');for(let n=0;n<3;n++)await page.keyboard.press('ArrowLeft');await settled(page);assert.equal((await state(page)).currentIndex,0);
 let baseline;
 for(let cycle=0;cycle<3;cycle++){
  for(let n=0;n<10;n++){
   const s=await state(page);assert.equal(s.currentIndex,n);assert.equal(s.connectedComponents,1);assert(Number.isFinite(s.angle));
   if(cycle===0){await page.locator('#art').focus();await page.keyboard.press('Home');for(let k=0;k<16;k++)await page.keyboard.press('ArrowLeft');await page.waitForTimeout(100);assert((await state(page)).found);}
   if(cycle===0)await page.screenshot({path:path.join(out,id+'-'+n+'-aligned.png')});
   await page.locator('#dial').focus();await page.keyboard.press('ArrowRight');await settled(page);
  }
  const s=await state(page);if(!baseline)baseline=s.memory;else assert.deepEqual(s.memory,baseline,'resources stable after repeated wraps');
 }
 const artPoint={x:mobile?180:700,y:mobile?420:470};await page.locator('#art').focus();await page.keyboard.press('Home');await down(artPoint.x,artPoint.y);await move(artPoint.x+1,artPoint.y);assert(Math.abs((await state(page)).angle-48)<1,'preserve grab offset');await up(true);assert(!(await state(page)).dragging);
 await down(artPoint.x,artPoint.y);await move(artPoint.x-80,artPoint.y);await page.evaluate(()=>document.querySelector('#next').click());await up();await settled(page);assert(!(await state(page)).dragging,'switch during rotation clears capture');
 await page.locator('#dial').focus();await page.keyboard.press('ArrowLeft');await settled(page);assert.equal((await state(page)).currentIndex,0);
 await page.locator('#art').focus();await page.keyboard.press('Home');for(let k=0;k<16;k++)await page.keyboard.press('ArrowLeft');await page.waitForTimeout(200);
 await page.screenshot({path:path.join(out,id+'-aligned.png')});
 const png=await page.evaluate(async()=>{const {draw,renderer}=(await import('./app.js')).inspection;draw();const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png'));return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);});});const file=path.join(out,id+'-export.png'),bytes=Buffer.from(png,'base64');fs.writeFileSync(file,bytes);assert.equal(bytes.readUInt32BE(0),0x89504e47);assert(bytes.length>15000);
 const exportImage=await page.evaluate(async()=>{const {renderer,draw}= (await import('./app.js')).inspection;draw();const bitmap=await createImageBitmap(renderer.domElement);const c=document.createElement('canvas');c.width=80;c.height=80;const x=c.getContext('2d');x.drawImage(bitmap,0,0,80,80);return new Set([...x.getImageData(0,0,80,80).data].filter((_,i)=>i%4!==3)).size;});assert(exportImage>40,'capture is nonblank');
 // Repeated, within-screen swipes must continue through many revolutions.
 await page.locator('#art').focus();await page.keyboard.press('Home');
 let largest=0,smallest=0;
 const sx=mobile?110:650,sy=mobile?410:460;
 async function turnSwipe(delta){
  await down(sx,sy);const grabbed=(await state(page)).angle;
  await move(sx+Math.sign(delta),sy);assert(Math.abs((await state(page)).angle-grabbed)<.6,'regrab has no angular jump');
  await move(sx+delta,sy);const active=await state(page);
  assert(Math.abs(active.angle-grabbed-delta*.008*180/Math.PI)<.05,'active drag never clamps or snaps');assert.equal(active.angle,active.target);
  largest=Math.max(largest,active.angle);smallest=Math.min(smallest,active.angle);await up();
 }
 async function equivalentRelease(){
  await page.locator('#art').focus();const before=await state(page),equivalent=Math.round(before.angle/360)*360;
  const steps=Math.round((equivalent+30-before.angle)/3);
  for(let n=0;n<Math.abs(steps);n++)await page.keyboard.press(steps>0?'ArrowRight':'ArrowLeft');
  await down(sx,sy);const start=(await state(page)).angle;
  await move(sx+(equivalent+3-start)/(.008*180/Math.PI),sy);
  const active=await state(page);assert(Math.abs(active.angle-equivalent-3)<.5,'free while dragging near full-turn reveal: '+JSON.stringify({id,start,equivalent,actual:active.angle}));
  await up();await page.waitForFunction(value=>Math.abs(window.shadowStudy.state.angle-value)<.05,equivalent);
  assert(Math.abs((await state(page)).angle-equivalent)<.05,'settle keeps equivalent revolution instead of jumping to zero');
 }
 for(let n=0;n<20;n++)await turnSwipe(160);assert(largest>1080,'many clockwise turns');await equivalentRelease();
 await down(sx,sy);await move(sx+5,sy);const cancelled=(await state(page)).angle;await up(true);await page.waitForTimeout(100);assert(Math.abs((await state(page)).angle-cancelled)<.05,'cancel near reveal releases capture without settling');
 for(let n=0;n<42;n++)await turnSwipe(-160);assert(smallest< -1080,'many counterclockwise turns');await equivalentRelease();
 if(!mobile){
  await page.keyboard.press('Home');for(let n=0;n<104;n++)await page.keyboard.press('ArrowRight');assert(Math.abs((await state(page)).angle-360)<.05);assert((await state(page)).found,'keyboard reveals at +360');
  for(let n=0;n<40;n++)await page.keyboard.press('ArrowRight');assert(Math.abs((await state(page)).angle-480)<.05);
  await page.keyboard.press('Home');for(let n=0;n<136;n++)await page.keyboard.press('ArrowLeft');assert(Math.abs((await state(page)).angle+360)<.05);assert((await state(page)).found,'keyboard reveals at -360');
 }
 assert(!(await state(page)).dragging);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#dial').focus();await page.keyboard.press('ArrowLeft');await settled(page);assert.equal((await state(page)).currentIndex,9);assert.equal(await page.locator('#art').evaluate(e=>getComputedStyle(e).opacity),'1');
 const before=(await state(page)).frames;await page.waitForTimeout(250);assert.equal((await state(page)).frames,before,'no idle render loop');
 const dprProof=[];
 if(mobile){
  for(const dpr of [1,2,3]){
   const extra=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:dpr,isMobile:true,hasTouch:true}),probe=await extra.newPage();
   await probe.goto(remote||'http://127.0.0.1:4176/gallery/');await settled(probe);
   const layout=await probe.evaluate(async()=>{const {camera,lampScreenBounds}=(await import('./app.js')).inspection;return {camera:camera.matrixWorld.elements,projection:camera.projectionMatrix.elements,lamp:lampScreenBounds(),pixelRatio:window.shadowStudy.state.pixelRatio};});
   assert.equal(layout.pixelRatio,Math.min(dpr,1.65));
   if(dprProof.length){assert.deepEqual(layout.camera,dprProof[0].camera,'pixel ratio does not move camera');assert.deepEqual(layout.projection,dprProof[0].projection,'pixel ratio does not crop composition');assert.deepEqual(layout.lamp,dprProof[0].lamp);}
   dprProof.push({dpr,...layout});await extra.close();
  }
 }
 for(const size of [{width:320,height:568},{width:360,height:640},{width:393,height:684},{width:430,height:932},{width:844,height:390},{width:390,height:844}]){await page.setViewportSize(size);await settled(page);const b=await page.locator('#dial').boundingBox();assert(b.x>=0&&b.y>=0&&b.x+b.width<=size.width&&b.y+b.height<=size.height,'dial reachable after orientation');assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),size.width);const lamp=await page.evaluate(async()=> (await import('./app.js')).inspection.lampScreenBounds());assert(lamp.left>=17.9&&lamp.right<size.width&&lamp.top>=0&&lamp.bottom<size.height,'whole lamp and base stay in frame');await page.screenshot({path:path.join(out,id+'-'+size.width+'.png')});}
 const end=await state(page);assert(errors.length===0,errors.join('\n'));assert.deepEqual(badRequests,[]);
 results.push({id,version:browser.version(),touch:!!cdp,currentIndex:end.currentIndex,loads:end.loads,memory:end.memory,frames:end.frames,consoleErrors:errors,failedRequests:badRequests,canvasPngBytes:bytes.length,canvasPngColors:exportImage,continuousTurns:{largest,smallest},dprProof});
 console.log(id+' passed');await context.close();
 // Initialization failure gets a useful recovery path.
 if(!remote){const p=await browser.newPage();await p.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=new Proxy(HTMLCanvasElement.prototype.getContext,{apply(target,self,args){return args[0].startsWith('webgl')?null:Reflect.apply(target,self,args);}})});await p.goto('http://127.0.0.1:4176/gallery/');await p.locator('#fallback').waitFor({state:'visible'});assert(await p.getByRole('button',{name:'Try again'}).isVisible());await p.close();}
 }finally{await browser.close();}
}
(async()=>{try{if(!remote){const {execFileSync}=require('node:child_process');execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});const serve=path.join(out,'serve');fs.mkdirSync(serve,{recursive:true});try{fs.symlinkSync(path.join(root,'dist'),path.join(serve,'gallery'),'dir');}catch(e){if(e.code!=='EEXIST')throw e;}server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,SERVE_DIR:serve,PORT:'4176'},stdio:'inherit'});await sleep(400);}
for(const engine of engines)for(const mobile of (process.env.TEST_VIEW?[process.env.TEST_VIEW==='mobile']:[false,true]))await run(engine,mobile);fs.writeFileSync(path.join(out,remote?'live-results.json':'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}catch(e){console.error(e);process.exitCode=1;}finally{server?.kill();}})();
