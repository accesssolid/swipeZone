import { View, Text, TextInput, Image, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import { hp } from '../../utils/dimension';
import RequiredTxt from './RequiredTxt';

const CustomInput = ({ value, onChangeText, img, txt, secure, styleMain, place, isRequiredTxt = false, textInputProps, placespecific, countrycode, hasCountryCode, onPressCountry, styleImg, onPressRight, styletextinput, credSuggestions = [], credSelected }) => {
    const { colors, images } = useTheme();
    const [focused, setFocused] = useState(false)
    const [sec, setSec] = useState(secure)

    return (
        <View style={[styles.mainView, styleMain]}>
            {!isRequiredTxt ?
                <Text style={{ marginBottom: 8, fontSize: 12, color: colors.text, fontFamily: AppFonts.SemiBold, marginLeft: 4 }}>{place}</Text>
                :
                <RequiredTxt txt={place} txtStyle={{ marginBottom: 8, fontSize: 12, color: colors.text, fontFamily: AppFonts.SemiBold, marginLeft: 4 }} />
            }
            <View style={[{ flexDirection: "row", borderRadius: 10, borderWidth: 1, borderColor: focused ? colors.primary : colors.white, backgroundColor: colors.white }, styles.shadow]}>
                {hasCountryCode &&
                    <TouchableOpacity style={{ width: "14%", borderRightWidth: 0.8, borderColor: colors.primary, justifyContent: "center", alignItems: "center" }}
                        onPress={onPressCountry}
                    >
                        <Text style={{ fontFamily: AppFonts.semiB, fontSize: 14, color: colors.text }}>{countrycode}</Text>
                    </TouchableOpacity>
                }
                <TextInput
                    placeholder={placespecific ? placespecific : place}
                    placeholderTextColor={colors.grey}
                    value={value}
                    onChangeText={onChangeText}
                    style={[{ width: (!img && !secure && !txt) ? "100%" : (img && hasCountryCode) ? "75%" : "90%", paddingLeft: 16, fontFamily: AppFonts.Regular, fontSize: 14, height: 52, color: colors.inputtext }, styletextinput]}
                    secureTextEntry={sec}
                    onFocus={() => { setFocused(true) }}
                    onBlur={() => { setFocused(false) }}
                    {...textInputProps}
                />
                {secure != true ?
                    txt ?
                        <Pressable style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
                            onPress={onPressRight}
                        >
                            <Text style={[{ fontFamily: AppFonts.Medium, fontSize: 10, color: colors.primary }]}>{txt}</Text>
                        </Pressable>
                        :
                        img ?
                            <Pressable style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
                                onPress={onPressRight}
                            >
                                <Image source={img} style={[{ height: 16, width: 16, resizeMode: "contain" }, styleImg]} />
                            </Pressable>
                            :
                            <View />
                    :
                    <TouchableOpacity
                        style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
                        onPress={() => { setSec(!sec) }}
                    >
                        <Image source={!sec ? images.eye : images.eyeoff} style={{ height: 16, width: 16, resizeMode: "contain" }} />
                    </TouchableOpacity>
                }
            </View>
            {credSuggestions?.map((i, j) => {
                return (
                    <Pressable key={j} onPress={() => credSelected(i)} style={{ backgroundColor: colors.background, padding: 16, borderRadius: 4, marginTop: 4, borderWidth: 1, borderColor: colors.primary }}>
                        <Text style={{ fontSize: 12, color: colors.text, fontFamily: AppFonts.Medium }}>{i?.email}</Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

export default CustomInput

const styles = StyleSheet.create({
    mainView: { marginHorizontal: 18, marginTop: 20 },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    }
})