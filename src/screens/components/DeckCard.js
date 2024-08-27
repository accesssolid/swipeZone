import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";

import { useTheme } from "@react-navigation/native";
import { hp, wp } from "../../utils/dimension";
import { scaledValue } from "../../utils/designUtils";
import AppFonts from "../../constants/fonts";
import { localization } from "../../localization/localization";
import Intrest from "./Intrest";
import TextProfile from "./TextProfile";

const DeckCard = ({ intrest }) => {
  const { images, colors } = useTheme();
  const styles = UseStyles(colors);

  return (
    <View style={styles.deck}>
      <ImageBackground
        blurRadius={10}
        source={require("../../assets/dummyBigGirl.png")}
        style={styles.img}
      >
        <View style={styles.topView}>
          <View style={styles.leftView}>
            <Image source={images.Locationpic} style={styles.location} />
            <Text maxFontSizeMultiplier={1} style={styles.textSmall}>1 km</Text>
          </View>
          <View style={styles.leftView}>
            <Image source={images.redHeart} style={styles.location} />
          </View>
        </View>
        <Text maxFontSizeMultiplier={1} style={styles.name1}>Emma Parker,23</Text>
        <Text maxFontSizeMultiplier={1} style={styles.job}>Lawer</Text>

        <Text maxFontSizeMultiplier={1} style={styles.intrest}>{localization.appkeys.myIntrest}</Text>
        <View style={styles.flatlistStyle}>{intrest}</View>
        <Text maxFontSizeMultiplier={1} style={styles.intrest}>{localization.appkeys.aboutme}</Text>
        <View style={styles.bottomView}>
          <Text maxFontSizeMultiplier={1} style={styles.blocktext}>
            "My name is Ash and I enjoy meinnce. I enjoy reading. Lorem ipsum
            dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
            eirmodt, sed diam voluptua.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default DeckCard;

const UseStyles = (colors) =>
  StyleSheet.create({
    bottomView: {
      width: "90%",
      alignSelf: "center",
      paddingVertical: hp(1),
      // backgroundColor: "rgba(0,0,0,0.2)",
      backgroundColor: colors.background,
      alignItems: "center",
      borderRadius: 8,
      marginTop: hp(0.8),
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    blocktext: {
      color: colors.black,
      fontFamily: AppFonts.Medium,
      fontSize: 14,
      padding: 6,
      lineHeight: 20,
    },
    intrest: {
      fontFamily: AppFonts.Medium,
      color: colors.background,
      fontSize: 16,
      alignSelf: "center",
      marginTop: hp(2),
    },
    job: {
      fontFamily: AppFonts.Regular,
      color: colors.background,
      fontSize: 15,
      alignSelf: "center",
    },
    name1: {
      marginTop: hp(10),
      fontFamily: AppFonts.SemiBold,
      color: colors.background,
      fontSize: 24,
      alignSelf: "center",
      textAlign: 'center'
    },
    deck: {
      width: 390,
      height: Platform.OS == "ios" ? "80%" : "89%",
      borderRadius: 15,
      marginTop: 20,
      overflow: "hidden",
    },
    img: {
      flex: 1,
    },
    topView: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 6,
    },
    leftView: {
      paddingHorizontal: wp(2),
      minHeight: 38,
      minWidth: 50,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 5,
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    icon: {
      height: 40,
      width: 80,
      borderRadius: 5,
      marginTop: 6,
      resizeMode: "cover",
    },
    location: {
      tintColor: "white",
      height: 18,
      width: 18,
      resizeMode: "contain",
    },
    textSmall: {
      marginTop: 5,
      color: "white",
      fontFamily: AppFonts.Mediumedium,
      fontSize: 14,
    },
    flatlistStyle: {
      width: "80%",
      alignSelf: "center",
      marginTop: "1%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
    },
  });
