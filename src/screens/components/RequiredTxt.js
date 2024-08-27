import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native';

const RequiredTxt = ({ txt, txtStyle, styleMain }) => {
    const { colors, images } = useTheme();
    return (
        <View style={[{ flexDirection: "row" }, styleMain]}>
            <Text style={txtStyle}>{txt}</Text>
            {/* <Image source={images.star} style={{ height: 8, width: 8, resizeMode: "contain", marginLeft: 4 }} /> */}
        </View>
    )
}

export default RequiredTxt

const styles = StyleSheet.create({})