import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { useTheme } from '@react-navigation/native';
import SolidView from '../components/SolidView';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import { LocalizationContext } from '../../localization/localization';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { mediaurl } from '../../utils/mediarender';
import { useSelector } from 'react-redux';

const Recruited = ({ navigation, route }) => {
    const { data } = route?.params || {}
    const user = useSelector(state => state?.userData?.user)

    const { colors, images } = useTheme();
    const styles = useStyles(colors)
    const { localization } = useContext(LocalizationContext);

    return (
        <SolidView
            threeicon={true}
            logo={true}
            onPresssetting={() => {
                navigation?.navigate(AppRoutes?.Settings)
            }}
            view={
                <View>
                    <FastImage source={images.GetRecruited} style={styles.getrecruited} resizeMode='contain' />
                    <Text style={styles.convostart}>{localization?.appkeys?.Startaconversation}</Text>
                    <View style={styles.imagescontainer}>
                        <View style={styles.imgMain}>
                            <FastImage source={{ uri: mediaurl(data?.by?.profilePic) }} style={styles.img} resizeMode='cover' />
                        </View>
                        <View style={[styles.imgMain, { marginLeft: -wp(5) }]}>
                            <FastImage source={{ uri: mediaurl(data?.to?.profilePic) }} style={styles.img} resizeMode='cover' />
                        </View>
                    </View>
                    <CustomBtn
                        btnStyle={styles.btn}
                        txtStyle={styles.btntxt}
                        titleTxt={localization?.appkeys?.Comesayhi}
                        onPress={() => {
                            if (data?.by?._id == user?._id) {
                                navigation.navigate(AppRoutes.InnerChat, { otherUserData: data?.to })
                            } else {
                                navigation.navigate(AppRoutes.InnerChat, { otherUserData: data?.by })
                            }
                        }}
                    />
                    <CustomBtn
                        titleTxt={localization?.appkeys?.KeepSwiping}
                        onPress={() => {
                            navigation.goBack()
                        }}
                    />
                </View >
            }
        />
    );
}

export default Recruited

const useStyles = (colors) => StyleSheet.create({
    imagescontainer: {
        flexDirection: 'row',
        marginVertical: hp(6),
        alignSelf: "center",
    },
    convostart: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
        marginTop: hp(1)
    },
    getrecruited: {
        width: wp(70),
        height: hp(6),
        maxHeight: 160,
        marginTop: hp(6),
        alignSelf: "center",
    },
    img: {
        width: "100%",
        height: "100%",
        borderRadius: 100,
    },
    imgMain: {
        width: wp(47),
        height: wp(47),
        borderRadius: 100,
        borderWidth: 4,
        borderColor: colors.primary,
    },
    btn: {
        backgroundColor: colors.recruitedcolor,
        borderWidth: 2,
        borderColor: colors.primary,
        marginTop: hp(5)
    },
    btntxt: {
        color: colors.text,
    },
})