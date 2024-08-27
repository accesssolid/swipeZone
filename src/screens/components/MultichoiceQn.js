import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import RequiredTxt from './RequiredTxt'
import AppFonts from '../../constants/fonts'
import { useTheme } from '@react-navigation/native'

const MultichoiceQn = ({ list, value, onChange, required, hideQuestion }) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    const changeVal = (data) => {
        onChange(data?.value)
    }

    return (
        <View>
            {hideQuestion ?
                <></>
                :
                required ?
                    <>
                        <Text style={[styles.placeTxt, { marginTop: 10 }]}>{"Are you a High School Athlete or a College"}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.placeTxt, { margin: 0 }]}>{"Transfer Athlete?"}</Text>
                            <Image source={images.star} style={{ height: 8, width: 8, resizeMode: "contain", marginLeft: 4 }} />
                        </View>
                    </>
                    :
                    <Text style={[styles.placeTxt]}>{`Are you a High School Athlete or a College\nTransfer Athlete?`}</Text>
            }
            <View style={{ flexDirection: "row", marginVertical: 8 }}>
                {list?.map((i, j) => {
                    let isSelected = value == i?.value
                    return (
                        <Pressable onPress={() => { changeVal(i) }} key={i?.value} style={{ flexDirection: "row", alignItems: "center", marginLeft: 18, marginRight: 8 }}>
                            <TouchableOpacity onPress={() => { changeVal(i) }} style={{ height: 18, width: 18, borderRadius: 26, borderWidth: 2, borderColor: colors.primary, justifyContent: "center", alignItems: "center" }}>
                                {isSelected && <View style={{ height: "70%", width: "70%", borderRadius: 100, backgroundColor: colors.primary }} />}
                            </TouchableOpacity>
                            <Text style={styles.displayTxt}>{i?.label}</Text>
                        </Pressable>
                    )
                })}
            </View>
        </View >
    )
}

export default MultichoiceQn

const useStyles = (colors) => StyleSheet.create({
    placeTxt: {
        margin: 18,
        marginBottom: 4,
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        marginLeft: 22,
        lineHeight: 18
    },
    displayTxt: {
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        marginLeft: 6
    },
})