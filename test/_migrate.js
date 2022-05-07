const migrate = require('../migrate')

it('Migrate', async () => {
  await migrate('mongodb://localhost:27017/wavdio-express')
})
