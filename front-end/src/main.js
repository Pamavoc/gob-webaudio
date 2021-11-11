import config from './config.js'
import { Sse } from './Sse'
import { AudioExperiments } from './AudioExperiments'


const sse = new Sse()
const baseUrl = 'http://localhost:4000'



const ae = new AudioExperiments()

const canvas = document.createElement('canvas')
canvas.width = "1676";
canvas.height = "814";
canvas.style.height = "814px"
canvas.style.width = "1676px"
const ctx = canvas.getContext('2d')


let patternPlayer;
let patternEL;
let patternER;

var img = new Image();
img.src = './assets/map2.jpg';
img.onload = function() {
  var pattern = ctx.createPattern(img, 'no-repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, 1676, 814);
};



let boi = './assets/detective-man.png'
let girl = './assets/detective-woman.png'

let playerImg = new Image();



let earL = new Image();
earL.src = './assets/earL.png';
earL.onload = function() {
  patternEL = ctx.createPattern(earL, 'no-repeat');
  ctx.fillStyle = patternEL;
};

let earR = new Image();
earR.src = './assets/earR.png';
earR.onload = function() {
  patternER = ctx.createPattern(earR, 'no-repeat');
  ctx.fillStyle = patternER;
};

const createPlayer = (src) => {
  playerImg.src = src;
  playerImg.onload = function() {
    patternPlayer = ctx.createPattern(playerImg, 'no-repeat');
    ctx.fillStyle = patternPlayer;
  };
}


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
  torch.arc(Math.round(posR.x), Math.round(posR.y), 100, 0,  2 * Math.PI);
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


  const earLeft = new Path2D();


  const earRight = new Path2D();



  //on check en permanence si la zone qui est hover contient un élement sonore jouable
  mouse_hovered = ae.isHover(Math.round(posR.x) - canvas.offsetLeft, Math.round(posR.y) - canvas.offsetTop)
    if (mouse_hovered) {
      
  
      ctx.drawImage(earR, Math.round(posR.x + 0), Math.round(posR.y - 10),  earR.width*0.3, earR.height*0.3);
      ctx.drawImage(earL, Math.round(posR.x - 50), Math.round(posR.y - 10),  earL.width*0.3, earL.height*0.3);

      soundPlayed = ae.returnSoundPlayed()

      if(rbPressed === true && soundPlayed === false) {
        soundPlayed = ae.changeSoundPlayed(true)
        drum.generate_sound(mouse_hovered);
        
      } 
    } else {
     
      ctx.drawImage(earR, Math.round(posR.x + 8), Math.round(posR.y + 5), earR.width*0.15, earR.height*0.15);
      ctx.drawImage(earL, Math.round(posR.x - 32), Math.round(posR.y + 5), earL.width*0.15, earL.height*0.15);
  }
  

  
  ctx.fill(earRight)
  ctx.fill(earLeft)
  const player = new Path2D();
  
  ctx.drawImage(playerImg, Math.round(posR.x - 25), Math.round(posR.y));
  ctx.fill(player)
 


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
  updateGamepad()

  const app = document.getElementById('app')
  app.append(canvas)
  app.append(btnStart)
  gameLoop()
  updateGamepad()
  createScreenShots()
})

let playerChoosen = false;
document.addEventListener("gamepadButtonDown", (event) => {
  console.log(`Gamepad Button ${event.detail.buttonIndex} pressed`);

  if(event.detail.buttonIndex === 5) {
    rbPressed = true 
  }

  // man
  if(event.detail.buttonIndex === 2 && playerChoosen === false) {
    
    

    document.querySelector('.square').style.transform = "scale(0.8)"
  //woman
  } else if(event.detail.buttonIndex === 1 && playerChoosen === false) {
    document.querySelector('.circle').style.transform = "scale(0.8)"
    
  }
  
});
document.addEventListener("gamepadButtonUp", (event) => {
  console.log(`Gamepad Button ${event.detail.buttonIndex} released`);

  if(event.detail.buttonIndex === 5) {
    rbPressed = false
  }

 // man
 if(event.detail.buttonIndex === 2 && playerChoosen === false) {
  playerChoosen = true

  
  createPlayer(boi)
  document.querySelector('.home').remove()
  createScreenShots()

//woman
} else if(event.detail.buttonIndex === 1 && playerChoosen === false) {
  playerChoosen = true

  createPlayer(girl)
  document.querySelector('.home').remove()
  createScreenShots()

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
  }, 5000);
  

}

