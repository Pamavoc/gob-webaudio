import express from 'express';
import cors from "cors";
import path, { resolve } from "path";
import fs from "fs-extra"
import hpp from "hpp";
import helmet from "helmet"
import { v4 as uuidv4 } from 'uuid';
const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();
import { Gif } from 'make-a-gif'
import { SSEClient } from './SSEClient.js';
import captureWebsite from 'capture-website';
import pLimit from 'p-limit';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(hpp()); 
app.use(helmet());


const corsOptions = {
  origin: "https://canvas.pamavoc.com"
};

const dirPath = path.join(__dirname, '/screenshots');
const gifPath = path.join(__dirname, '/gifs');

const arrayOfImages = []
const options = {
	width:1614,
	height: 812,
};

const urlClient = 'https://canvas.pamavoc.com'

//registering cors
app.use(cors(corsOptions));


app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});



// Affiche toute la bdd
app.get('/', (req, res) => {
     res.send('hello');

})


app.use('/gifs', express.static('gifs')); 


let clientUuid;

app.get('/stream/uuid', async (req, res) => {
 
  const client = new SSEClient(res);
 
  clientUuid = uuidv4()
  client.initialize();
  client.send({ id: Date.now(), type: 'uuid', data: clientUuid });

});

function capture(filename) {
  return captureWebsite.file(urlClient, `${dirPath}/${filename}.jpeg`, options);
}

async function createScreen() {

  await Promise.all(arrayOfImages.map(async (filename) => {
    return captureWebsite.file(urlClient, `${dirPath}/${filename.screenshot}.jpeg`, options);
  })).then(() => makeAGif());


}

async function makeAGif() {
  const finalArray = arrayOfImages.map((obj) => {
    return obj.gif;
  });

  const Image = new Gif(1612, 814)
  .setDelay(300)
  .setFrames(finalArray)

  const Render = await Image.render()

  fs.writeFileSync(path.join(gifPath, `${clientUuid}.gif`), Render)

  fs.emptyDirSync(dirPath)
}

function populateArray(id) {
  for(let i = 0; i < 16; i++) {
   
    arrayOfImages.push({screenshot: `${id}-${i}`, gif: `${dirPath}/${id}-${i}.jpeg`})

  }  
}

app.post('/screenshots/:id', (req, res) => {
  new Promise((resolve, reject) => {   
      resolve(populateArray(req.params.id));
  }).then(()=> {
    const limit = pLimit(1);
    
    let promises = arrayOfImages.map(filename => {

      // wrap the function we are calling in the limit function we defined above
      return limit(() => capture(filename.screenshot));
     });

    (async () => {
      // Only three promises are run at once (as defined above)
      const result = await Promise.all(promises).then(() => makeAGif());;
      
    })();
  })

 

}) 


