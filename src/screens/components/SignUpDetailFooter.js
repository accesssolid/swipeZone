import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { hp, wp } from '../../utils/dimension'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { NextBtn } from '../auth/Intro';
import AppFonts from '../../constants/fonts';

const SignUpDetailFooter = ({ styleMain, onPressBack, onPressNext, progress, styleNextBtn, styleSkipBtn, t1 }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    return (
        <View style={[{ backgroundColor: "#FFF0E9", height: 100 }, styleMain]}>
            <View style={{ width: "100%", backgroundColor: "#FFE2D3", height: "6%" }}>
                <View style={{ width: progress ?? "40%", backgroundColor: colors.primary, height: "100%", borderRadius: 4 }} />
            </View>
            <View style={{ height: "80%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: wp(8) }}>
                <Pressable
                    style={[{ backgroundColor: colors.primary, minHeight: 52, width: wp(30), justifyContent: "center", alignItems: "center", flexDirection: "row", alignItems: "center", borderRadius: 40 }, styleSkipBtn]}
                    onPress={onPressBack}
                >
                    <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Bold }}>{t1 ? t1 : appkeys.Back}</Text>
                </Pressable>
                <NextBtn onPress={onPressNext} styleNextBtn={styleNextBtn} />
            </View>
        </View>
    )
}

export default SignUpDetailFooter

const styles = StyleSheet.create({})