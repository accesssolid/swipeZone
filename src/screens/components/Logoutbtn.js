import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import { hp, wp } from "../../utils/dimension";
import AppFonts from "../../constants/fonts";

export default function Logoutbtn({ btnStyle, txtStyle, titleTxt, onPress }) {
  const { colors, images } = useTheme();
  const style = useStyles(colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[style.btn, btnStyle]}
    >
      <FastImage source={images?.Logouticon} resizeMode="contain"
        style={{ width: wp(5), height: wp(5), marginHorizontal: 5, transform: [{ rotate: '180deg' }] }}
      />
      <Text style={[style.btntxt, txtStyle]}>{titleTxt}</Text>
    </TouchableOpacity>
  );
}

const useStyles = (colors) => StyleSheet.create({
  btn: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
    width: "80%",
    alignSelf: "center",
    padding: 18,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: colors.primary
  },
  btntxt: {
    fontSize: 16,
    color: colors.white,
    fontFamily: AppFonts.Medium
  },
});
