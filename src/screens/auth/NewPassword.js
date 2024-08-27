import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import FastImage from 'react-native-fast-image';
import AuthContainer from '../components/AuthContainer';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import PasswordResetModal from '../modals/PasswordResetModal';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/Reducers/load';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';

const NewPassword = ({ navigation, route }) => {
    const { token } = route?.params
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [showResetModal, setShowResetModal] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmpass, setConfirmpass] = useState("")

    const submit = async () => {
        if (password.trim() == "") {
            AppUtils.showToast("Password is required.")
            return
        }
        if (password.length < 8) {
            AppUtils.showToast("Password must be atleast 8 characters long.")
            return
        }
        if (password != confirmpass) {
            AppUtils.showToast("Passwords does not match.")
            return
        }
        try {
            dispatch(setLoading(true))
            let res = await hit(`${endpoints.resetpassword}?token=${token}`, "post", { password })
            if (!res?.err) {
                setTimeout(() => {
                    setShowResetModal(true)
                }, 400);
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <AuthContainer
            children={
                <View style={{ flex: 1 }}>
                    <PasswordResetModal vis={showResetModal}
                        onDone={() => {
                            setShowResetModal(false)
                            navigation.navigate(AppRoutes.Login)
                        }}
                    />
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: hp(2), marginHorizontal: 18 }}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }}>
                            <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                        </Pressable>
                        <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                        <View style={styles.left} />
                    </View>
                    <Text style={[styles.semibTxt, styles.tac, { marginTop: 20 }]}>{appkeys.NewPassword}</Text>
                    <Text style={[styles.medTxt, styles.tac, { marginTop: 10, width: "80%", alignSelf: "center" }]}>{appkeys.Createnewpass}</Text>
                    <View style={{ height: 18 }} />
                    <CustomInput
                        place={appkeys.Password}
                        secure
                        value={password}
                        onChangeText={(t) => setPassword(t)}
                    />
                    <CustomInput
                        place={appkeys.ConfirmPass}
                        secure
                        value={confirmpass}
                        onChangeText={t => setConfirmpass(t)}
                    />
                    <View style={{ height: hp(14) }} />
                    <CustomBtn
                        titleTxt={appkeys.VerifynContinue}
                        onPress={() => {
                            submit()
                        }}
                    />
                </View>
            }
        />
    )
}

export default NewPassword

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
        lineHeight: 20
    },
    semibTxt: {
        color: colors.text,
        fontSize: 24,
        fontFamily: AppFonts.SemiBold,
    },
})