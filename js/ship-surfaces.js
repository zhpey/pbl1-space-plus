// Original physically based texture channels, generated locally and deterministically.
export function createShipSurfaces({canvasTexture,random}){
 const albedo=canvasTexture(1024,1024,(c,w,h)=>{
  c.fillStyle='#a6b0b5';c.fillRect(0,0,w,h);
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
   const x=col*256,y=row*128,shade=Math.round(157+random()*22);c.fillStyle=`rgb(${shade},${shade+9},${shade+14})`;c.fillRect(x+3,y+3,250,122);
   c.strokeStyle='#47555d';c.lineWidth=1.7;c.strokeRect(x+4,y+4,248,120);c.strokeStyle='#c7cfd0';c.lineWidth=.6;c.strokeRect(x+6,y+6,244,116);
   for(let j=0;j<13;j++){const sx=x+8+random()*235,sy=j%2?y+6:y+121;c.fillStyle='#d5d8d0';c.fillRect(sx,sy,2+random()*8,.7);}
   for(const dx of [15,237])for(const dy of [14,111]){c.fillStyle='#53626b';c.fillRect(x+dx,y+dy,2,2);}
   c.fillStyle='#657680';c.fillRect(x+25,y+25,28,1);c.fillRect(x+25,y+29,18,1);
   if((col+row)%4===0){c.fillStyle='#a46c43';c.fillRect(x+191,y+17,20,4);c.fillStyle='#d0c3a3';c.fillRect(x+191,y+23,20,1);}
  }
  for(let i=0;i<12500;i++){c.fillStyle=`rgba(20,33,42,${random()*.035})`;c.fillRect(random()*w,random()*h,random()*4,.5);}
 });
 const roughness=canvasTexture(1024,1024,(c,w,h)=>{c.fillStyle='#a8a8a8';c.fillRect(0,0,w,h);for(let i=0;i<8000;i++){const v=140+Math.floor(random()*65);c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(random()*w,random()*h,4+random()*25,.8);}for(let y=0;y<8;y++)for(let x=0;x<4;x++){c.strokeStyle='#767676';c.lineWidth=3;c.strokeRect(x*256+5,y*128+5,246,118);}});
 const height=canvasTexture(1024,1024,(c,w,h)=>{c.fillStyle='#808080';c.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=0;x<4;x++){c.strokeStyle='#626262';c.lineWidth=2;c.strokeRect(x*256+4,y*128+4,248,120);c.strokeStyle='#9b9b9b';c.lineWidth=.7;c.strokeRect(x*256+7,y*128+7,242,114);}});
 const brushed=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#9a9a9a';c.fillRect(0,0,w,h);for(let i=0;i<1900;i++){const v=124+Math.floor(random()*65);c.strokeStyle=`rgba(${v},${v},${v},.35)`;c.beginPath();const y=random()*h;c.moveTo(0,y);c.lineTo(w,y+.15);c.stroke();}});
 // These channels encode material data, rather than display colours.
 for(const texture of [roughness,height,brushed])texture.colorSpace='';
 return{albedo,roughness,height,brushed};
}
