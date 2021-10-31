const {deepFreeze} = require('../util')

module.exports.infopage1 = deepFreeze({
  lang: 'en',

  name: 'Infopage 1',
  text: 'Infopage 1 Text'
})

module.exports.infopage2 = deepFreeze({
  lang: 'de',

  name: 'Infopage 2',
  text: 'Infopage 2 Text'
})
