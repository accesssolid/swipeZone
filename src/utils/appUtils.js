import messaging from "@react-native-firebase/messaging";
import Toast from "react-native-simple-toast";
import { urls } from "../constants/urls";
import { config, Mode } from "../../config";
import { PermissionsAndroid, Platform, Text, TextInput } from "react-native";
import { checkPermissionAndroid } from "./androidPermissionChecker";
import { check, PERMISSIONS, request } from "react-native-permissions";
import VersionCheck from "react-native-version-check";

const AppUtils = {
  //Phone validation
  validatePhone: (phone) => {
    var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  },

  //Email validation
  validateEmail: (email) => {
    const regexp =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexp.test(email);
  },

  // Toast
  showToast: (text) => {
    setTimeout(() => {
      if ((text?.trim() ?? "") == "") {
        Toast.show("Something went wrong");
      } else {
        Toast.show(text);
      }
    }, 600);
  },

  // LOG
  showLog: (message, ...optionalParams) => {
    config.mode == Mode.DEV && console.log(message, ...optionalParams);
  },

  // FCM TOKEN
  getToken: async () => {
    try {
      if (Platform.OS === 'android') {
        let haspermission = await checkPermissionAndroid(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        if (haspermission) {
          const token = await messaging().getToken();
          return token;
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
          return "";
        }
      }
      const authorizationStatus = await messaging().requestPermission();
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        const token = await messaging().getToken();
        return token;
      } else {
        return "";
      }
    } catch (e) {
    }
  },

  // Disable font size increase from phone settings
  disableFontScale: () => {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
  },

  // Enable Ada compliance
  adaCompliance: () => {
    if (TextInput.defaultProps == null) {
      TextInput.defaultProps = {};
      TextInput.defaultProps.maxFontSizeMultiplier = 1.4;
    }
    if (Text.defaultProps == null) {
      Text.defaultProps = {};
      Text.defaultProps.maxFontSizeMultiplier = 1.4;
    }
  },

  // Check Update with live version's
  checkAppVersion: async () => {
    let packageName = await VersionCheck.getPackageName();
    let getLatestVersion = await VersionCheck.getLatestVersion({
      packageName: packageName
    })
    let res = await VersionCheck.needUpdate({
      currentVersion: VersionCheck.getCurrentVersion(),
      latestVersion: getLatestVersion,
    })
    if (res?.isNeeded) {
      return true;
    } else {
      return false;
    }
  },

  getAndroidLibPermission: async () => {
    const permission = Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    let result = await checkPermissionAndroid(permission)
    return result
  },

  checkCameraPermisssion: async () => {
    if (Platform?.OS == "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take pictures.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } else {
      let result = await check(PERMISSIONS.IOS.CAMERA)
      if (result != "granted") {
        let stat = await request(PERMISSIONS.IOS.CAMERA)
        return stat == "granted"
      }
      return true
    }
  },

  checkGalleryPermisssion: async () => {
    if (Platform?.OS == "android") {
      const granted = await PermissionsAndroid.request(
        Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Gallery Permission',
          message: 'This app needs access to your gallery to take pictures.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } else {
      let result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
      if (result == "limited") {
        return true
      }
      if (result != "granted") {
        let stat = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
        if (stat == "limited") {
          return true
        }
        return stat == "granted"
      }
      return true
    }
  },

  onlyNumbers: (text) => {
    let numbersOnly = text.replace(/\D/g, '');
    return numbersOnly;
  },
};

export default AppUtils;
