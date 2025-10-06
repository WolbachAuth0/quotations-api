const path = require('path');
// import the env variables FIRST - Before you do anything else
require('dotenv').config({ path: path.join(__dirname, './../.env') })
const jsonfile = require('jsonfile')

const config = {
  user: process.env.MONGO_USER,
  password: process.env.MONGO_PW,
  db_name: process.env.MONGO_DB_NAME
}

// const authors = require('./../data/authors.json');
const Database = require('./../models/Database.js');
const { AuthorModel } = require('./../models/Author.js')
const { QuotationModel } = require('./../models/Quotation.js')

main();

async function main () {
  // connect to database
  const database = new Database(config)
  try {
    console.log('connecting to database ..')
    await database.connect();

    await backupQuotations();
    await backupAuthors();

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

async function backupQuotations () {
  // get a list of all quotations
  const quotations = await QuotationModel.find({});
  // write data to backup file
  const file = path.join(__dirname, './../data/backup/quotations.json');
  await jsonfile.writeFile(file, quotations, { spaces: 2 });
}

async function backupAuthors () {
  // get a list of all authors
  const authors = await AuthorModel.find({})
  // save authors to json file
  const file = path.join(__dirname, './../data/backup/authors.json');
  await jsonfile.writeFile(file, authors, { spaces: 2 });
}
