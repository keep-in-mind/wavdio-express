const util = require('../util')

const defaultMuseum = {
  logo: null,

  contents: [
    {
      lang: 'en',
      name: 'New museum',
      welcomeText: 'Welcome!',
      sitePlan: null,
      termsOfUse: 'Terms of use...',
      privacyTerms: 'Privacy statement...',
    },
    {
      lang: 'de',
      name: 'Neues Museum',
      welcomeText: 'Willkommen!',
      sitePlan: null,
      termsOfUse: 'Nutzungsbedingungen...',
      privacyTerms: 'Datenschutzrichtlinie...',
    },
    {
      lang: 'es'
    },
    {
      lang: 'fr'
    }
  ]
}

const germanMuseum = {
  logo: {
    filename: 'german_museum.jpg',
    alternativeText: 'German Museum'
  },

  contents: [
    {
      lang: 'en',

      name: 'German Museum',
      welcomeText: 'Welcome to the German Museum!',
      termsOfUse: 'terms of use...',
      privacyTerms: 'privacy terms...',

      sitePlan: {
        filename: 'site_plan_en.png',
        alternativeText: 'Site Plan'
      }
    },
    {
      lang: 'de',

      name: 'Deutsches Museum',
      welcomeText: 'Willkommen im Deutschen Museum!',
      termsOfUse: 'Nutzungsbedingungen',
      privacyTerms: 'Datenschutzrichtlinie',

      sitePlan: {
        filename: 'site_plan_de.png',
        alternativeText: 'Lageplan'
      }
    }
  ]
}

const louvre = {
  logo: {
    filename: 'louvre.jpg',
    alternativeText: 'Louvre'
  },

  contents: [
    {
      lang: 'en',

      name: 'Louvre',
      welcomeText: 'Welcome to the Louvre!',
      termsOfUse: 'terms of use...',
      privacyTerms: 'privacy terms...',

      sitePlan: {
        filename: 'site_plan_en.png',
        alternativeText: 'Site Plan'
      }
    },
    {
      lang: 'de',

      name: 'Louvre',
      welcomeText: 'Willkommen im Louvre!',
      termsOfUse: 'Nutzungsbedingungen',
      privacyTerms: 'Datenschutzrichtlinie',

      sitePlan: {
        filename: 'site_plan_de.png',
        alternativeText: 'Lageplan'
      }
    }
  ]
}

util.deepFreeze(defaultMuseum)
util.deepFreeze(germanMuseum)
util.deepFreeze(louvre)

module.exports = {defaultMuseum, germanMuseum, louvre}
