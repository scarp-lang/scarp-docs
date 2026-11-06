/**
 * VitePress local-search locale options.
 *
 * Keep the built-in client-side index: it requires no third-party API key,
 * external search service, account, or network calls for typed search queries.
 * VitePress already generates separate English/Hindi locale indexes.
 */
export const localSearchOptions = {
  locales: {
    hi: {
      translations: {
        button: {
          buttonText: 'दस्तावेज़ खोजें',
          buttonAriaLabel: 'दस्तावेज़ खोजें'
        },
        modal: {
          displayDetails: 'विस्तृत परिणाम दिखाएँ',
          resetButtonTitle: 'खोज मिटाएँ',
          backButtonTitle: 'खोज बंद करें',
          noResultsText: 'कोई परिणाम नहीं मिला',
          footer: {
            selectText: 'चुनें',
            selectKeyAriaLabel: 'एंटर कुंजी',
            navigateText: 'परिणामों में जाएँ',
            navigateUpKeyAriaLabel: 'ऊपर तीर',
            navigateDownKeyAriaLabel: 'नीचे तीर',
            closeText: 'बंद करें',
            closeKeyAriaLabel: 'एस्केप कुंजी'
          }
        }
      }
    }
  }
} as const
