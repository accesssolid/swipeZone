import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        // saving error
    }
}

const removeValue = async (key) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
        // remove error
    }

    console.log('Done.')
}

const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) {
            // value previously stored
            return JSON.parse(value)
        }
    } catch (e) {
        // error reading value
    }
}

const clearAll = async () => {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        // clear error
    }

    console.log('Done.')
}

export { storeData, getData, removeValue, clearAll }