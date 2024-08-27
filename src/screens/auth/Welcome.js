import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Text, ImageBackground, Platform } from "react-native";
import { LocalizationContext } from "../../localization/localization";
import AppRoutes from "../../routes/RouteKeys/appRoutes";
import { hp, wp } from "../../utils/dimension";
import FastImage from "react-native-fast-image";
import AppFonts from "../../constants/fonts";
import CustomBtn from "../components/CustomBtn";
import AppUtils from "../../utils/appUtils";
import userAnalytics, { USEREVENTS } from "../../utils/userAnalytics";

function Welcome({ navigation }) {
  const { localization } = useContext(LocalizationContext);
  const { colors, images } = useTheme();
  const style = useStyles(colors);

  useEffect(() => {
    if (Platform?.OS == "android") {
      AppUtils.getAndroidLibPermission()
    }
  }, [])

  return (
    <FastImage style={style.parent} source={images.welcome}>
      <FastImage style={[style.parent, { justifyContent: "space-between" }]} source={images.darkgrad}>
        <FastImage source={images.logo} style={{ height: hp(10), width: wp(40), alignSelf: "center", marginTop: hp(6) }} resizeMode="contain" />
        <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: hp(10) }}>
          <Text style={[style.title, { width: "80%", alignSelf: "center" }]}>{localization?.appkeys?.welcomeheading}!</Text>
          <Text style={[style.desc]}>Recruiting Done Right!</Text>
          <CustomBtn titleTxt={localization?.appkeys?.Login}
            onPress={() => {
              navigation.navigate(AppRoutes.Login)
            }}
          />
          <CustomBtn titleTxt={localization?.appkeys?.SignUp}
            btnStyle={{
              backgroundColor: 'rgba(254, 111, 39, 0.2)',
              borderWidth: 2,
              borderColor: colors.white
            }}
            onPress={() => {
              userAnalytics(USEREVENTS.onboardStarted, { user: "",platform: Platform.OS })
              navigation.navigate(AppRoutes.SignUpOpt)
            }}
          />
        </View>
      </FastImage>
    </FastImage>
  );
}

const useStyles = (colors) => StyleSheet.create({
  parent: {
    flex: 1,
  },
  title: {
    fontFamily: AppFonts.SemiBold,
    fontSize: 25,
    color: colors.white,
    textAlign: "center",
  },
  desc: {
    fontFamily: AppFonts.SemiBoldIta,
    fontSize: 14,
    color: colors.white,
    marginTop: 8,
    textAlign: "center",
    width: "80%",
    alignSelf: 'center'
  }
});

export default Welcome;
