import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { hp, wp } from "../../utils/dimension";
import AppFonts from "../../constants/fonts";
import { scaledValue } from "../../utils/designUtils";
import { useNavigation, useTheme } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import { localization } from "../../localization/localization";
import MediaOptModal from "../modals/MediaOptModal";
import checkIsSubScribedStill from "../../utils/checkIsSubScribedStill";
import AppRoutes from "../../routes/RouteKeys/appRoutes";
import { useSelector } from "react-redux";

const ChatInput = (props) => {
  const { colors, images } = useTheme();
  const styles = UseStyles(colors);
  const [optModal, setOptModal] = useState(false)
  const navigation=useNavigation()
  const isAthlete = useSelector(state => state?.userData?.isAthlete)

  return (
    <View style={[styles.mainContainer, styles.shadow]}>
      <MediaOptModal
        visible={optModal}
        pressHandler={() => { setOptModal(false) }}
        mediaSelected={(type) => {
          props.onPressAttach(type)
        }}
      />
      <TextInput
        value={props.val}
        onChangeText={props.onChangeText}
        style={{ width: wp(68), height: "100%", fontFamily: AppFonts.Regular, fontSize: 13, color: colors.black, paddingTop: Platform?.OS == "ios" ? 20 : 10 }}
        placeholder={localization.appkeys.message}
        placeholderTextColor={colors.black}
        multiline={true}
      />
      <View style={{ width: Platform?.OS == "ios" ? wp(21) : wp(24), flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
        {!props?.editMode ? <TouchableOpacity onPress={() => {
          if(isAthlete&&!checkIsSubScribedStill()){
            navigation.navigate(AppRoutes.Subscription)
            return
          }
          setOptModal(true)
        }}>
          <FastImage
            source={images.attach}
            style={styles.send}
            resizeMode="contain"
          />
        </TouchableOpacity>
          :
          <TouchableOpacity onPress={() => {
            props.onPressCancel()
          }}>
            <FastImage
              source={images.cancelchat}
              style={styles.send}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
        <TouchableOpacity onPress={props.onPressSend}>
          <FastImage
            source={images.send}
            style={styles.send}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;

const UseStyles = (colors) => StyleSheet.create({
  mainContainer: {
    height: hp(7),
    backgroundColor: colors.background,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingRight: 16
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -0.8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 7,
  },
  send: { height: 36, width: 36 },
  callIcon: { height: 38, width: 38 },
});
