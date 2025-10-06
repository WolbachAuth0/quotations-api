
const path = require('path');
// import the env variables FIRST - Before you do anything else
require('dotenv').config({ path: path.join(__dirname, './../.env') })

const config = {
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PW,
  db_name: process.env.MONGO_DB_NAME
}

// const authors = require('./../data/authors.json');
const Database = require('./../models/Database.js');
const { AuthorModel } = require('./../models/Author.js')

const authors = [
  {
    "id": "68cafd351aa59a7e50a0e40d",
    "fullName": "Ulysses S. Grant",
    "firstName": "Ulysses",
    "middleName": "Hiram",
    "lastName": "Grant",
    "born": new Date(1822,3,27),
    "died": new Date(1885,6,23),
    "bio": "Ulysses S. Grant was the 18th president of the United States, serving from 1869 to 1877. In 1865, as commanding general, Grant led the Union Army to victory in the American Civil War. \n\nGrant was born in Ohio and graduated from the United States Military Academy (West Point) in 1843. He served with distinction in the Mexican–American War, but resigned from the army in 1854 and returned to civilian life impoverished. In 1861, shortly after the Civil War began, Grant joined the Union Army, and he rose to prominence after securing victories in the western theater in 1862. In 1863, he led the Vicksburg campaign that gave Union forces control of the Mississippi River and dealt a major strategic blow to the Confederacy. President Abraham Lincoln promoted Grant to lieutenant general and command of all Union armies after his victory at Chattanooga. For thirteen months, Grant fought Robert E. Lee during the high-casualty Overland Campaign, which ended when Lee surrendered to Grant at Appomattox. In 1866, President Andrew Johnson promoted Grant to General of the Army. Later, Grant broke with Johnson over Reconstruction policies. A war hero, drawn in by his sense of duty, Grant was unanimously nominated by the Republican Party and then elected president in 1868.",
    "reference": "https://en.wikipedia.org/wiki/Ulysses_S._Grant",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Ulysses_S._Grant_1870-1880.jpg/220px-Ulysses_S._Grant_1870-1880.jpg",
  },
  {
    "id": "68cafd351aa59a7e50a0e40f",
    "fullName": "Sun Tzu",
    "firstName": "Sun",
    "middleName": "",
    "lastName": "Tzu",
    "born": new Date(-543, 0, 1),
    "died": new Date(-495, 0, 1),
    "bio": "Sun Tzu was a Chinese military general, strategist, philosopher, and writer who lived during the Eastern Zhou period (771–256 BC). Sun Tzu is traditionally credited as the author of The Art of War, a Classical Chinese text on military strategy from the Warring States period, though the earliest parts of the work probably date to at least a century after him. \n\nSun Tzu is revered in Chinese and East Asian culture as a legendary historical and military figure; however, his historical existence is uncertain. The Han dynasty historian Sima Qian and other traditional Chinese historians placed him as a minister to King Helü of Wu and dated his lifetime to 544–496 BC. The name Sun Tzu—by which he is more popularly known—is an honorific which means \"Master Sun\". His birth name was said to be Sun Wu and he is posthumously known by his courtesy name Changqing. Traditional accounts state that the general's descendant Sun Bin wrote a treatise on military tactics, also titled The Art of War. Since both Sun Wu and Sun Bin were referred to as \"Sun Tzu\" in classical Chinese texts, some historians thought them identical, prior to the rediscovery of Sun Bin's treatise in 1972.",
    "reference": "https://en.wikipedia.org/wiki/Sun_Tzu",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Enchoen27n3200.jpg/220px-Enchoen27n3200.jpg",
  },
  {
    "id": "68cafd361aa59a7e50a0e411",
    "fullName": "Plutarch",
    "firstName": "Plutarch",
    "middleName": "",
    "lastName": "",
    "born": new Date(40, 0, 1),
    "died": new Date(120, 0, 1),
    "bio": "Plutarch was a Greek Middle Platonist philosopher, historian, biographer, essayist, and priest at the Temple of Apollo in Delphi. He is known primarily for his Parallel Lives, a series of biographies of illustrious Greeks and Romans, and Moralia, a collection of essays and speeches. Upon becoming a Roman citizen, he was possibly named Lucius Mestrius Plutarchus.",
    "reference": "https://en.wikipedia.org/wiki/Plutarch",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Plutarch_of_Chaeronea-03-removebg-preview.png/250px-Plutarch_of_Chaeronea-03-removebg-preview.png",
  },
]

main()

async function main () {
  // connect to database
  const database = new Database(config)
  try {
    console.log('connecting to database ..')
    await database.connect();
    await updateAuthors();

  } catch (error) {
    console.log('An error occurred.');
    console.error(error.message);
    console.log(error)
  } finally {
    console.log(`\nInitiate graceful shutdown ...`);
    await database.disconnect();
    console.log('Shutdown complete.');
  }
}

async function updateAuthors () {
  const results = {
    successes: [],
    failures: []
  }
  for (let data of authors) {
    
    try {
      const author_id = data.id;
      const found = await AuthorModel.findById(author_id);

      if (!found) {
        const message = `Author document with id: ${author_id} not found. (${data.fullName})`;
        results.failures.push(message);
      }

      const body = AuthorModel.parseInput(data);
      
      found.patch(body)
      const updated = await found.save();

      const message = `Updated author document with id: ${author_id}. (${updated.fullName})`;
      results.successes.push(message);

    } catch (error) {
      results.failures.push(error.message);
    }
  }

  console.log('completed load process ...');
  console.log(`successfully loaded ${results.successes.length} of ${authors.length} author records.`)

  if (results.failures.length) {
    console.log(`${results.failures.length} author records failed to load.`);
    console.log(results.failures)
  }
}
