
const path = require('path');
// import the env variables FIRST - Before you do anything else
require('dotenv').config({ path: path.join(__dirname, './../.env') })

const config = {
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PW,
  db_name: process.env.MONGO_DB_NAME
}

const quotations = require('./../data/quotations.json');
const Database = require('./../models/Database.js');
const QuotationModel = require('./../models/Quotation.js')

main()

async function main () {
  // connect to database
  const database = new Database(config)
  try {
    console.log('connecting to database ..')
    await database.connect();
    await loadQuotations();
    
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

async function loadQuotations () {
  const results = {
    successes: [],
    failures: []
  }
  for (let data of quotations) {
    try {
      const body = QuotationModel.parseInput(data);
      const quotation = new QuotationModel(body);
      const response = await quotation.save();
      results.successes.push(quotation.id)
    } catch (error) {
      results.failures.push(error.message);
    }
  }
  console.log('completed load process ...');
  console.log(`successfully loaded ${results.successes.length} of ${quotations.length} quotation records.`)
  if (results.failures.length) {
    console.log(`${results.failures.length} quotation records failed to load.`);
    console.log(results.failures)
  }
}
