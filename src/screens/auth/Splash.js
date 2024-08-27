// import React, { useEffect, useState } from "react";
// import { StyleSheet, Image, ImageBackground, View } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { useTheme } from "@react-navigation/native";
// import AppRoutes from "../../routes/RouteKeys/appRoutes";
// import notifee from "@notifee/react-native";
// import FastImage from "react-native-fast-image";
// import { hp, wp } from "../../utils/dimension";
// import { setHasIncomingCall } from "../../redux/Reducers/call";

// function Splash({ navigation }) {
//   const auth = useSelector((state) => state.userData.auth);

//   const dispatch = useDispatch()
//   const { images } = useTheme();

//   const routeCheck = async () => {
//     if (!auth) {
//       navigation.replace(AppRoutes.Welcome);
//       return
//     }
//     const initialNotification = await notifee.getInitialNotification();
//     if (initialNotification) {
//       if (initialNotification?.notification?.data?.notiType == 3) {
//         navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { key: initialNotification?.notification?.data?.chat_id } })
//         return
//       }
//       if (initialNotification?.notification?.body == "Video Call" || initialNotification?.notification?.body == "Voice Call") {
//         dispatch(setHasIncomingCall(1))
//         notifee.cancelNotification(initialNotification?.notification?.id)
//         navigation.replace(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: initialNotification?.notification?.data } })
//         return
//       }
//       // if (initialNotification?.notification?.data?.notiType == 4) {
//       //   navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: initialNotification?.notification?.data } })
//       //   return
//       // }
//     } else {
//       navigation.replace(AppRoutes.NonAuthStack)
//     }
//   }

//   return (
//     <View style={{ flex: 1, justifyContent: "center" }}>
//       <FastImage source={images.logo} style={style.image} resizeMode="contain" />
//       <FastImage source={images.splashgrad} style={style.parent} />
//       <ImageComp splashEnded={() => { routeCheck() }} />
//     </View>
//   );
// }
// const style = StyleSheet.create({
//   parent: {
//     position: 'absolute',
//     zIndex: 1,
//     height: hp(100),
//     width: wp(100)
//   },
//   image: {
//     width: wp(38),
//     height: hp(20),
//     alignSelf: "center",
//     position: "absolute",
//     zIndex: 2
//   },
// });
// export default Splash;

// const ImageComp = ({ splashEnded }) => {
//   const { images } = useTheme();
//   const [imgNum, setImgNum] = useState(0)

//   useEffect(() => {
//     let timeoutId;

//     if (imgNum < 6) {
//       timeoutId = setTimeout(() => {
//         setImgNum(imgNum + 1)
//       }, 900);
//     } else {
//       splashEnded()
//     }

//     return () => {
//       clearTimeout(timeoutId);
//     };
//   }, [imgNum])

//   return (
//     imgNum == 0 ?
//       <FastImage source={images.splashbg} style={{ flex: 1 }} />
//       :
//       imgNum == 1 ?
//         <FastImage source={images.splashbglacrose} style={{ flex: 1 }} />
//         :
//         imgNum == 2 ?
//           <FastImage source={images.splashbgvb} style={{ flex: 1 }} />
//           :
//           imgNum == 3 ?
//             <FastImage source={images.splashbgbb} style={{ flex: 1 }} />
//             :
//             imgNum == 4 ?
//               <FastImage source={images.splashbgfb} style={{ flex: 1 }} />
//               :
//               <FastImage source={images.splashbgsb} style={{ flex: 1 }} />
//   )
// }

import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import AppRoutes from "../../routes/RouteKeys/appRoutes";
import notifee from "@notifee/react-native";
import FastImage from "react-native-fast-image";
import { hp, wp } from "../../utils/dimension";
import { setHasIncomingCall } from "../../redux/Reducers/call";

function Splash({ navigation }) {
  const auth = useSelector((state) => state.userData.auth);
  const dispatch = useDispatch();
  const { images } = useTheme();

  const routeCheck = async () => {
    if (!auth) {
      navigation.replace(AppRoutes.Welcome);
      return;
    }
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      if (initialNotification?.notification?.data?.notiType == 3) {
        navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { key: initialNotification?.notification?.data?.chat_id } });
        return;
      }
      if (initialNotification?.notification?.body == "Video Call" || initialNotification?.notification?.body == "Voice Call") {
        dispatch(setHasIncomingCall(1));
        notifee.cancelNotification(initialNotification?.notification?.id);
        navigation.replace(AppRoutes.NonAuthStack, { screen: AppRoutes.CallReciever, params: { data: initialNotification?.notification?.data } });
        return;
      }
    } else {
      navigation.replace(AppRoutes.NonAuthStack);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <FastImage source={images.logo} style={style.image} resizeMode="contain" />
      <FastImage source={images.splashgrad} style={style.parent} />
      <ImageComp splashEnded={routeCheck} />
    </View>
  );
}

const style = StyleSheet.create({
  parent: {
    position: "absolute",
    zIndex: 1,
    height: hp(100),
    width: wp(100),
  },
  image: {
    width: wp(38),
    height: hp(20),
    alignSelf: "center",
    position: "absolute",
    zIndex: 2,
  },
});

export default Splash;

const ImageComp = ({ splashEnded }) => {
  const { images } = useTheme();
  const [imgNum, setImgNum] = useState(0);

  useEffect(() => {
    const imageCount = 6;
    const totalDuration = 3000;
    const intervalTime = totalDuration / imageCount;
    let timeoutId;

    if (imgNum < imageCount) {
      timeoutId = setTimeout(() => {
        setImgNum(imgNum + 1);
      }, intervalTime);
    } else {
      splashEnded();
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [imgNum]);

  const imagesArray = [
    images.splashbg,
    images.splashbglacrose,
    images.splashbgvb,
    images.splashbgbb,
    images.splashbgfb,
    images.splashbgsb,
  ];

  return <FastImage source={imagesArray[imgNum]} style={{ flex: 1 }} />;
};
