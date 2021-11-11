import config from './config.js'
import { Sse } from './Sse'
import { AudioExperiments } from './AudioExperiments'


const sse = new Sse()
const baseUrl = 'http://localhost:4000'



const ae = new AudioExperiments();

const title = document.createElement('h1')
title.innerHTML = 'Reveal with the torch and get sound'

const canvas = document.createElement('canvas')
canvas.width = "1676";
canvas.height = "814";
canvas.style.height = "814px"
canvas.style.width = "1676px"
const ctx = canvas.getContext('2d')


let patternEar;

var img = new Image();
img.src = './assets/map.jpg';
img.onload = function() {
  var pattern = ctx.createPattern(img, 'no-repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, 1676, 814);
};

var earImg = new Image();
earImg.src = './assets/boi.png';
earImg.onload = function() {
  patternEar = ctx.createPattern(earImg, 'no-repeat');
  ctx.fillStyle = patternEar;
};


let i = 0;
let mouse_hovered = false;


const drum = ae.returnSounds()
let gamepad = null;
const easeInCubic = n => n * n * n

let rbPressed = false;
let lbPresssed = false;

let soundPlayed = ae.returnSoundPlayed()


const updateGamepad = () => {

  ae.gamePad()
  requestAnimationFrame(updateGamepad);

  let newGamepad = navigator.getGamepads()[0];
  if (!newGamepad) return;

  newGamepad.buttons.forEach((button, index) => {
    const oldButtonPressed = gamepad?.buttons[index].pressed;
    if (button.pressed !== oldButtonPressed) {
      if (button.pressed && !oldButtonPressed) {
        document.dispatchEvent(
          new CustomEvent("gamepadButtonDown", {
            detail: { buttonIndex: index },
          })
        );
      }
      if (!button.pressed && oldButtonPressed) {
        document.dispatchEvent(
          new CustomEvent("gamepadButtonUp", { detail: { buttonIndex: index } })
        );
      }
    }
  });

  gamepad = newGamepad

}

const gameLoop = () => {
 
  ctx.beginPath()
  const background = new Path2D();
  ctx.fillStyle = 'rgba(0, 0, 0, .8)'
  background.rect(0, 0, 1676, 814)
  ctx.fill(background)

  
  ctx.fillStyle = ctx.createPattern(img, "no-repeat");
  

  // const background = new Path2D();
  // const frequencyCanvas = new Path2D();
  // ctx.lineWidth = 10;
  // ctx.strokeStyle = 'white'
  // frequencyCanvas.moveTo(0, mouse.y);
  // frequencyCanvas.lineTo(550, mouse.y);
  // ctx.stroke(frequencyCanvas);
  // ae.tweakOscillator(mouse.y)
  
  
  const posR = ae.returnPosRight()
  const posL = ae.returnPosLeft()

  const torch = new Path2D();
  torch.arc(Math.round(posL.x), Math.round(posL.y), 50, 0,  2 * Math.PI);
  ctx.fill(torch)

  //Bordures du canvas 
  if(Math.round(posL.x) > canvas.width) {
    posL.x = canvas.width
  }

  if(Math.round(posL.y) > canvas.height) {
    posL.y = canvas.height
  }

  if(Math.round(posR.x) > canvas.width) {
    posR.x = canvas.width
  }

  if(Math.round(posR.y) > canvas.height) {
    posR.y = canvas.height
  }

  const ear = new Path2D();
  //on check en permanence si la zone qui est hover contient un élement sonore jouable
  mouse_hovered = ae.isHover(Math.round(posR.x) - canvas.offsetLeft, Math.round(posR.y) - canvas.offsetTop)
    if (mouse_hovered) {
      
      
      ctx.drawImage(earImg, Math.round(posR.x), Math.round(posR.y), earImg.width*2, earImg.height*2);
      soundPlayed = ae.returnSoundPlayed()

      if(rbPressed === true && soundPlayed === false) {
        soundPlayed = ae.changeSoundPlayed(true)
        drum.generate_sound(mouse_hovered);
        
      } 
    } else {
     
      ctx.drawImage(earImg, Math.round(posR.x), Math.round(posR.y));
  }
  

  ctx.fill(ear)


  i++
  window.requestAnimationFrame(gameLoop)

}



const mouse = { x: 0, y: 0}

canvas.addEventListener('mousemove',(e)=> {
  mouse.x = e.offsetX
  mouse.y = e.offsetY
})




const btnStart = document.createElement('button')
btnStart.innerHTML = "Start";
btnStart.addEventListener('click', ()=> {
  ae.startOscillator()
  ae.events()
})

  
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  app.append(title)
  app.append(canvas)
  app.append(btnStart)
  gameLoop()
  updateGamepad()
  createScreenShots()
})


document.addEventListener("gamepadButtonDown", (event) => {
  console.log(`Gamepad Button ${event.detail.buttonIndex} pressed`);

  if(event.detail.buttonIndex === 5) {
    rbPressed = true 
  }
});
document.addEventListener("gamepadButtonUp", (event) => {
  console.log(`Gamepad Button ${event.detail.buttonIndex} released`);

  if(event.detail.buttonIndex === 5) {
    rbPressed = false
  }
});




function createScreenShots() {

  
  setTimeout(() => {
    const uuid = sse.returnUuid();

    new Promise((resolve, reject) => {
      resolve(
        fetch(`${baseUrl}/screenshots/${uuid}`, {
          method: "post",
          headers: {
            'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8',
            'Content-Type': 'text/html; charset=utf-8'
          }
        })
      );
    });
  }, 15000);
  

}

