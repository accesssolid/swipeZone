import AsyncStorage from '@react-native-async-storage/async-storage';
import AppUtils from '../utils/appUtils';

const localStore = {
  
  storeData : async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      AppUtils.showToast('Async Error'+e)
      AppUtils.showLog('Async Error', e);
    } finally {
    }
  },

  removeData : async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      AppUtils.showToast('Async Error'+e)
      AppUtils.showLog('Async Error', e);
    } finally {
    }
  },

  getData : async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        const result = JSON.parse(value);
        return {status: true, value: result};
      }
    } catch (e) {
      AppUtils.showToast('Async Error'+e)
      AppUtils.showLog('Async Error', e);
      return {status: false, value: e};
    } finally {
    }
  },

  clearAll : async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      AppUtils.showToast('Async Error'+e)
      AppUtils.showLog('Async Error', e);
    }
  },
};
export default localStore;
