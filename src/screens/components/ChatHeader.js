import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { useTheme } from "@react-navigation/native";
import { wp } from "../../utils/dimension";
import AppFonts from "../../constants/fonts";
import { scaledValue } from "../../utils/designUtils";
import { LocalizationContext } from "../../localization/localization";
import { mediaurl } from "../../utils/mediarender";
import firestore from '@react-native-firebase/firestore';
import { useSelector } from "react-redux";

const ChatHeader = ({ onBackPress, onVoiceCallPress, onVideoCallPress, userdata, roomId }) => {
  const isAthlete = useSelector(state => state?.userData?.isAthlete)

  const { colors, images } = useTheme();
  const { localization } = useContext(LocalizationContext);
  const styles = UseStyles(colors, images);

  const [active, setActive] = useState(false)
  const [coaches, setCoaches] = useState([])
  const [gradYear, setGradYear] = useState("")

  useEffect(() => {
    let unsub = firestore().collection("onlines").doc(userdata?._id).onSnapshot((querySnapshot) => {
      let data = querySnapshot?.data()
      if (data?.online) {
        setActive(true)
      } else {
        setActive(false)
      }
    },
      (error) => console.log(error)
    )
    return () => {
      unsub()
      setActive(false)
    }
  }, [userdata])
  useEffect(() => {
    getCoaches(roomId)
    return () => {
      getCoaches(roomId)
    }
  }, [roomId])

  const getCoaches = async (room) => {
    firestore().collection("chats").doc(room).onSnapshot((res) => {
      let data = res?.data()
      if (data) {
        setCoaches(data?.coaches)
        setGradYear(data?.gradYear || "")
        return
      } else {
        if (userdata?.gradYear) {
          setGradYear(userdata?.gradYear || "")
        }
        if (userdata?.coaches) {
          setCoaches(userdata?.coaches)
        }
      }
    })
  }
  const CoachNames = () => {
    return (
      <View style={{ flexDirection: "row" }}>
        {coaches?.map((i, j) => (<Text key={j.toString()} maxFontSizeMultiplier={1} style={[styles.name, { fontSize: 12 }]}>{i?.coachName}{j == 0 && ", "}</Text>))}
      </View>
    )
  }

  return (
    <View style={styles.mainView}>
      <Pressable onPress={onBackPress} style={{ width: "8%" }}>
        <FastImage source={images.dropleft} resizeMode="contain" style={styles.backIcon} />
      </Pressable>
      <View style={[styles.middleView, { width: "65%", overflow: "hidden" }]}>
        <FastImage source={{ uri: mediaurl(userdata?.profilePic) }} resizeMode="cover" style={styles.image} />
        <View style={{ marginLeft: wp(2), flex: 1 }}>
          <Text maxFontSizeMultiplier={1.4} style={[styles.name]}>{userdata?.name || userdata?.fname}{!isAthlete && " '" + gradYear?.substring(2)}</Text>
          {isAthlete && <CoachNames />}
          <View style={styles.onlineView}>
            <View style={[styles.active, !active && { backgroundColor: colors.grey }]} />
            <Text maxFontSizeMultiplier={1.4} style={styles.online}>{active ? localization?.appkeys?.Online : localization?.appkeys?.Offline}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightView}>
        <Pressable onPress={onVoiceCallPress}>
          <FastImage
            source={images.voiceCall}
            style={styles.callIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable onPress={onVideoCallPress}>
          <FastImage
            source={images.videoCall}
            style={styles.callIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatHeader;

const UseStyles = (colors) =>
  StyleSheet.create({
    backIcon: { height: 28, width: 26 },
    callIcon: { height: 38, width: 38 },
    rightView: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "26%",
      height: "100%",
    },
    onlineView: { flexDirection: "row", alignItems: "center" },
    middleView: { width: "60%", flexDirection: "row", alignItems: "center" },
    online: {
      fontFamily: AppFonts.Regular,
      fontSize: 11,
      color: colors.black,
      marginLeft: wp(1),
    },
    active: {
      height: 8,
      width: 8,
      backgroundColor: "lightgreen",
      borderRadius: 100,
    },
    name: {
      fontFamily: AppFonts.Medium,
      fontSize: 16,
      color: colors.black,
    },
    image: {
      height: wp(14),
      width: wp(14),
      borderRadius: wp(14),
      borderWidth: 2,
      borderColor: colors.primary
    },
    mainView: {
      paddingVertical: 8,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
    },
  });
