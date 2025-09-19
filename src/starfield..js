// This script generates moving stars in the background
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const numStars = 200;

for(let i=0; i<numStars; i++){
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
    size: Math.random() * 1.5
  });
}

function draw(){
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  for(let i=0;i<stars.length;i++){
    let s = stars[i];
    s.z -= 2;
    if(s.z <=0) s.z = canvas.width;

    const k = 128.0 / s.z;
    const px = s.x * k + canvas.width/2;
    const py = s.y * k + canvas.height/2;

    if(px >= 0 && px <= canvas.width && py >=0 && py <= canvas.height){
      const size = s.size * k;
      ctx.fillStyle = "#00eaff";
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI*2);
      ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}
draw();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
