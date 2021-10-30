const util = require('../util')

const louvre = {
  contents: [
    {
      lang: 'en',

      name: 'Louvre EN',
      info: 'Louvre EN Info',
      welcomeText: 'Louvre EN Welcome Text',
      termsOfUse: 'Louvre EN Terms of Use',
      privacyTerms: 'Louvre EN Privacy Terms',
      imprint: 'Louvre EN Imprint',

      logo: {
        filename: 'louvre_en_logo.png',
        alternativeText: 'Louvre EN Logo Alt Text'
      },

      image: {
        filename: 'louvre_en_image.jpg',
        alternativeText: 'Louvre EN Image Alt Text'
      },

      sitePlan: {
        filename: 'louvre_en_site_plan.jpg',
        alternativeText: 'Louvre EN Site Plan Alt Text'
      },

      sitePlanText: 'Louvre EN Site Plan Text'
    },
    {
      lang: 'de',

      name: 'Louvre DE',
      info: 'Louvre DE Info',
      welcomeText: 'Louvre DE Welcome Text',
      termsOfUse: 'Louvre DE Terms of Use',
      privacyTerms: 'Louvre DE Privacy Terms',
      imprint: 'Louvre DE Imprint',

      logo: {
        filename: 'louvre_de_logo.png',
        alternativeText: 'Louvre DE Logo Alt Text'
      },

      image: {
        filename: 'louvre_de_image.jpg',
        alternativeText: 'Louvre DE Image Alt Text'
      },

      sitePlan: {
        filename: 'louvre_de_site_plan.jpg',
        alternativeText: 'Louvre DE Site Plan Alt Text'
      },

      sitePlanText: 'Louvre DE Site Plan Text'
    },
  ]
}

const germanMuseum = {
  contents: [
    {
      lang: 'en',

      name: 'German Museum EN',
      info: 'German Museum EN Info',
      welcomeText: 'German Museum EN Welcome Text',
      termsOfUse: 'German Museum EN Terms of Use',
      privacyTerms: 'German Museum EN Privacy Terms',
      imprint: 'German Museum EN Imprint',

      logo: {
        filename: 'german_museum_en_logo.png',
        alternativeText: 'German Museum EN Logo Alt Text'
      },

      image: {
        filename: 'german_museum_en_image.jpg',
        alternativeText: 'German Museum EN Image Alt Text'
      },

      sitePlan: {
        filename: 'german_museum_en_site_plan.jpg',
        alternativeText: 'German Museum EN Site Plan Alt Text'
      },

      sitePlanText: 'German Museum EN Site Plan Text'
    },
    {
      lang: 'de',

      name: 'German Museum DE',
      info: 'German Museum DE Info',
      welcomeText: 'German Museum DE Welcome Text',
      termsOfUse: 'German Museum DE Terms of Use',
      privacyTerms: 'German Museum DE Privacy Terms',
      imprint: 'German Museum DE Imprint',

      logo: {
        filename: 'german_museum_de_logo.png',
        alternativeText: 'German Museum DE Logo Alt Text'
      },

      image: {
        filename: 'german_museum_de_image.jpg',
        alternativeText: 'German Museum DE Image Alt Text'
      },

      sitePlan: {
        filename: 'german_museum_de_site_plan.jpg',
        alternativeText: 'German Museum DE Site Plan Alt Text'
      },

      sitePlanText: 'German Museum DE Site Plan Text'
    },
  ]
}

util.deepFreeze(louvre)
util.deepFreeze(germanMuseum)

module.exports = {louvre, germanMuseum}
