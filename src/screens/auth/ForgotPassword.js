import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import AuthContainer from '../components/AuthContainer'
import { hp, wp } from '../../utils/dimension'
import FastImage from 'react-native-fast-image'
import AppFonts from '../../constants/fonts'
import { useTheme } from '@react-navigation/native'
import { LocalizationContext } from '../../localization/localization'
import CustomInput from '../components/CustomInput'
import CustomBtn from '../components/CustomBtn'
import AppRoutes from '../../routes/RouteKeys/appRoutes'
import hit from '../../api/Manager/manager'
import { endpoints } from '../../api/Services/endpoints'
import AppUtils from '../../utils/appUtils'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/Reducers/load'

const ForgotPassword = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [email, setEmail] = useState("")

    const submit = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.forgotpassword, "post", { email })
            if (!res?.err) {
                navigation.navigate(AppRoutes.Verification, { email })
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
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: hp(2), marginHorizontal: 18 }}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }}>
                            <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                        </Pressable>
                        <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                        <View style={styles.left} />
                    </View>
                    <Text style={[styles.semibTxt, styles.tac, { marginTop: 20 }]}>{appkeys.ForgotPassword}</Text>
                    <Text style={[styles.medTxt, styles.tac, { marginTop: 18, width: "80%", alignSelf: "center" }]}>{appkeys.Enteremailaddressresetpassword}</Text>
                    <View style={{ height: 18 }} />
                    <CustomInput
                        place={appkeys.Email}
                        img={images.mail}
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t)
                        }}
                        textInputProps={{
                            autoCapitalize: "none",
                            keyboardType: "email-address"
                        }}
                    />
                    <View style={{ height: hp(20) }} />
                    <CustomBtn
                        titleTxt={appkeys.Continue}
                        onPress={() => { submit() }}
                    />
                </View>
            }
        />
    )
}

export default ForgotPassword

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
    },
    semibTxt: {
        color: colors.text,
        fontSize: 24,
        fontFamily: AppFonts.SemiBold,
    },
})