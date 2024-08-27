import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useState } from 'react'
import { hp, wp } from '../../utils/dimension'
import { useTheme } from '@react-navigation/native'
import AppFonts from '../../constants/fonts'

const InterestBlock = ({ item, arr = [], onPress }) => {
    // const [like, setLike] = useState(false)
    const { colors } = useTheme();
    const like = arr.includes(item)
    return (
        <Pressable onPress={() => {
            // setLike(!like) 
            onPress()
        }}
            style={[styles.main, { borderColor: colors.primary, backgroundColor: like ? colors.primary : colors.white }]}>
            <Text maxFontSizeMultiplier={1.2} style={[styles.text, { color: like ? colors.white : colors.text }]}>{item}</Text>
        </Pressable>
    )
}

export default InterestBlock;

const styles = StyleSheet.create({
    main: {
        margin: hp(1),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: .3,
        borderRadius: 10,
        paddingVertical: hp(1),
        paddingHorizontal: wp(4)
    },
    text: {
        fontSize: 14,
        fontFamily: AppFonts?.Regular
    },
}
)