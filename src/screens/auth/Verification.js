import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import AppFonts from '../../constants/fonts';
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { hp, wp } from '../../utils/dimension';
import AuthContainer from '../components/AuthContainer';
import FastImage from 'react-native-fast-image';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/Reducers/load';

const Verification = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { email } = route?.params ?? ""
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [otp, setOtp] = useState("")

    const submit = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.verifyotp, "post", { email, otp })
            if (!res?.err) {
                navigation.navigate(AppRoutes.NewPassword, { token: res?.data?.token })
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resendOtp = async () => {
        setOtp("")
        if (email == "") {
            AppUtils.showToast("Something went wrong.")
            return
        }
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.forgotpassword, "post", { email })
            if (!res?.err) {
                AppUtils.showToast("OTP resent successfully.")
            } else {
                AppUtils.showToast(res?.msg ?? "Something went wrong.")
            }
        } catch (e) {
            AppUtils.showLog(e)
        } finally {
            setTimeout(() => {
                dispatch(setLoading(false))
            }, 200);
        }
    }

    return (
        <AuthContainer
            children={
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: hp(2), marginHorizontal: 18 }}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }}>
                            <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                        </Pressable>
                        <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                        <View style={styles.left} />
                    </View>
                    <Text style={[styles.semibTxt, styles.tac, { marginTop: 20 }]}>{appkeys.Verification}</Text>
                    <Text style={[styles.medTxt, styles.tac, { marginTop: 18, width: "80%", alignSelf: "center" }]}>{`${appkeys.codesent} ${email}`}</Text>
                    <View style={{ height: 18 }} />
                    <CustomInput
                        placespecific={"----"}
                        place={appkeys.Enterotp}
                        textInputProps={{
                            keyboardType: "numeric",
                            maxLength: 4
                        }}
                        value={otp}
                        onChangeText={(t) => setOtp(t)}
                    />
                    <View style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                        <Text style={[styles.medTxt, { fontSize: 12, fontFamily: AppFonts.Regular }]}>{appkeys.Didntreceivecode}</Text>
                        <Text style={[styles.semibItaTxt]}
                            onPress={resendOtp}
                        >{appkeys.Resend}</Text>
                    </View>
                    <View style={{ height: hp(20) }} />
                    <CustomBtn
                        titleTxt={appkeys.VerifynContinue}
                        onPress={() => { submit() }}
                    />
                </View>
            }
        />
    )
}

export default Verification

const useStyles = (colors) => StyleSheet.create({
    left: {
        height: 24,
        width: 24,
    },
    logo: {
        height: hp(8),
        width: wp(30),
        alignSelf: "center",
    },
    tac: {
        textAlign: "center"
    },
    medTxt: {
        color: colors.text,
        fontSize: 14,
        fontFamily: AppFonts.Medium,
        lineHeight: 22
    },
    semibTxt: {
        color: colors.text,
        fontSize: 24,
        fontFamily: AppFonts.SemiBold,
    },
    semibItaTxt: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: AppFonts.SemiBoldIta,
    },
})