export class AudioExperiments {
    constructor() {
        const BaseAudioContext = window.AudioContext || window.webkitAudioContext
        this.context = new BaseAudioContext()
        this.oscillator = this.context.createOscillator()
        this.oscillator.connect(this.context.destination)
        this.movements = { leftJoystick: { topBottom: 0, leftRight: 0 }, rightJoystick: { topBottom: 0, leftRight: 0 } }

        //initial positions
        this.posL = { x: 100, y: 100 }
        this.posR = { x: 200, y: 200 }

        // todo audio ambiant flouté

        this.pressedLb = false
        this.pressedRb = false

        this.soundPlaying = false;
        this.deadzone = 0.2;


         this.url = window.location.href + 'assets/'; // all our medias are stored on dropbox
         console.log(this.url)

         this.drum = {
            a_ctx: new AudioContext(),
            generate_sound: (part) => {
              
            
              // called each time we need to play a source
              const source = this.drum.a_ctx.createBufferSource();
              source.buffer = part.buf;
              source.connect(this.drum.gain);

              // to keep only one playing at a time
              // simply store this sourceNode, and stop the previous one
              this.drum.parts.forEach(p => (p.source && p.source.stop(0)));
              // store the source
              

    
              part.source = source;
              source.start(0);
              

              source.onended = () => {
                source.stop(0);
                this.soundPlaying = false
              }
            },
            parts: [{
                name: 'jazzman',
                x: 90,
                y: 116,
                w: 160,
                h: 70,
                audio_src: 'bip.mp3'
              },
              
            ]
          };

          this.initAudios()
          this.drum.gain = this.drum.a_ctx.createGain();
          this.drum.gain.gain.value = .5;
          this.drum.gain.connect(this.drum.a_ctx.destination);


    }

    initAudios() {
      const promises = this.drum.parts.map(part => {
        return fetch(this.url + part.audio_src) // fetch the file
              .then(resp => resp.arrayBuffer()) // as an arrayBuffer
              .then(buf => this.drum.a_ctx.decodeAudioData(buf)) // then decode its audio data
              .then(AudioBuf => {
                  part.buf = AudioBuf; // store the audioBuffer (won't change)
                  return Promise.resolve(part); // done
              });
      });
      return Promise.all(promises); // when all are loaded
    }


    startOscillator() {
        this.oscillator.start(this.context.currentTime)
    }

    tweakOscillator(value) {

        this.oscillator.frequency.value = value

    }

    stopOscillator() {

        this.oscillator.stop(this.context.currentTime);
    }


    
    events() {

        document.addEventListener('keydown', (e) => {

            if (e.code === 'KeyD') {

                this.tweakOscillator(100)

            } else if (e.code === 'KeyR') {


                this.tweakOscillator(120)

            } else if (e.code === 'Semicolon') {


                this.tweakOscillator(170)
            }
        });

    }

    setDeadzone(value) {
    
      const DEADZONE = 0.2;
  
  
      if (Math.abs(value) < DEADZONE) {

        return value = 0;

      } else {
   
        value = value - Math.sign(value) * DEADZONE;

        value /= (1.0 - DEADZONE);

        return value;

      }
    }

    gamePad() {

        const gamepad = navigator.getGamepads()[0];
        //console.log(navigator.getGamepads())
        if (!gamepad) return;


        const hue = gamepad.axes[2] / 2;
        const saturation = (gamepad.axes[0] + 1) / 2;
        const lightness = (gamepad.axes[1] + 1) / 2;


        //1 pour aller a droite
        //-1 pour aller à gauche
        //-1 pour aller en haut
        //1 pour aller en bas
    
      
        this.movements.leftJoystick.leftRight = gamepad.axes[0]
        this.movements.leftJoystick.topBottom = gamepad.axes[1]

        this.movements.rightJoystick.leftRight = gamepad.axes[2]
        this.movements.rightJoystick.topBottom = gamepad.axes[3]

        this.posL.x = this.posL.x + this.setDeadzone(this.movements.leftJoystick.leftRight) * 10
        this.posL.y = this.posL.y + this.setDeadzone(this.movements.leftJoystick.topBottom) * 10

        this.posR.x = this.posR.x + this.setDeadzone(this.movements.rightJoystick.leftRight) * 10
        this.posR.y = this.posR.y + this.setDeadzone(this.movements.rightJoystick.topBottom) * 10
       
      
        document.body.style.backgroundColor = `hsl(${hue * 360},${saturation * 100}%,${lightness * 100}%)`;


        if(gamepad.buttons[4].value === 1 && this.pressedLb !== true) {
          this.pressedLb = true
        } else {
          this.pressedLb = false
        }

        if(gamepad.buttons[5].value === 1 && this.pressedRb !== true) {
          this.pressedRb = true
        } else {
          this.pressedRb = false
        }      


    }

    returnPosLeft() {
        return this.posL;
    }


    returnPosRight() {
        return this.posR;
    }


    returnSounds() {
        return this.drum;
    }

    returnPressedTouch() {
        return this.pressedRb
    }

    isHover = (x, y) =>
    (this.drum.parts.filter(p => (p.x < x && p.x + p.w > x && p.y < y && p.y + p.h > y))[0] || false);


    returnSoundPlayed() {
      return this.soundPlaying
    }


    changeSoundPlayed() {
      this.soundPlaying = true
    }
   
}
