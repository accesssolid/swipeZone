import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { hp, wp } from "../../utils/dimension";
import FastImage from "react-native-fast-image";
import AppFonts from "../../constants/fonts";
import { mediaurl } from "../../utils/mediarender";
import moment from "moment";
import { useSelector } from "react-redux";

const ChatBlock = ({ item, index, onPress }) => {
  const isAthlete = useSelector(state => state?.userData?.isAthlete)

  const { colors, images } = useTheme();
  const styles = UseStyles(colors);
  const time = moment.unix(item?.lastMessage?.createdAt?.seconds);

  return (
    <Pressable onPress={onPress} style={styles.mainView}>
      <View style={styles.innerView}>
        <FastImage source={{ uri: mediaurl(item?.user?.profilePic) }} resizeMode='cover' style={styles.image} />
      </View>
      <View style={styles.middleView}>
        <Text style={styles.name}>{item?.user?.name}{!isAthlete && "' " + item?.gradYear?.substring(2)}</Text>
        {isAthlete && <Text style={[styles.name, { fontSize: 11 }]}>{item?.coaches[0]?.coachName}{", "}{item?.coaches[1]?.coachName}</Text>}
        <Text style={styles.msg} numberOfLines={1}>{item?.lastMessage?.text}</Text>
      </View>
      <View style={[styles.innerView, { height: 60, justifyContent: 'flex-start', alignItems: 'center' }]}>
        <Text maxFontSizeMultiplier={1.3} style={styles.time}>{moment(time).format("hh:mm a")}</Text>
        {item?.unreadCount != 0 &&
          <View style={styles.unreadBlock}>
            <Text style={styles.unreadTxt}>{item?.unreadCount}</Text>
          </View>
        }
      </View>
    </Pressable>
  );
};

export default ChatBlock;

const UseStyles = (colors) => StyleSheet.create({
  unreadTxt: {
    color: colors.white,
    fontFamily: AppFonts.Medium,
    fontSize: 14,
  },
  unreadBlock: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    height: 24,
    width: 24,
    borderRadius: 18,
    alignSelf: "center",
    marginTop: 4
  },
  msg: {
    fontFamily: AppFonts.Regular,
    fontSize: 12,
    color: colors.text,
  },
  time: {
    fontFamily: AppFonts.MediumIta,
    color: colors?.grey,
    fontSize: 12,
  },
  middleView: {
    width: "53%",
  },
  image: {
    height: wp(18),
    width: wp(18),
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary
  },
  name: {
    fontFamily: AppFonts.Medium,
    fontSize: 14,
    color: colors.text,
  },
  innerView: {
    width: "21%", alignItems: "flex-end",
  },
  mainView: {
    paddingVertical: 6,
    width: "95%",
    alignSelf: 'center',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
});
