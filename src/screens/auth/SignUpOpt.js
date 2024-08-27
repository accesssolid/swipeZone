import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import AuthContainer from '../components/AuthContainer'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { hp, wp } from '../../utils/dimension';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';
import BtnSocialAuth from '../components/BtnSocialAuth';
import { PrivacyLine } from './Login';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { storeData } from '../../utils/asyncStore';
import { setSignupdata } from '../../redux/Reducers/signup';
import { useDispatch } from 'react-redux';
import { authorize, setIsAthlete } from '../../redux/Reducers/userData';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';

GoogleSignin.configure({
    webClientId: '2318722263-h5s0jp9efsqf41mt3ln9brkmc6a9jugu.apps.googleusercontent.com',
});

const SignUpOpt = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [userType, setUserType] = useState(appkeys?.Athlete)

    const onAppleButtonPress = async () => {
        // Start the sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
            throw new Error('Apple Sign-In failed - no identify token returned');
        }
        // Create a Firebase credential from the response
        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        // Sign the user in with the credential
        let res = await auth().signInWithCredential(appleCredential);
        let email = res?.additionalUserInfo?.profile?.email
        let fname = appleAuthRequestResponse?.fullName?.givenName ?? ""
        let lname = appleAuthRequestResponse?.fullName?.familyName ?? ""
        if (fname == "") {
            fname = email.split("@")[0] || ""
        }
        if (lname == "") {
            lname = email.split("@")[0] || ""
        }
        // if (res?.additionalUserInfo?.username == null) {
        //     fname = email.split("@")[0] || ""
        // } else {
        //     fname = res?.additionalUserInfo?.username
        // }
        socialLogin(email, "apple", identityToken, fname, lname)
    }
    const onGoogleButtonPress = async () => {
        GoogleSignin.signOut();
        const { idToken, user } = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        let googleRes = await auth().signInWithCredential(googleCredential);
        let email = user.email ?? ""
        let displayname = googleRes?.user?.displayName
        let fname = displayname.split(" ")[0]
        let lname = displayname.split(" ")[1] || ""
        socialLogin(email, "google", idToken, fname, lname)
    }
    const socialLogin = async (email, loginType, token, fname, lname) => {
        let body = { name: fname, loginType, role: userType.toLowerCase(), token, email }
        if (userType.toLowerCase() == "athelete") {
            delete body?.name
            body = { ...body, fname, lname }
        }
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.sociallogin, "post", body);
            if (!res?.err) {
                let data = { fname: res?.data?.user?.fname, lname: res?.data?.user?.lname, email: res?.data?.user?.email, userType: res?.data?.user?.role, loginType: "social" }
                storeData("@tokens", res?.data?.tokens)
                if (res?.data?.user?.role == "athelete") {
                    // if (res?.data?.user?.weight == 0) {
                    //     dispatch(setSignupdata(data))
                    //     navigation.navigate(AppRoutes.AboutUser)
                    //     return
                    // } else {
                    dispatch(setIsAthlete(true))
                    // }
                } else {
                    if (data?.fname) {
                        data = { ...data, name: res?.data?.user?.name }
                        delete data?.fname
                        delete data?.lname
                    }
                    if (res?.data?.user?.sports?.length == 0) {
                        dispatch(setSignupdata(data))
                        navigation.navigate(AppRoutes.AboutUniversity)
                        return
                    } else {
                        dispatch(setIsAthlete(false))
                    }
                }
                dispatch(authorize({ user: res?.data?.user }))
                navigation.navigate(AppRoutes.NonAuthStack)
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            console.log(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <AuthContainer
            children={
                <View style={{ height: hp(92) }}>
                    <View style={{ flex: 0.9 }}>
                        <Pressable
                            style={{ margin: 16, alignSelf: "flex-start" }}
                            onPress={() => {
                                navigation.navigate(AppRoutes.Welcome)
                            }}>
                            <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                        </Pressable>
                        <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                        {userType == appkeys?.Athlete ?
                            <Text style={[styles.quoteTxt, styles.txtShadow]}>FIND THE{"\n"}<Text style={{ color: colors.primary }}>RIGHT</Text> SCHOOL</Text>
                            :
                            <Text style={[styles.quoteTxt, styles.txtShadow]}>FIND THE{"\n"}<Text style={{ color: colors.primary }}>RIGHT</Text> RECRUIT</Text>
                        }
                        {/* <Text style={{ fontFamily: AppFonts.Medium, fontSize: 16, textAlign: "center", color: colors.text }}>{appkeys.TheFastestWayToGetRecruited}</Text> */}
                        <View style={{ backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: hp(3), marginHorizontal: 18, ...styles.shadow }}>
                            <Pressable
                                style={{ ...styles.userType, backgroundColor: userType == appkeys?.Athlete ? colors.primary : null, }}
                                onPress={() => {
                                    setUserType(appkeys?.Athlete)
                                    dispatch(setSignupdata({ userType: appkeys?.Athlete }))
                                }}
                            >
                                <Text style={{ ...styles.userTypeTxt, color: userType == appkeys?.Athlete ? colors.white : colors.text }}>{appkeys.CorrectAthlete}</Text>
                            </Pressable>
                            <Pressable
                                style={{ ...styles.userType, backgroundColor: userType == appkeys?.University ? colors.primary : null }}
                                onPress={() => {
                                    setUserType(appkeys?.University)
                                    dispatch(setSignupdata({ userType: appkeys?.University }))
                                }}
                            >
                                <Text style={{ ...styles.userTypeTxt, color: userType == appkeys?.University ? colors.white : colors.text, }}>{appkeys?.University}</Text>
                            </Pressable>
                        </View>
                        <CustomBtn titleTxt={appkeys.ContinuewithEmail}
                            btnStyle={{ marginTop: hp(6) }}
                            onPress={() => {
                                userAnalytics(userType == 'Athelete' ? USEREVENTS.athleteSelected : USEREVENTS.universitySelected, { user: "", platform: Platform.OS })
                                navigation.navigate(AppRoutes.SignUp)
                            }}
                        />
                        {/* {Platform?.OS == "ios" && <BtnSocialAuth type={"apple"} onPress={() => onAppleButtonPress()} />}
                        <BtnSocialAuth onPress={() => onGoogleButtonPress()} /> */}
                    </View>
                    <View style={{ flex: 0.1, justifyContent: "flex-end" }}>
                        {PrivacyLine()}
                    </View>
                </View>
            }
        />
    )
}

export default SignUpOpt

const useStyles = (colors) => StyleSheet.create({
    left: {
        height: 24,
        width: 24,
    },
    logo: {
        height: hp(12),
        width: wp(50),
        alignSelf: "center",
        marginTop: hp(4)
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
    userTypeTxt: {
        fontFamily: AppFonts.Medium, fontSize: 14
    },
    userType: {
        height: 48, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
    quoteTxt: {
        fontFamily: AppFonts.Black,
        fontSize: 28,
        textAlign: "center",
        color: colors.text,
        marginVertical: 6
    },
    txtShadow: {
        textShadowColor: 'rgba(254,111,39, 0.5)',
        textShadowOffset: { width: -1, height: 2 },
        textShadowRadius: 1
    }
})