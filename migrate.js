const migrate = require('migrate')
const path = require('path')

module.exports = (dbUri) => new Promise((resolve, reject) => {

  // Make DB URI accessible in migrations
  process.env.DB_URI = dbUri

  migrate.load({
    stateStore: '.migrate',
    migrationsDirectory: path.resolve(__dirname, 'migrations/')
  }, function (err, set) {
    if (err) {
      reject(err)
    }

    set.up(function (err) {
      if (err) {
        reject(err)
      }

      console.log('Migrations ran successfully')

      resolve()
    })
  })
})
