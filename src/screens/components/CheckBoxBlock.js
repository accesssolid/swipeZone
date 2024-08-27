import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';

const CheckBoxBlock = ({ txt, arr, onPress, styleMain }) => {
    const { colors } = useTheme();
    return (
        <View style={[{ flexDirection: "row", alignItems: "center", marginHorizontal: 18, marginVertical: 16 }, styleMain]}>
            <Pressable style={{ height: 20, width: 20, borderRadius: 16, padding: 2, borderWidth: 1, borderColor: colors.primary }}
                onPress={() => { onPress(txt) }}
            >
                {arr?.includes(txt) && <View style={{ height: "100%", width: "100%", borderRadius: 16, backgroundColor: colors.primary }} />}
            </Pressable>
            <Text onPress={() => { onPress(txt) }} style={{ fontFamily: AppFonts.Medium, marginLeft: 8, color: colors.text }}>{txt}</Text>
        </View>
    )
}

export default CheckBoxBlock

const styles = StyleSheet.create({})