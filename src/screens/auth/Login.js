import { Alert, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import AuthContainer from '../components/AuthContainer'
import FastImage from 'react-native-fast-image'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import { hp, wp } from '../../utils/dimension'
import { LocalizationContext } from '../../localization/localization'
import AppFonts from '../../constants/fonts'
import CustomInput from '../components/CustomInput'
import CustomBtn from '../components/CustomBtn'
import BtnSocialAuth from '../components/BtnSocialAuth'
import AppRoutes from '../../routes/RouteKeys/appRoutes'
import { useDispatch, useSelector } from 'react-redux'
import { authorize, setIsAthlete } from '../../redux/Reducers/userData'
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setLoading } from '../../redux/Reducers/load'
import hit from '../../api/Manager/manager'
import { endpoints } from '../../api/Services/endpoints'
import AppUtils from '../../utils/appUtils'
import { storeData } from '../../utils/asyncStore'
import { setSignupdata } from '../../redux/Reducers/signup'
import { clearCreds, setUserCred, setUserHasCred } from '../../redux/Reducers/userCred'
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics'

GoogleSignin.configure({
    webClientId: '2318722263-h5s0jp9efsqf41mt3ln9brkmc6a9jugu.apps.googleusercontent.com',
});

const Login = ({ navigation }) => {
    const credList = useSelector(state => state?.userCred?.credList)
    const hasAccount = useSelector(state => state?.userCred?.hasAccount)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [userType, setUserType] = useState(appkeys?.Athlete)
    const [loginObj, setLoginObj] = useState({
        email: "",
        password: ""
    })
    const [credSuggestions, setCredSuggestions] = useState([])

    useFocusEffect(
        useCallback(() => {
            setCredSuggestions([])
            setLoginObj({ email: "", password: "" })
        }, [])
    )
    useEffect(() => {
        if (loginObj?.email?.trim() == "") {
            setCredSuggestions([])
        }
        if (credList && loginObj?.email) {
            let temp = credList?.filter(x => x?.email?.split("@")[0]?.toLowerCase()?.includes(loginObj?.email?.toLowerCase()))
            setCredSuggestions(temp)
        }
    }, [credList, loginObj?.email])

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
        //     lname = email.split("@")[0] || ""
        // } else {
        //     fname = res?.additionalUserInfo?.username?.split(" ")[0] ?? ""
        //     lname = res?.additionalUserInfo?.username?.split(" ")[1] ?? ""
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
                    // if (res?.data?.user?.sports?.length == 0) {
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
                navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.BottomTab })
                if (!hasAccount) {
                    dispatch(setUserHasCred(true))
                }
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            console.log(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const submit = async () => {
        let body = { ...loginObj, role: userType.toLowerCase() }
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.login, "post", body)
            if (!res?.err) {
                console.log(res?.data?.user);
                storeData("@tokens", res?.data?.tokens)
                dispatch(authorize({ user: res?.data?.user }))
                if (res?.data?.user?.role == appkeys?.Athlete.toLowerCase()) {
                    dispatch(setIsAthlete(true))
                } else {
                    dispatch(setIsAthlete(false))
                }
                dispatch(setLoading(false))
                setTimeout(() => {
                    navigation.replace(AppRoutes.NonAuthStack, { screen: AppRoutes.BottomTab })
                }, 40);
                let alreadyExists = credList?.some(x => x?.email == loginObj?.email)
                if (!alreadyExists) {
                    console.log("hereeeee", alreadyExists);
                    dispatch(setUserCred([...credList, loginObj]))
                }
                if (!hasAccount) {
                    dispatch(setUserHasCred(true))
                }
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (err) {
            console.error(err);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <AuthContainer
            children={
                <View style={{ flex: 1 }}>
                    {/* <Text onPress={() => dispatch(clearCreds())}>Sdfdfs</Text> */}
                    {/* <Text onPress={() => dispatch(setUserHasCred(false))}>Sdfdfs</Text> */}
                    <Pressable
                        style={{ margin: 16, alignSelf: "flex-start" }}
                        onPress={() => {
                            navigation.navigate(AppRoutes.Welcome)
                        }}>
                        <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                    </Pressable>
                    <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                    <Text style={styles.headertxt}>{appkeys?.welcomeheading}!</Text>
                    {/* {(!hasAccount) && <Text style={styles.medTxt}>RECRUITS – Start Your Free Trial Now!  Sign Up Below.{"\n"}COACHES – Login with Credentials or Sign Up for FREE!</Text>} */}
                    <View style={{ backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 40, marginHorizontal: 18, ...styles.shadow }}>
                        <Pressable
                            style={{ ...styles.userType, backgroundColor: userType == appkeys?.Athlete ? colors.primary : null, }}
                            onPress={() => {
                                setUserType(appkeys?.Athlete)
                            }}
                        >
                            <Text style={{ ...styles.userTypeTxt, color: userType == appkeys?.Athlete ? colors.white : colors.text }}>{appkeys?.CorrectAthlete}</Text>
                        </Pressable>
                        <Pressable
                            style={{ ...styles.userType, backgroundColor: userType == appkeys?.University ? colors.primary : null }}
                            onPress={() => {
                                setUserType(appkeys?.University)
                            }}
                        >
                            <Text style={{ ...styles.userTypeTxt, color: userType == appkeys?.University ? colors.white : colors.text, }}>{appkeys?.University}</Text>
                        </Pressable>
                    </View>
                    <CustomInput
                        place={appkeys.Email}
                        secure={false}
                        img={images.mail}
                        styleMain={{ marginTop: hp(4) }}
                        textInputProps={{
                            autoCapitalize: "none",
                            keyboardType: "email-address"
                        }}
                        value={loginObj?.email}
                        onChangeText={(t) => {
                            let temp = { ...loginObj, email: t }
                            setLoginObj(temp)
                        }}
                        credSuggestions={credSuggestions}
                        credSelected={(cred) => {
                            setLoginObj(cred)
                        }}
                    />
                    <CustomInput
                        place={appkeys.Password}
                        secure
                        value={loginObj?.password}
                        onChangeText={(t) => {
                            let temp = { ...loginObj, password: t }
                            setLoginObj(temp)
                        }}
                    />
                    <Text style={{ color: colors.primary, fontSize: 12, fontFamily: AppFonts.SemiBoldIta, textAlign: 'right', marginTop: 4, marginHorizontal: 20, alignSelf: "flex-end" }}
                        onPress={() => { navigation.navigate(AppRoutes.ForgotPassword) }}
                    >{appkeys.ForgotPassword} ?</Text>
                    <CustomBtn
                        titleTxt={appkeys.Login}
                        btnStyle={{ marginTop: hp(4) }}
                        onPress={() => {
                            userAnalytics(USEREVENTS.coachesLogin, { user: "", platform: Platform.OS })
                            submit()
                        }}
                    />
                    <Text style={{ textAlign: "center", marginTop: 6, fontFamily: AppFonts.Medium, fontSize: 11.6, color: colors.text }}
                        onPress={() => { 
                            userAnalytics(USEREVENTS.onboardStarted, { user: "", platform: Platform.OS })

                            navigation.navigate(AppRoutes.SignUp)
                         }}
                    >{appkeys.loginnoacc}<Text style={{ color: colors.primary, fontFamily: AppFonts.Bold }}>{" "}{appkeys.SignUp}</Text></Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: "center", marginTop: hp(4) }}>
                        {/* <View style={styles.line} />
                        <Text style={{ fontSize: 12, fontFamily: AppFonts.SemiBold, color: colors.text }}>{appkeys.orsignin}</Text>
                        <View style={styles.line} /> */}
                    </View>
                    {/* {Platform?.OS == "ios" && <BtnSocialAuth type={"apple"} styleBtn={{ marginTop: hp(4) }}
                        onPress={() => {
                            onAppleButtonPress()
                        }}
                    />}
                    <BtnSocialAuth
                        onPress={() => {
                            onGoogleButtonPress()
                        }}
                    /> */}
                    <PrivacyLine />
                    <View style={{ height: hp(4) }} />
                </View>
            }
        />
    )
}

export default Login

const useStyles = (colors) => StyleSheet.create({
    left: {
        height: 24,
        width: 24,
    },
    line: {
        width: "22%",
        height: 2,
        backgroundColor: colors.primary,
        marginHorizontal: 8
    },
    userTypeTxt: {
        fontFamily: AppFonts.Medium, fontSize: 14
    },
    userType: {
        height: 48, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
    medTxt: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: AppFonts.Medium,
        color: colors.text,
        textAlign: "center",
        marginTop: hp(1),
        width: "90%",
        alignSelf: "center"
    },
    headertxt: {
        fontSize: 24,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        textAlign: "center",
        marginTop: hp(2.5),
        alignSelf: "center",
        width: "80%"
    },
    logo: {
        height: hp(8),
        width: wp(30),
        alignSelf: "center",
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
})

export const PrivacyLine = () => {
    const navigation = useNavigation()
    const { colors } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    return (<Text style={{ fontSize: 10, color: colors.text, fontFamily: AppFonts.Regular, textAlign: "center", marginTop: hp(2) }}>{appkeys.ByCreatingacc}{"\n"}<Text style={{ fontFamily: AppFonts.Bold }} onPress={() => { navigation.navigate(AppRoutes.PrivacyPolicy, { from: "terms" }) }}>{appkeys.Termsofservice}</Text>{" "}{appkeys.and}{" "}<Text style={{ fontFamily: AppFonts.Bold }} onPress={() => { navigation.navigate(AppRoutes.PrivacyPolicy, { from: "privacy" }) }}>{appkeys.PrivacyPolicy}</Text></Text>
    )
}
