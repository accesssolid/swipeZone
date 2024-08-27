import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';

const BtnSocialAuth = ({ onPress, styleBtn, styleTxt, type }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const isApple = type == "apple"
    const title = isApple ? appkeys?.SignInApple : appkeys?.SignInGoogle
    const styles = useStyles(colors);
    return (
        <Pressable
            style={[styles.socialauthBtn, !isApple && { backgroundColor: colors.white }, styles.shadow, styleBtn]}
            onPress={onPress}
        >
            <FastImage source={isApple ? images.apple : images.google} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.socialBTxt, !isApple && { color: colors.text }, styleTxt]}>{title}</Text>
        </Pressable>
    )
}

export default BtnSocialAuth

const useStyles = (colors) => StyleSheet.create({
    socialauthBtn: {
        flexDirection: "row", justifyContent: "center", alignItems: "center",
        alignSelf: "center",
        backgroundColor: colors.text,
        height: 52, width: "80%",
        borderRadius: 40,
        marginTop: 20
    },
    logo: {
        height: 18, width: 16, marginRight: 8
    },
    socialBTxt: {
        fontSize: 14, fontFamily: AppFonts.Medium, color: colors.white
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
})