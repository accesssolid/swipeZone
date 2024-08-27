import React, { useEffect, useState } from "react";
import { AppState, Linking, Platform, useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store, persistor } from "./src/redux/Store/store";
import { LightTheme, DarkTheme } from "./src/constants/colors";
import MainStack from "./src/routes/mainStack/mainStack";
import AppUtils from "./src/utils/appUtils";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import UpdatePopup from "./src/screens/modals/UpdatePopup";
import { useNetInfo } from "@react-native-community/netinfo";
import NetInfo from "./src/screens/modals/NetInfo";
import { PersistGate } from "redux-persist/integration/react";
import { LocalizationProvider } from "./src/localization/localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SetAppLanguage } from './src/redux/Reducers/userData'
import { strings } from "./src/constants/variables";
import { navigationRef } from "./src/routes/RootNavigation";
import Loader from "./src/screens/modals/Loader";
import { updateAppstate } from "./src/redux/Reducers/appstate";
import { getAllNotifications } from "./src/redux/Reducers/notification";
import AppRoutes from "./src/routes/RouteKeys/appRoutes";
import changeOnlineStatus from "./src/utils/changeOnlineStatus";
import { clearCallData, setHasIncomingCall } from "./src/redux/Reducers/call";
import { getSportListThunk } from "./src/redux/Reducers/dropdownlist";
import { withIAPContext } from 'react-native-iap';
import { urls } from "./src/constants/urls";

const App = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const netInfo = useNetInfo();
  const theme = useColorScheme();

  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

  useEffect(() => {
    AppUtils.adaCompliance()
    // getFcm();
    checkUpdate();
    getLanguage();
    store.dispatch(getSportListThunk())
    const unsubscribe = messaging().onMessage(onMessageReceived);
    messaging().setBackgroundMessageHandler(onMessageReceived);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (netInfo.isConnected != null) {
      setIsConnected(netInfo.isConnected);
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        store.dispatch(updateAppstate(true))
        changeOnlineStatus(true)
        checkUpdate();
      } else {
        store.dispatch(updateAppstate(false))
        changeOnlineStatus(false)
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  //background events notification
  useEffect(() => {
    const unsubscribe = notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log("&&&&&&&",type,detail)
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
            store.dispatch(setHasIncomingCall(1))
            notifee.cancelNotification(detail?.notification?.id)
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
            return
          }
          if (detail?.notification?.data?.notiType == 3) {
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { key: detail?.notification?.data?.chat_id } })
          } else if (detail?.notification?.data?.notiType == 4) {
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
          } else {
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.NotificationsList })
          }
          break;
        case EventType.DELIVERED:
          if (detail?.notification?.data?.notiType == 1) {
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.Recruited, params: { data: JSON.parse(detail?.notification?.data?.extraData) } })
            return
          }
          if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
            store.dispatch(setHasIncomingCall(1))
            notifee.cancelNotification(detail?.notification?.id)
            navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
            return
          }
          break
      }
    });
    return unsubscribe;
  }, [])

  //forground event handler notification
  // useEffect(() => {
  //   const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
  //     switch (type) {
  //       case EventType.DISMISSED:
  //         break;
  //       case EventType.PRESS:
  //         if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
  //           store.dispatch(setHasIncomingCall(1))
  //           notifee.cancelNotification(detail?.notification?.id)
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
  //           return
  //         }
  //         if (detail?.notification?.data?.notiType == 3) {
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { key: detail?.notification?.data?.chat_id } })
  //         } else if (detail?.notification?.data?.notiType == 4) {
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
  //         } else {
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.NotificationsList })
  //         }
  //         break;
  //       case EventType.DELIVERED:
  //         if (detail?.notification?.data?.notiType == 1) {
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.Recruited, params: { data: JSON.parse(detail?.notification?.data?.extraData) } })
  //           return
  //         }
  //         if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
  //           store.dispatch(setHasIncomingCall(1))
  //           notifee.cancelNotification(detail?.notification?.id)
  //           navigationRef.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
  //           return
  //         }
  //         break
  //     }
  //   });
  //   return unsubscribe;
  // }, [])

  const getLanguage = async () => {
    try {
      const value = await AsyncStorage.getItem(strings.appLanguage);
      if (value !== null) {
        const result = JSON.parse(value);
        store.dispatch(SetAppLanguage(result.appLanguage));
      } else {

      }
    } catch (e) {

    } finally {
    }
  };
  const getFcm = async () => {
    let fcm = await AppUtils.getToken();
  };
  const checkUpdate = async () => {
    let isNew = await AppUtils.checkAppVersion();
    setIsUpdateAvailable(isNew);
  };
  const onMessageReceived = async (message) => {
    store.dispatch(getAllNotifications())
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default",
      importance: AndroidImportance.HIGH,
    });
    if (message?.notification?.title == "Call Ended") {
      store.dispatch(clearCallData())
    } else {
      notifee.displayNotification({
        title: message?.notification?.title,
        body: message?.notification?.body,
        android: {
          channelId,
        },
        data: message?.data,
        ios: {
          sound: "default",
        },
      });
    }
  }

  return (
    <>
      <NetInfo isVisible={!isConnected} />
      <LocalizationProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NavigationContainer theme={theme == "dark" ? DarkTheme : LightTheme} ref={navigationRef}>
              <UpdatePopup onBackDropPress={() => { setIsUpdateAvailable(false); Linking.openURL(Platform.OS == "ios" ? urls.iosAppLink : urls.androidAppLink) }} isVisible={isUpdateAvailable} />
              <MainStack />
              <Loader />
            </NavigationContainer>
          </PersistGate>
        </Provider>
      </LocalizationProvider>
    </>
  );
};

export default withIAPContext(App);
