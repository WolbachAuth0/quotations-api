
const path = require('path');
// import the env variables FIRST - Before you do anything else
require('dotenv').config({ path: path.join(__dirname, './../.env') })

const config = {
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PW,
  db_name: process.env.MONGO_DB_NAME
}

const authors = require('./../data/authors.json');
const Database = require('./../models/Database.js');
const { AuthorModel } = require('./../models/Author.js')
const { QuotationModel } = require('./../models/Quotation.js')

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
