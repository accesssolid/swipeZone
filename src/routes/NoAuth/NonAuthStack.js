import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppRoutes from "../RouteKeys/appRoutes";
import BottomTab from "../BottomTab/BottomTab";
import UniversityProfile from "../../screens/nonAuth/UniversityProfile";
import BlockedAccounts from "../../screens/nonAuth/BlockedAccounts";
import ReportUser from "../../screens/nonAuth/ReportUser";
import InnerChat from "../../screens/nonAuth/InnerChat";
import EditProfile from "../../screens/nonAuth/EditProfile";
import Favroites from "../../screens/nonAuth/Favroites";
import NotificationsList from "../../screens/nonAuth/NotificationsList";
import VideoCall from "../../screens/nonAuth/VideoCall";
import Call from "../../screens/nonAuth/Call";
import Settings from "../../screens/nonAuth/Settings";
import Notifications from "../../screens/nonAuth/Notifications";
import DeactivateAccount from "../../screens/nonAuth/DeactivateAccount";
import DeleteAccount from "../../screens/nonAuth/DeleteAccount";
import HelpSupport from "../../screens/nonAuth/HelpSupport";
import PrivacyPolicy from "../../screens/nonAuth/PrivacyPolicy";
import EditProfileUni from "../../screens/nonAuth/EditProfileUni";
import Recruited from "../../screens/nonAuth/Recruited";
import MajorsUpdate from "../../screens/nonAuth/MajorsUpdate";
import VideoPlayer from "../../screens/nonAuth/VideoPlayer";
import { useDispatch, useSelector } from "react-redux";
import { getFavListThunk } from "../../redux/Reducers/favs";
import OtherUserProfile from "../../screens/nonAuth/OtherUserProfile";
import hit from "../../api/Manager/manager";
import { endpoints } from "../../api/Services/endpoints";
import useGeolocation, { requestLocationPermission } from "../../screens/components/GeoLocation";
import { Linking, Platform, View } from "react-native";
import LocModal from "../../screens/modals/LocModal";
import AppUtils from "../../utils/appUtils";
import { getUserDetailThunk, setUser } from "../../redux/Reducers/userData";
import { getAllNotifications } from "../../redux/Reducers/notification";
import notifee, { EventType } from "@notifee/react-native";
import { useNavigation } from "@react-navigation/native";
import changeOnlineStatus from "../../utils/changeOnlineStatus";
import CallReciever from "../../screens/nonAuth/CallReciever";
import AudioCallReciever from "../../screens/nonAuth/AudioCallReciever";
import Faq from "../../screens/nonAuth/Faq";
import messaging from "@react-native-firebase/messaging";
import { setHasIncomingCall } from "../../redux/Reducers/call";
import { getNoInteractionMatches } from "../../redux/Reducers/matches";
import { getAllPlans, getSubFeatures } from "../../redux/Reducers/subcriptions";
import AboutUser from "../../screens/auth/AtheleteSignup/AboutUser";
import MoreSwipes from "../../screens/nonAuth/MoreSwipes";
import { setSwipes } from "../../redux/Reducers/swipes";
import userAnalytics, { USEREVENTS } from "../../utils/userAnalytics";

export default function NonAuthStack() {
  const appstate = useSelector(state => state?.appstate?.appstate)
  const user = useSelector(state => state?.userData)?.user
  const isAthlete = useSelector(state => state?.userData?.isAthlete)
  console.log("RRRRRRRRR", isAthlete)
  const dispatch = useDispatch()
  const Stack = createNativeStackNavigator();
  // const { coordinates, error } = useGeolocation();
  const navigation = useNavigation();

  const [locModal, setLocModal] = useState(false)
  const [fcmToken, setFcmToken] = useState(null)

  useEffect(() => {
    checkApplicationPermission()
    dispatch(getAllPlans())
    dispatch(getFavListThunk())
    dispatch(getAllNotifications())
    dispatch(getNoInteractionMatches())
    changeOnlineStatus(true)
    // checkLocPermission()  not in use currently for location permission check
  }, [])
  useEffect(() => {
    dispatch(getSubFeatures(user))
  }, [user])

  ///for locations and adress currently not in use
  // useEffect(() => {
  //   if (error) {
  //     // console.log(error, "Sdf");
  //   } else {
  //     if (coordinates) {
  //       getAddressFrom(coordinates)
  //     }
  //   }
  // }, [coordinates, error])
  // useEffect(() => {
  //   checkLocPermission()
  // }, [appstate])

  // forground event handler notification
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      userAnalytics(isAthlete ? USEREVENTS.pnNewAthleteOpen : USEREVENTS.pnNewCoachesOpen, { user: "", platform: Platform.OS })
      console.log("77777777", type, detail)
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
            dispatch(setHasIncomingCall(1))
            notifee.cancelNotification(detail?.notification?.id)
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
            return
          }
          if (detail?.notification?.data?.notiType == 3) {
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { key: detail?.notification?.data?.chat_id } })
          } else if (detail?.notification?.data?.notiType == 4) {
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
          } else if (detail?.notification?.data?.notiType == 7) {
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.Subscription })
          } else {
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.NotificationsList })
          }
          break;
        case EventType.DELIVERED:
          if (detail?.notification?.data?.notiType == 1) {
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.Recruited, params: { data: JSON.parse(detail?.notification?.data?.extraData) } })
            return
          }
          if (detail?.notification?.body == "Video Call" || detail?.notification?.body == "Voice Call") {
            dispatch(setHasIncomingCall(1))
            notifee.cancelNotification(detail?.notification?.id)
            navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })
            // Platform?.OS == "android" && [notifee.cancelNotification(detail?.notification?.id), navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: detail?.notification?.data } })]
            return
          }
          break
      }
    });
    return unsubscribe;
  }, [])

  const getAddressFrom = async (cord) => {
    // fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + (cord?.latitude ?? 0.0) + ',' + (cord?.longitude ?? 0.0) + '&key=' + 'AIzaSyDm8QEvelkSnYwSVQvWKBoMjg32EeanIiw')
    //   .then(async res => {
    //     let resjson = await res.json();
    //     if (resjson.results.length > 0) {
    //       let name = resjson.results[0].formatted_address
    //       updateLocation(cord, name)
    //     } else {
    //       updateLocation(cord, "")
    //     }
    //   })
    //   .catch(error => console.log('results error => ', error.message));
  }
  const updateLocation = async (coordinates, name) => {
    let body = {
      "location": {
        "type": "Point",
        "coordinates": [coordinates?.longitude, coordinates?.latitude]
      }
    }
    if (name) {
      body = { ...body, locationAddress: name }
    }
    let fcm = await messaging().getToken();
    if (fcm) {
      body = { ...body, fcmToken: fcm }
    }
    try {
      let res = await hit(endpoints.updateself, "patch", body)
      if (res?.data) {
        dispatch(setUser(res?.data))
      }
    } catch (e) {
    } finally {
    }
  }
  async function checkApplicationPermission() {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      let fcm = await messaging().getToken();
      updateUser(fcm)
      console.log('User has notification permissions enabled.');
    } else if (
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log('User has provisional notification permissions.');
      updateUser('')
    } else {
      console.log('User has notification permissions disabled');
      updateUser('')
    }
  }
  const updateUser = async (fcm) => {
    let body = { lastLogged: new Date() }
    if (fcm) {
      body = { ...body, fcmToken: fcm }
    }
    try {
      let res = await hit(endpoints.updateself, "patch", body)
      // console.log(res?.data, fcm);
      if (res?.data) {
        dispatch(setUser(res?.data))
        let swipes = { freeSwipes: res?.data?.freeCount ?? 0, paidSwipes: res?.data?.inPurchaseCount ?? 0, hasPurchased: res?.data?.isInAppPurchase ?? false }
        dispatch(setSwipes(swipes))
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }
  const checkLocPermission = async () => {
    let permission = await requestLocationPermission()
    AppUtils.showLog("is location enabled", permission);
    if (permission) {
      setLocModal(false)
    } else {
      setTimeout(() => {
        setLocModal(true)
      }, 400);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <LocModal vis={locModal} onPressOk={() => { Linking.openSettings() }}/> */}
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={AppRoutes.BottomTab}>
        <Stack.Screen name={AppRoutes.BottomTab} component={BottomTab} />
        <Stack.Screen name={AppRoutes.AboutUser} component={AboutUser} />
        <Stack.Screen name={AppRoutes.UniversityProfile} component={UniversityProfile} />
        <Stack.Screen name={AppRoutes.BlockedAccounts} component={BlockedAccounts} />
        <Stack.Screen name={AppRoutes.ReportUser} component={ReportUser} />
        <Stack.Screen name={AppRoutes.InnerChat} component={InnerChat} />
        <Stack.Screen name={AppRoutes.EditProfile} component={EditProfile} />
        <Stack.Screen name={AppRoutes.EditProfileUni} component={EditProfileUni} />
        <Stack.Screen name={AppRoutes.Favorites} component={Favroites} />
        <Stack.Screen name={AppRoutes.NotificationsList} component={NotificationsList} />
        <Stack.Screen name={AppRoutes.VideoCall} component={VideoCall} options={{ gestureEnabled: false }} />
        <Stack.Screen name={AppRoutes.Call} component={Call} options={{ gestureEnabled: false }} />
        <Stack.Screen name={AppRoutes.CallReciever} component={CallReciever} />
        <Stack.Screen name={AppRoutes.AudioCallReciever} component={AudioCallReciever} options={{ gestureEnabled: false }} />
        <Stack.Screen name={AppRoutes.Settings} component={Settings} />
        <Stack.Screen name={AppRoutes.Notifications} component={Notifications} />
        <Stack.Screen name={AppRoutes.DeactivateAccount} component={DeactivateAccount} />
        <Stack.Screen name={AppRoutes.DeleteAccount} component={DeleteAccount} />
        <Stack.Screen name={AppRoutes.HelpSupport} component={HelpSupport} />
        <Stack.Screen name={AppRoutes.PrivacyPolicy} component={PrivacyPolicy} />
        <Stack.Screen name={AppRoutes.Recruited} component={Recruited} />
        <Stack.Screen name={AppRoutes.MajorsUpdate} component={MajorsUpdate} />
        <Stack.Screen name={AppRoutes.VideoPlayer} component={VideoPlayer} />
        <Stack.Screen name={AppRoutes.OtherUserProfile} component={OtherUserProfile} />
        <Stack.Screen name={AppRoutes.Faq} component={Faq} />
        <Stack.Screen name={AppRoutes.MoreSwipes} component={MoreSwipes} />
      </Stack.Navigator>
    </View>
  );
}
