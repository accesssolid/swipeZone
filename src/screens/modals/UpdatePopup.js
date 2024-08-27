import { useTheme } from "@react-navigation/native";
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AppFonts from "../../constants/fonts";

function UpdatePopup({ isVisible, onBackDropPress }) {
  const { colors } = useTheme();
  const style = useStyles(colors);
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      style={{ borderWidth: 1, flex: 1 }}
    >
      <View style={style.parent}>
        <View style={style.popup}>
          <View style={{ width: "90%", height: "90%", }}>
            <Text style={style.txtStyle}>{"Update your app"}</Text>
            <Text style={[style.txtStyle, { fontFamily: AppFonts.Medium, fontSize: 16 }]}>{"To enjoy our newest features tap button below"}</Text>
            <TouchableOpacity style={[style.btnStyle,]} onPress={() => onBackDropPress()}>
              <Text style={style.btnTxt}>{"Update Now"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default UpdatePopup;

const useStyles = (colors) => StyleSheet.create({
  parent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    width: "85%",
    backgroundColor: "white",
    maxHeight: 260,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtStyle: {
    alignSelf: "center",
    fontSize: 18,
    textAlign: "center",
    color: colors.text,
    lineHeight: 25,
    marginTop: 20,
    marginHorizontal: 20,
    fontFamily: AppFonts.Bold
  },
  btnStyle: {
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnTxt: {
    alignSelf: "center",
    fontSize: 16,
    textAlign: "center",
    color: "white",
    fontFamily: AppFonts.Medium
  },
});
