
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
const { QuotationModel } = require('./../models/Quotation.js')

const authors = [
  {
    "fullName": "Pharoah Thutmose III",
    "firstName": "Pharaoh",
    "middleName": "",
    "lastName": "Thutmose III",
    "born": new Date(-1480,3,28),
    "died": new Date(-1424,2,11),
    "bio": "Thutmose III (variously also spelt Tuthmosis or Thothmes), sometimes called Thutmose the Great, (1479–1425 BCE) was the fifth pharaoh of the 18th Dynasty of Egypt. He is regarded as one of the greatest warriors, military commanders, and military strategists of all time; as Egypt's preeminent warrior pharaoh and conqueror; and as a dominant figure in the New Kingdom period.",
    "reference": "https://en.wikipedia.org/wiki/Thutmose_III",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Thutmosis_III-2.jpg/500px-Thutmosis_III-2.jpg",
  }
]

main()

async function main () {
  // connect to database
  const database = new Database(config)
  try {
    console.log('connecting to database ..')
    await database.connect();
    await loadAuthors();
    const authors = await AuthorModel.find().distinct('fullName')
    const authorNames = await QuotationModel.find().distinct('author')
    const needed = authorNames.filter(x => !authors.includes(x))
    const extra = authors.filter(x => !authorNames.includes(x))
    console.log('authors needed:')
    console.log(needed)
    console.log('extra authors:')
    console.log(extra)
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

async function loadAuthors () {
  const results = {
    successes: [],
    failures: []
  }
  for (let data of authors) {
    try {
      const body = AuthorModel.parseInput(data);
      const author = new AuthorModel(body);
      const response = await author.save();
      results.successes.push(author.id)
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
