import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image'
import { useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import { hp, wp } from '../../utils/dimension';

const SettingSubview = ({ logo, onPress, logotitle, title, arrow, arrowiconstyle, notifications }) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors, logo);

    const [Switchon, setSwitchon] = useState(true)
    return (
        <Pressable onPress={onPress}
            style={styles.main}>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                {logo && <View style={styles.logoview}>
                    <FastImage source={images?.logocolor}
                        style={styles.logo}
                        resizeMode='contain' />
                </View>}
                {logo && <Text style={styles.logotitle}>{logotitle}</Text>}
                {!logo && <Text style={styles.title}>{title}</Text>}
            </View>

            <FastImage source={arrow}
                style={[styles.backlcon, arrowiconstyle]}
                resizeMode='contain' />

            {notifications &&
                <Pressable
                    onPress={() => {
                        setSwitchon(!Switchon)
                    }}
                >
                    {Switchon ?
                        <FastImage source={images?.Onbtn}
                            style={[styles.backlcon, arrowiconstyle]}
                            resizeMode='contain' />
                        :
                        <FastImage source={images?.Offbtn}
                            style={[styles.backlcon, arrowiconstyle]}
                            resizeMode='contain' />
                    }
                </Pressable>
            }

        </Pressable>
    )
}

export default SettingSubview

const useStyles = (colors, logo) => StyleSheet.create({
    main: {
        width: wp(90),
        minHeight: 48,
        backgroundColor: logo == true ? colors.fade : colors.white,
        marginVertical: logo == true ? 18 : 8,
        marginHorizontal: 22,
        padding: 4,
        paddingVertical: logo == false ? 20 : 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 9,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
    },
    logoview: {
        width: wp(14),
        height: wp(14),
        backgroundColor: colors?.white,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginHorizontal: 5,
        borderRadius: 10
    },
    logo: {
        width: wp(10),
        height: wp(10),
    },
    logotitle: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 14,
        color: colors?.text,
        marginHorizontal: 3
    },
    title: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors?.text,
        marginHorizontal: 6
    },
    backlcon: {
        width: wp(3),
        height: wp(3), marginRight: wp(1),
    },

})