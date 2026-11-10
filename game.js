(()=>{
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
const W=960,H=600,T=40,MW=36,MH=30;
const $=s=>document.querySelector(s), rng=(a,b)=>Math.random()*(b-a)+a;
const species=[
 {name:'Spriglet',emoji:'🌱',type:'Moss',color:'#93c86a',hp:30,atk:6,move:'Leaf Flick'},
 {name:'Cinderpup',emoji:'🦊',type:'Ember',color:'#f59c61',hp:27,atk:7,move:'Warm Spark'},
 {name:'Puddlefin',emoji:'🐟',type:'Tide',color:'#70bddd',hp:32,atk:5,move:'Ripple Pop'},
 {name:'Mossling',emoji:'🍄',type:'Moss',color:'#98c77a',hp:22,atk:5,move:'Spore Skip'},
 {name:'Dewdrop',emoji:'💧',type:'Tide',color:'#70bddd',hp:24,atk:5,move:'Bubble Boop'},
 {name:'Emberkit',emoji:'🐾',type:'Ember',color:'#f2a06b',hp:25,atk:6,move:'Cinder Dash'},
 {name:'Cloudbun',emoji:'🐇',type:'Breeze',color:'#e4d7a9',hp:23,atk:6,move:'Puff Hop'}
];
let selected=0,started=false,player={x:16,y:22,dir:'down',moving:0},party=[],lures=3,enemy=null,battle=false,quest=0,encounterCooldown=0,clock=0,toastTimer=0;
const starters=$('#starters');
species.slice(0,3).forEach((s,i)=>{const b=document.createElement('button');b.className='starter'+(i===0?' selected':'');b.innerHTML=`<div class="emoji">${s.emoji}</div><strong>${s.name}</strong><small>${s.type} friend</small>`;b.onclick=()=>{selected=i;document.querySelectorAll('.starter').forEach((x,j)=>x.classList.toggle('selected',j===i))};starters.appendChild(b)});
$('#play').onclick=()=>{started=true;party=[makeCreature(species[selected])];$('#start').classList.add('hidden');renderParty();say('Rowan is waiting at the little camp.');draw()};
function makeCreature(s){return {name:s.name,emoji:s.emoji,type:s.type,color:s.color,max:s.hp,hp:s.hp,atk:s.atk,move:s.move,level:3,exp:0}}
function say(text){const t=$('#toast');t.textContent=text;t.classList.add('show');toastTimer=2.2}
function pathX(y){return 17+Math.round(Math.sin(y*.32)*2)}
function tile(x,y){if(x<0||y<0||x>=MW||y>=MH)return'edge';
 // winding stream and a little stepping-stone crossing
 if(x>=3&&x<=5&&y>=3&&y<=11&&!(y>=8&&y<=9))return'water';
 if(Math.abs(x-pathX(y))<=2|| (y>=17&&y<=23&&x>=11&&x<=22)|| (y>=2&&y<=6&&x>=13&&x<=21))return'path';
 if(((x>=8&&x<=11&&y>=11&&y<=14)||(x>=22&&x<=27&&y>=8&&y<=13)||(x>=7&&x<=10&&y>=22&&y<=26)) && (x+y)%3!==0)return'tall';
 return'grass';
}
const trees=[];
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let q=tile(x,y);if((q==='grass'||q==='edge')&&Math.random()<.14&&!(x<7&&y>7&&y<11))trees.push({x,y,variant:Math.random()});}
const decor=[];for(let i=0;i<170;i++){let x=Math.floor(rng(0,MW)),y=Math.floor(rng(0,MH));if(tile(x,y)==='grass')decor.push({x,y,flower:Math.random()<.24,c:Math.random()<.5?'#f8df86':'#fff0cf'})}
const solid=(x,y)=>tile(x,y)==='water'||tile(x,y)==='edge'||trees.some(t=>t.x===x&&t.y===y);
function draw(){ctx.clearRect(0,0,W,H);const camX=Math.max(0,Math.min(MW*T-W,player.x*T+T/2-W/2)),camY=Math.max(0,Math.min(MH*T-H,player.y*T+T/2-H/2));
 // ground tiles
 for(let y=Math.floor(camY/T);y<=Math.ceil((camY+H)/T);y++)for(let x=Math.floor(camX/T);x<=Math.ceil((camX+W)/T);x++){
  const kind=tile(x,y),sx=x*T-camX,sy=y*T-camY;
  if(kind==='water'){ctx.fillStyle='#78bdc0';ctx.fillRect(sx,sy,T,T);ctx.fillStyle='#a5d9d2';ctx.globalAlpha=.48;ctx.fillRect(sx+5,sy+8+(x%3)*6,18,2);ctx.fillRect(sx+23,sy+27,10,2);ctx.globalAlpha=1;continue}
  ctx.fillStyle=kind==='path'?'#d8c895':kind==='tall'?'#7fae6e':'#87b779';ctx.fillRect(sx,sy,T,T);
  if(kind==='grass'){ctx.fillStyle='#a1c88a';ctx.globalAlpha=.4;ctx.fillRect(sx+((x*13+y*7)%29),sy+((y*9+x)%30),2,3);ctx.globalAlpha=1}
  if(kind==='path'){ctx.fillStyle='#c9b981';if((x*3+y)%4===0)ctx.fillRect(sx+9,sy+12,3,2);if((x+y*5)%5===0)ctx.fillRect(sx+28,sy+29,2,2)}
  if(kind==='tall'){ctx.fillStyle='#5e945b';for(let n=0;n<5;n++){let bx=sx+4+n*8,by=sy+26+(n%2)*5;ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx-3,by-9,bx+2,by-14);ctx.quadraticCurveTo(bx+1,by-6,bx+5,by);ctx.fill()}ctx.fillStyle='#b8d978';ctx.fillRect(sx+12,sy+10,3,3)}
 }
 // stream bank & bridge
 ctx.fillStyle='#ddcb98';for(let y=8;y<=9;y++)for(let x=2;x<=6;x++)if(x===2||x===6)ctx.fillRect(x*T-camX,y*T-camY,T,T);
 for(let x=3;x<=5;x++){ctx.fillStyle='#b98e58';ctx.fillRect(x*T-camX,8*T-camY,T,5);ctx.fillRect(x*T-camX,9*T-camY,T,5);ctx.fillStyle='#dfbd7d';for(let k=0;k<4;k++)ctx.fillRect(x*T+4+k*9-camX,8*T+4-camY,3,37)}
 // decorative flowers
 decor.forEach(d=>{let sx=d.x*T-camX+15+(d.y%4)*4,sy=d.y*T-camY+21;if(sx>-8&&sx<W+8&&sy>-8&&sy<H+8){ctx.fillStyle='#527b50';ctx.fillRect(sx,sy,2,6);ctx.fillStyle=d.c;ctx.fillRect(sx-2,sy-2,5,4)}});
 // trees
 trees.forEach(t=>{let sx=t.x*T-camX,sy=t.y*T-camY;if(sx<-50||sy<-55||sx>W+20||sy>H+20)return;ctx.fillStyle='#456b4e';ctx.beginPath();ctx.ellipse(sx+21,sy+35,17,7,0,0,7);ctx.fill();ctx.fillStyle='#765e48';ctx.fillRect(sx+17,sy+18,9,20);ctx.fillStyle=t.variant>.5?'#477d59':'#53865c';ctx.beginPath();ctx.arc(sx+20,sy+14,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#78a96b';ctx.beginPath();ctx.arc(sx+14,sy+8,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a4c87b';ctx.fillRect(sx+8,sy+6,3,3)});
 // camp & beacon
 const campX=15*T-camX,campY=19*T-camY;drawCamp(campX,campY);
 const shrineX=17*T-camX,shrineY=4*T-camY;drawBeacon(shrineX,shrineY);
 drawRowan(16*T-camX,18*T-camY);
 drawPlayer(player.x*T-camX,player.y*T-camY);
 // location tags
 label('BRAMBLEWICK MEADOW',18,22);if(Math.abs(player.y-4)<8)label('WHISPERING GROVE',W-190,22);
 if(!started){ctx.fillStyle='#102c3288';ctx.fillRect(0,0,W,H);}
}
function label(text,x,y){ctx.font='10px monospace';ctx.fillStyle='#25443d';ctx.globalAlpha=.7;ctx.fillText(text,x,y);ctx.globalAlpha=1}
function drawCamp(x,y){ctx.fillStyle='#0002';ctx.beginPath();ctx.ellipse(x+20,y+34,25,9,0,0,7);ctx.fill();ctx.fillStyle='#c26d52';ctx.beginPath();ctx.moveTo(x+3,y+22);ctx.lineTo(x+20,y+3);ctx.lineTo(x+38,y+22);ctx.fill();ctx.fillStyle='#e99a68';ctx.fillRect(x+7,y+20,26,13);ctx.fillStyle='#714d47';ctx.fillRect(x+17,y+23,8,10);ctx.fillStyle='#f8d879';ctx.beginPath();ctx.arc(x+37,y+29,5,0,7);ctx.fill()}
function drawBeacon(x,y){ctx.fillStyle='#0002';ctx.beginPath();ctx.ellipse(x+20,y+36,23,7,0,0,7);ctx.fill();ctx.fillStyle='#b5c8b3';ctx.fillRect(x+8,y+13,24,22);ctx.fillStyle='#d9e7ce';ctx.fillRect(x+11,y+10,18,23);ctx.fillStyle='#699486';ctx.fillRect(x+16,y+16,8,13);ctx.fillStyle=quest>=2?'#f8d66b':'#9ddac0';ctx.shadowColor=quest>=2?'#ffdd76':'#8de6ca';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(x+20,y+9,6,0,7);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#769585';ctx.fillRect(x+2,y+32,36,5)}
function drawRowan(x,y){ctx.fillStyle='#0002';ctx.beginPath();ctx.ellipse(x+20,y+32,12,5,0,0,7);ctx.fill();ctx.fillStyle='#40585c';ctx.fillRect(x+12,y+18,16,15);ctx.fillStyle='#edbd8a';ctx.beginPath();ctx.arc(x+20,y+13,8,0,7);ctx.fill();ctx.fillStyle='#89765c';ctx.fillRect(x+12,y+6,16,5);ctx.fillRect(x+10,y+10,4,5);ctx.fillStyle='#fff';ctx.fillRect(x+17,y+12,2,2);ctx.fillRect(x+22,y+12,2,2);ctx.fillStyle='#e9cf79';ctx.fillRect(x+12,y+20,16,3)}
function drawPlayer(x,y){ctx.fillStyle='#0002';ctx.beginPath();ctx.ellipse(x+20,y+34,12,5,0,0,7);ctx.fill();let bob=player.moving?Math.sin(Date.now()/80)*2:0;ctx.fillStyle='#eec99a';ctx.beginPath();ctx.arc(x+20,y+14+bob,8,0,7);ctx.fill();ctx.fillStyle='#48585a';ctx.fillRect(x+12,y+7+bob,16,5);ctx.fillRect(x+11,y+11+bob,3,5);ctx.fillStyle='#ed735c';ctx.fillRect(x+11,y+21+bob,18,12);ctx.fillStyle='#f4dd97';ctx.fillRect(x+13,y+20+bob,14,4);ctx.fillStyle='#3c4a4b';ctx.fillRect(x+12,y+31+bob,6,5);ctx.fillRect(x+22,y+31+bob,6,5);ctx.fillStyle='#fff';ctx.fillRect(x+18,y+13+bob,2,2);ctx.fillRect(x+23,y+13+bob,2,2)}
function renderParty(){const list=$('#party-list');list.innerHTML='';party.forEach(c=>{const el=document.createElement('div');el.className='creature-row';el.innerHTML=`<div class="creature-icon" style="background:${c.color}25">${c.emoji}</div><div><div class="creature-name">${c.name}</div><div class="creature-sub">${c.type} · Lv. ${c.level}</div></div><div><div class="tiny-hp">${c.hp}/${c.max} HP</div><div class="hp-track"><i style="width:${100*c.hp/c.max}%;background:${c.hp/c.max<.3?'#ed8873':'#7bc98b'}"></i></div></div>`;list.appendChild(el)});$('#party-count').textContent=String(party.length).padStart(2,'0')+' / 04'}
function updateQuest(){const title=$('#quest-title'),copy=$('#quest-copy'),step=$('#quest-step'),pct=$('#quest-percent'),fill=$('#progress-fill');if(quest===0){title.textContent='Wake the old beacon';copy.textContent='Ask Rowan at camp about the quiet glow in the grove.';step.textContent='01 / 03 · FIND ROWAN';pct.textContent='0%';fill.style.width='8%'}else if(quest===1){title.textContent='Follow the quiet glow';copy.textContent='Walk north through the meadow to the Whispering Grove beacon.';step.textContent='02 / 03 · FIND THE BEACON';pct.textContent='42%';fill.style.width='45%'}else if(quest===2){title.textContent='Carry the light home';copy.textContent='The beacon is awake! Return to Rowan and share the good news.';step.textContent='03 / 03 · RETURN TO ROWAN';pct.textContent='78%';fill.style.width='78%'}else{title.textContent='A brighter Bramblewick';copy.textContent='You did it. Explore, meet new friends, and make the meadow yours.';step.textContent='COMPLETE · KEEP WANDERING';pct.textContent='100%';fill.style.width='100%';$('#trail-note').innerHTML='The beacon shines over the whole meadow. <b>There are still friends to meet.</b>'}}
function nearby(x,y,tx,ty,d=2){return Math.abs(x-tx)+Math.abs(y-ty)<=d}
function interact(){if(!started||battle)return;
 if(nearby(player.x,player.y,16,18,2)){if(quest===0){quest=1;updateQuest();say('Rowan: The beacon! Follow the old path north.');$('#trail-note').innerHTML='Rowan says the beacon has been quiet for years. <b>Follow the path north.</b>'}else if(quest===2){quest=3;updateQuest();lures+=2;updateItems();say('Rowan: You brought the meadow back to life! +2 Glow Lures');}else if(quest===3){say('Rowan: The whole grove is glowing again. Lovely work!')}else{say('Rowan: Follow the path north to Whispering Grove.');}return}
 if(nearby(player.x,player.y,17,4,2)){if(quest===1){quest=2;updateQuest();say('The beacon hums awake! Head back to Rowan.');$('#trail-note').innerHTML='The beacon is humming again. <b>Take the good news back to camp.</b>'}else if(quest>=2){say('The old beacon glows warmly in the grove.')}else say('A silent old beacon, waiting for a little wonder.');return}
 if(nearby(player.x,player.y,15,19,2)){party.forEach(c=>c.hp=c.max);renderParty();say('A quiet rest. Your companions feel refreshed.');return}
 say('The meadow answers with a soft rustle.');}
function updateItems(){$('#lure-total').textContent='× '+lures;$('#lure-count').textContent=lures+' in bag'}
function move(dir){if(!started||battle)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!d)return;player.dir=dir;const nx=player.x+d[0],ny=player.y+d[1];if(solid(nx,ny))return;player.x=nx;player.y=ny;player.moving=1;setTimeout(()=>player.moving=0,120);if(encounterCooldown>0)encounterCooldown-=1;if(tile(nx,ny)==='tall'&&encounterCooldown<=0&&Math.random()<.22){encounterCooldown=4;startBattle()}draw()}
function startBattle(){const options=species.slice(3);const s=options[Math.floor(Math.random()*options.length)];enemy={...makeCreature(s),max:Math.round(s.hp+rng(0,5)),hp:Math.round(s.hp+rng(0,5)),level:Math.floor(rng(2,5))};enemy.atk=Math.max(3,enemy.atk+Math.floor(enemy.level/2)-1);battle=true;$('#battle').classList.remove('hidden');$('#wild-title').textContent=enemy.name+' · Lv. '+enemy.level;$('#battle-msg').textContent=`A wild ${enemy.name} popped out of the grass!`;updateBattle();say('A wild friend wants to play!')}
function updateBattle(){if(!enemy)return;$('#wild-hp-text').textContent=enemy.hp+' / '+enemy.max;$('#wild-hp-bar').style.width=Math.max(0,100*enemy.hp/enemy.max)+'%';$('#wild-hp-bar').style.background=enemy.hp/enemy.max<.3?'#ed8873':'#73c78b';$('#lure-count').textContent=lures+' in bag';document.querySelector('[data-action="catch"]').disabled=lures<=0||party.length>=4;document.querySelector('[data-action="special"] small').textContent=party[0]?.move||'Bright move'}
function battleEnd(message){$('#battle-msg').textContent=message;setTimeout(()=>{battle=false;enemy=null;$('#battle').classList.add('hidden');renderParty()},850)}
function finishEnemy(){const c=party[0];c.exp+=12+enemy.level*2;let note=`${enemy.name} scampered off. ${c.name} gained a little experience!`;if(c.exp>=20){c.exp-=20;c.level++;c.max+=4;c.atk++;c.hp=Math.min(c.max,c.hp+8);note=`${c.name} grew to level ${c.level}!`;}if(Math.random()<.18){lures++;updateItems();note+=' Found a Glow Lure!'}renderParty();battleEnd(note)}
function enemyTurn(){if(!battle)return;let c=party[0];let dmg=Math.max(2,enemy.atk+Math.floor(rng(-1,2)));c.hp=Math.max(0,c.hp-dmg);renderParty();if(c.hp<=0){c.hp=1;renderParty();battleEnd(`${c.name} is tuckered out. A gentle breeze carries you back to camp.`);player.x=16;player.y=21;return}$('#battle-msg').textContent=`${enemy.name} gave ${c.name} a playful bump (${dmg} damage).`;updateBattle()}
function action(type){if(!battle||!enemy)return;const c=party[0];if(type==='run'){if(Math.random()<.86){battleEnd('You both wave goodbye and head back to the trail.');return}else{$('#battle-msg').textContent='The wild friend is curious and stays close.';enemyTurn();return}}
 if(type==='catch'){if(lures<=0||party.length>=4)return;lures--;updateItems();let chance=.28+.58*(1-enemy.hp/enemy.max);if(Math.random()<chance){party.push(makeCreature(species.find(s=>s.name===enemy.name)));renderParty();battleEnd(`${enemy.name} joined your trail team!`);return}else{$('#battle-msg').textContent=`The lure shimmered, but ${enemy.name} bounced free!`;enemyTurn();return}}
 let special=type==='special';let dmg=Math.max(2,c.atk+Math.floor(rng(0,3))+(special?5:0));enemy.hp=Math.max(0,enemy.hp-dmg);$('#battle-msg').textContent=`${c.name} used ${special?c.move:'a friendly nudge'}! ${dmg} sparkle damage.`;updateBattle();if(enemy.hp<=0){finishEnemy();return}setTimeout(enemyTurn,440)}
document.querySelectorAll('.action').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));
function keyDir(k){return({ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'})[k]}
let keys=new Set(),lastStep=0;window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key===' '||e.key==='Enter'||e.key==='e'||e.key==='E'){if(!e.repeat)interact();return}if(keyDir(e.key))keys.add(e.key)});window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());
function touchDirection(button){const dir=button.dataset.dir;move(dir);const id=setInterval(()=>move(dir),190);const stop=()=>{clearInterval(id);button.removeEventListener('pointerup',stop);button.removeEventListener('pointerleave',stop);button.removeEventListener('pointercancel',stop)};button.addEventListener('pointerup',stop);button.addEventListener('pointerleave',stop);button.addEventListener('pointercancel',stop)}
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();touchDirection(b)}));$('#interact').addEventListener('click',interact);
function loop(now){if(started&&!battle&&keys.size&&now-lastStep>145){let arr=[...keys],dir=keyDir(arr[arr.length-1]);if(dir){move(dir);lastStep=now}}if(toastTimer>0){toastTimer-=1/60;if(toastTimer<=0)$('#toast').classList.remove('show')}clock+=1/60;if(clock>15){clock=0;const m=40+Math.floor((Date.now()/1000)%20);$('#clock').textContent='DAY 01 · 08:'+String(m).padStart(2,'0')}draw();requestAnimationFrame(loop)}
updateQuest();updateItems();draw();requestAnimationFrame(loop);
})();
