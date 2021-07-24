const mongodb = require('mongodb')

const config = require('../config')

const MongoClient = mongodb.MongoClient

//
// Mongo Connection URI
//

const dbHost = 'localhost'
const dbPort = 27017
const dbName = config['db-name']
const dbUser = config['db-user']
const dbPassword = config['db-password']

let uri;

if (migrate_db.uri) {
  uri = migrate_db.uri

} else if (dbUser === null && dbPassword === null) {
  uri = `mongodb://${dbHost}:${dbPort}/${dbName}`

} else if (dbUser !== null && dbPassword !== null) {
  uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`

} else {
  console.error('Error in config.json. Must provide both user and password, or neither.');
  process.exit();
}

//
// UP
//

module.exports.up = async function () {
  console.log('Upgrading to 40_imprint')

  // nothing to do
}

//
// DOWN
//

module.exports.down = async function () {
  console.log('Downgrading from 40_imprint')

  try {
    const db = await MongoClient.connect(uri, {useUnifiedTopology: true})
    const dbo = db.db(dbName)

    /* Delete imprint from all languages */

    dbo.collection('museums').updateOne({}, {$unset: {'contents.$[].imprint': ''}})

    /* */

    await db.close()

  } catch (error) {
    console.error(error)
  }
}
