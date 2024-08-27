import React, {createContext, useState} from 'react';
import * as RNLocalize from 'react-native-localize';
import LocalizedStrings from 'react-native-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppUtils from '../utils/appUtils';
import { strings } from '../constants/variables';

export const DEFAULT_LANGUAGE = strings.english;

export const localization = new LocalizedStrings({
  "English": require('./langFiles/en.json'),
 'French': require('./langFiles/fr.json'),
  // 'Spanish': require('./spanish.json'),
});

export const LocalizationContext = createContext({
  localization,
  setAppLanguage: () => {},
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: () => {},
});

export const LocalizationProvider = ({children}) => {
  const [appLanguage, setAppLanguage] = useState(DEFAULT_LANGUAGE);

  const setLanguage = language => {
    localization.setLanguage(language);
    setAppLanguage(language);
    AsyncStorage.setItem(strings.appLanguage, language);
  };

  const initializeAppLanguage = async () => {
    const currentLanguage = await AsyncStorage.getItem(strings.appLanguage);
    AppUtils.showLog(currentLanguage);
    if (!currentLanguage) {
      let localeCode = DEFAULT_LANGUAGE;
      const supportedLocaleCodes = localization.getAvailableLanguages();
      const phoneLocaleCodes = RNLocalize.getLocales().map(
        locale => locale.languageCode,
      );
      phoneLocaleCodes.some(code => {
        if (supportedLocaleCodes.includes(code)) {
          localeCode = code;
          return true;
        }
      });
      AppUtils.showLog(localeCode);
      setLanguage(localeCode);
    } else {
      AppUtils.showLog(currentLanguage);
      setLanguage(currentLanguage);
    }
  };

  return (
    <LocalizationContext.Provider
      value={{
        localization,
        setAppLanguage: setLanguage,
        appLanguage,
        initializeAppLanguage,
      }}>
      {children}
    </LocalizationContext.Provider>
  );
};
