//const path = require('path')
const { initReactI18next } = require('react-i18next');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    //locales: ['en', 'cn', 'zh'],
    locales: ['en'],
    ns: ['common', 'footer'],//, 'button', 'form', 'section'],
    //localePath: path.resolve('./public/locales'),
    //react: { useSuspense: false },//this line
    serializeConfig: false,
    use: [ initReactI18next ]
  },
};