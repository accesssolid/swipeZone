import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import AppFonts from "../../constants/fonts";

export default function CustomBtn({ btnStyle, txtStyle, titleTxt, onPress }) {
  const { colors } = useTheme();
  const style = useStyles(colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[style.btn, btnStyle]}
    >
      <Text style={[style.btntxt, txtStyle]}>{titleTxt}</Text>
    </TouchableOpacity>
  );
}

const useStyles = (colors) => StyleSheet.create({
  btn: {
    justifyContent: "center",
    alignItems: "center",
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
