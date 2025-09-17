
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
