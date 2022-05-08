const { deepFreeze } = require('../util')

const infopage1 = deepFreeze({
  lang: 'en',

  name: 'Infopage 1',
  text: 'Infopage 1 Text'
})

const infopage2 = deepFreeze({
  lang: 'de',

  name: 'Infopage 2',
  text: 'Infopage 2 Text'
})

module.exports = { infopage1, infopage2 }
