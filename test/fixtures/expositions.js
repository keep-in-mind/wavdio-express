const { deepFreeze } = require('../util')

const exposition110 = deepFreeze({
  museum: '',

  active: true,
  code: 110,
  note: 'Exposition 110 Note',

  logo: {
    filename: 'exposition_110_logo.jpg',
    alternativeText: 'Exposition 110 Alt Text'
  },

  views: [
    { timestamp: '2000-01-01T10:00:00.000Z' },
    { timestamp: '2000-01-01T11:00:00.000Z' },
    { timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  likes: [
    { timestamp: '2000-01-01T10:00:00.000Z' },
    { timestamp: '2000-01-01T11:00:00.000Z' },
    { timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  comments: [
    { text: 'Exposition 110 Comment 1', timestamp: '2000-01-01T10:00:00.000Z' },
    { text: 'Exposition 110 Comment 2', timestamp: '2000-01-01T11:00:00.000Z' },
    { text: 'Exposition 110 Comment 3', timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  contents: [
    {
      lang: 'en',

      name: 'Exposition 110 EN',
      info: 'Exposition 110 EN Info'
    },
    {
      lang: 'de',

      name: 'Exposition 110 DE',
      info: 'Exposition 110 DE Info'
    }
  ]
})

const exposition120 = deepFreeze({
  museum: '',

  active: true,
  code: 120,
  note: 'Exposition 120 Note',

  logo: {
    filename: 'exposition_120_logo.jpg',
    alternativeText: 'Exposition 120 Alt Text'
  },

  views: [
    { timestamp: '2000-01-01T10:00:00.000Z' },
    { timestamp: '2000-01-01T11:00:00.000Z' },
    { timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  likes: [
    { timestamp: '2000-01-01T10:00:00.000Z' },
    { timestamp: '2000-01-01T11:00:00.000Z' },
    { timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  comments: [
    { text: 'Exposition 120 Comment 1', timestamp: '2000-01-01T10:00:00.000Z' },
    { text: 'Exposition 120 Comment 2', timestamp: '2000-01-01T11:00:00.000Z' },
    { text: 'Exposition 120 Comment 3', timestamp: '2000-01-01T12:00:00.000Z' }
  ],

  contents: [
    {
      lang: 'en',

      name: 'Exposition 120 EN',
      info: 'Exposition 120 EN Info'
    },
    {
      lang: 'de',

      name: 'Exposition 120 DE',
      info: 'Exposition 120 DE Info'
    }
  ]
})

module.exports = { exposition110, exposition120 }
