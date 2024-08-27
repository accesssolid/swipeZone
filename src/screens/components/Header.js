import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation, useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useSelector } from 'react-redux';
import { szsResources } from '../../utils/SubscriptionCheck';

const Header = ({ title, threeicon, logo, back, onPressLeft, onPresssetting, onPressFilter, backbtnstyle }) => {
    const { colors, images } = useTheme();
    const navigation = useNavigation()
    const isAthlete = useSelector(state => state?.userData?.isAthlete)

    return (
        <View style={[{ backgroundColor: colors.background, minHeight: 60, maxHeight: 90, paddingHorizontal: 18, flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }, styles.shadow]}>
            <Pressable
                onPress={onPressLeft}
                style={{ width: "20%" }}
            >
                {logo && <FastImage source={images.sr} style={{ height: 28, width: 66 }} resizeMode='contain' />}
                {back && <FastImage source={images.dropleft} style={[styles.backbuttonstyle, backbtnstyle]} resizeMode='contain' />}
            </Pressable>
            {!threeicon && <View style={{ width: threeicon ? isAthlete ? "50%" : "45%" : "60%", alignItems: 'center' }}>
                <Text maxFontSizeMultiplier={1.3} style={{ color: colors.text, fontFamily: AppFonts.SemiBold, fontSize: 20 }}>{title}</Text>
            </View>}
            {threeicon ?
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    {!isAthlete && <TouchableOpacity onPress={onPressFilter}>
                        <FastImage source={images.filter} style={styles.headericon} resizeMode='contain' />
                    </TouchableOpacity>}
                    {isAthlete && <Pressable onPress={() => {
                        // if (isAthlete && !szsResources()) {
                        //     navigation?.navigate(AppRoutes.Subscription)
                        //     return
                        // }
                        navigation.navigate(AppRoutes?.PrivacyPolicy, { from: "recuriting" })
                    }}>
                        <FastImage source={images.bulb} style={styles.headericon} resizeMode='contain' />
                    </Pressable>}
                    <Pressable onPress={() => navigation.navigate(AppRoutes.Favorites)}>
                        <FastImage source={images.fav} style={styles.headericon} resizeMode='contain' />
                    </Pressable>
                    <Pressable onPress={onPresssetting}>
                        <FastImage source={images.settings} style={styles.headericon} resizeMode='contain' />
                    </Pressable>
                    <NotiBlock />
                </View >
                :
                <View style={{ width: "20%" }}>
                </View>
            }
        </View >
    )
}

export default Header

const NotiBlock = () => {
    const { colors, images } = useTheme();
    const navigation = useNavigation();
    const notifications = useSelector(state => state?.notification)?.list
    const notiCount = notifications.filter(x => x?.seen === false)
    return (
        <Pressable onPress={() => navigation.navigate(AppRoutes.NotificationsList)}>
            {notiCount?.length > 0 && <View style={{ backgroundColor: colors.red, height: 16, width: 16, justifyContent: "center", alignItems: "center", borderRadius: 16, position: "absolute", right: 6, top: -6, zIndex: 1 }}>
                <Text style={{ fontSize: 12, color: colors.white, fontFamily: AppFonts.Medium }}>{notiCount?.length}</Text>
            </View>}
            <FastImage source={notifications.some(x => x?.seen === false) ? images.bell : images.bellnodot} style={styles.headericon} resizeMode='contain' />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    backbuttonstyle: {
        height: 28,
        width: 26,
    },
    headericon: {
        height: 22,
        width: 24,
        marginRight: 12,
    },
    shadow: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 2,
        shadowOpacity: 0.2,

        elevation: 1
    },
})