import { useTheme } from "@react-navigation/native";
import React from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";

export default function SolidView({ viewStyle, view, threeicon = false, back, logo, onPressLeft, title, onPresssetting, onPressFilter, hideHeader = false }) {
  const { colors, images } = useTheme();
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {!hideHeader && <Header threeicon={threeicon} back={back} logo={logo} onPressLeft={onPressLeft} title={title} onPresssetting={onPresssetting} onPressFilter={onPressFilter} />}
        <ImageBackground source={images.orangegrad} style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform?.OS == "ios" ? "padding" : null} keyboardVerticalOffset={100} style={[style.parent, viewStyle]}>
            {view}
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const style = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: "#2F2F2F00"
  },
});
