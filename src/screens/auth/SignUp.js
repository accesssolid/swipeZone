import { Pressable, StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import AuthContainer from '../components/AuthContainer'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import { PrivacyLine } from './Login';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { clearSignupdata, setSignupdata } from '../../redux/Reducers/signup';
import CountryPicker from 'react-native-country-picker-modal';
import CustomImagePickerModal from '../modals/CustomImagePickerModal';
import AppUtils from '../../utils/appUtils';
import { getPositionSports, uploadImage, uploadImagesFetchblob } from '../../api/Services/services';
import { endpoints } from '../../api/Services/endpoints';
import { setLoading } from '../../redux/Reducers/load';
import hit from '../../api/Manager/manager';
import RequiredTxt from '../components/RequiredTxt';
import { formatPhoneNumber, parsePhoneNumber } from '../../utils/phonenumberformatter';
import { authorize, setIsAthlete } from '../../redux/Reducers/userData';
import { storeData } from '../../utils/asyncStore';
import { setUserHasCred } from '../../redux/Reducers/userCred';
import CustomDrop from '../components/CustomDrop';
import { getSportListThunk } from '../../redux/Reducers/dropdownlist';
import getYearList from '../../utils/years';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';
import MultichoiceQn from '../components/MultichoiceQn';

const SignUp = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const alldata = useSelector(state => state?.signup?.signupdata)
    const sportList = useSelector(state => state?.droplist?.sports)

    const [type, setType] = useState(alldata?.userType ?? appkeys.Athlete)
    const [showPicker, setShowPicker] = useState(false)
    const [countryModal, setCountryModal] = useState(false)
    const [countrycode, setCountrycode] = useState("1")
    const [profilePic, setProfilePic] = useState(null)
    const [dataFilled, setDataFilled] = useState(false)
    const [positionList, setPositionList] = useState([])
    const [gettingPos, setGettingPos] = useState(false)

    useEffect(() => {
        userAnalytics(USEREVENTS.register, { user: "" })
    }, [])

    useEffect(() => {
        if (type) {
            writeSignupdata("userType", type)
            setProfilePic(null)
        }
    }, [type])
    useEffect(() => {
        if (alldata?.profilePic) {
            setProfilePic(alldata?.profilePic)
        }
    }, [alldata])
    useEffect(() => {
        setDataFilled(isDataFilled())
    }, [alldata])
    useEffect(() => {
        if (sportList.length == 0)
            dispatch(getSportListThunk())
    }, [sportList])

    const renderOptions = useCallback((arr) => {
        return (
            <View style={{ flexDirection: "row" }}>
                {arr.map((i, j) => {
                    return (
                        <Pressable key={j.toString()}
                            style={{ flexDirection: 'row', alignItems: "center", marginLeft: 18, marginRight: wp(12) }}
                            onPress={() => {
                                console.log("AAA", i)
                                setType(i);
                                dispatch(setSignupdata({ userType: i }))
                            }}
                        >
                            <View style={{ height: 24, width: 24, justifyContent: "center", alignItems: "center", borderRadius: 100, borderColor: colors.primary, borderWidth: 2 }}>
                                {type == i && <View style={{ height: "80%", width: "80%", backgroundColor: colors.primary, borderRadius: 100 }} />}
                            </View>
                            <Text style={{ marginLeft: 8, color: colors.text, fontSize: 14, fontFamily: AppFonts.SemiBold }}>{i == "Athelete" ? appkeys.CorrectAthlete : i}</Text>
                        </Pressable>
                    )
                })}
            </View>
        )
    }, [type])
    const writeSignupdata = useCallback((key, value) => {
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])

    const checkEmail = async () => {
        if (!alldata?.email || alldata?.email == "") {
            AppUtils.showToast("Email is required.")
            return
        }
        if (!AppUtils.validateEmail(alldata?.email)) {
            AppUtils.showToast("Email is not valid.")
            return
        } else {
            AppUtils.showLog("Email is valid.")
        }
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints?.checkuser, "post", { email: alldata?.email })
            if (!res?.err) {
                if (res?.data) {
                    dispatch(setLoading(false))
                    AppUtils.showToast("Email already exists")
                    return
                } else {
                    onPressSubmit()
                }
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            console.error(e);
        } finally {
            // dispatch(setLoading(false))
        }
    }
    const onPressSubmit = async () => {
        // if (!alldata?.profilePic) {
        //     AppUtils.showToast("Profile picture is required.")
        //     return
        // }
        if (type.toLowerCase() == "athelete") {
            if (!alldata?.fname || alldata?.fname?.trim() == "") {
                AppUtils.showToast("First Name is required.")
                dispatch(setLoading(false))
                return
            }
            if (!alldata?.lname || alldata?.lname?.trim() == "") {
                AppUtils.showToast("Last Name is required.")
                dispatch(setLoading(false))
                return
            }
            if (!alldata?.collegeTransferringFrom) {
                AppUtils.showToast("Select Athtlete Type.")
                dispatch(setLoading(false))
                return
            }
            if (alldata?.sports?.length == 0 || alldata?.sports?.[0] == "" || !alldata?.sports) {
                AppUtils.showToast("Select Sports")
                dispatch(setLoading(false))
                return
            }
            if (!alldata?.gradYear) {
                AppUtils.showToast("Select Graduation Year")
                dispatch(setLoading(false))
                return
            }
            if (alldata?.gradYear?.length < 4) {
                AppUtils.showToast("Enter Correct Graduation Year")
                dispatch(setLoading(false))
                return
            }
            // if (!alldata?.position1 || !alldata?.position2) {
            //     AppUtils.showToast("Enter Position")
            //     dispatch(setLoading(false))
            // }
        } else {
            if (!alldata?.name) {
                AppUtils.showToast("College/University Name is required.")
                dispatch(setLoading(false))
                return
            }
        }
        if (!alldata?.phone || alldata?.phone == "") {
            AppUtils.showToast("Phone number is required.")
            dispatch(setLoading(false))
            return
        }
        if (alldata?.phone?.length < 10) {
            AppUtils.showToast("Phone number not valid.")
            dispatch(setLoading(false))
            return
        }
        if ((!alldata?.password || alldata?.password == "" || !alldata?.confirmpassword || alldata?.confirmpassword == "")) {
            AppUtils.showToast("Password is required.")
            dispatch(setLoading(false))
            return
        }
        if (alldata?.password) {
            let regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
            if (!regex.test(alldata?.password)) {
                AppUtils.showToast("Password must contain at least 8 characters, including one letter and one digit.");
                dispatch(setLoading(false))
                return
            }
        }
        if (alldata?.password != alldata?.confirmpassword) {
            AppUtils.showToast("Password does not match.")
            dispatch(setLoading(false))
            return
        }
        if (type == appkeys.Athlete) {
            dispatch(setLoading(true))
            let body = { ...alldata, os: Platform?.OS, cc: countrycode }
            // if (body?.profilePic) {
            //     let profileImage = await uploadProfilePic(body?.profilePic)
            //     if (profileImage?.error) {
            //         dispatch(setLoading(false))
            //         AppUtils.showToast('Failed Image Upload.')
            //         return
            //     } else {
            //         body = { ...body, profilePic: profileImage?.image }
            //     }
            // }
            if (body?.phone) {
                body = { ...body, phone: parsePhoneNumber(body?.phone) }
            }
            if (body?.userType) {
                delete body.userType
            }
            if (body?.confirmpassword) {
                delete body.confirmpassword
            }
            try {
                let res = await hit(endpoints.registerAthelete, "post", body)
                console.log(res);
                if (!res?.err) {
                    // userAnalytics(USEREVENTS.register, { user: res?.data?.user })
                    storeData("@tokens", res?.data?.tokens)
                    dispatch(authorize({ user: res?.data?.user }))
                    // dispatch(getSubFeatures(res?.data?.user))
                    dispatch(setIsAthlete(true))
                    dispatch(clearSignupdata())
                    dispatch(setUserHasCred(true))
                    // navigation.navigate(AppRoutes.AboutUser)
                    navigation.replace(AppRoutes.NonAuthStack, { screen: AppRoutes.AboutUser })
                } else {
                    AppUtils.showToast(res?.msg)
                }
            } catch (e) {
                console.error(e);
            } finally {
                dispatch(setLoading(false))
            }
        }
        else {
            dispatch(setLoading(false))
            writeSignupdata("cc", countrycode)
            navigation.navigate(AppRoutes.AboutUniversity)
        }
    }
    const uploadProfilePic = async (image) => {
        try {
            let res = await uploadImagesFetchblob([image])
            if (res?.data) {
                return { error: false, image: JSON.parse(res?.data)?.[0] }
            } else {
                AppUtils.showToast('Something went wrong.')
                dispatch(setLoading(false))
                return { error: true }
            }
        } catch (e) {
            console.error(e);
        }
    }
    const isDataFilled = useCallback(() => {
        // if (!alldata?.profilePic) {
        //     return false
        // }
        if (type.toLowerCase() == "athelete") {
            if (!alldata?.fname || alldata?.fname?.trim() == "") {
                return false
            }
            if (!alldata?.lname || alldata?.lname?.trim() == "") {
                return false
            }
            if (!alldata?.collegeTransferringFrom) {
                return false
            }
            if (alldata?.sports?.length == 0 || alldata?.sports?.[0] == "" || !alldata?.sports) {
                return false
            }
            if (!alldata?.gradYear) {
                return false
            }
            if (alldata?.gradYear?.length < 4) {
                return false
            }
            // if (!alldata?.position1 || !alldata?.position2) {
            //     return false
            // }
        } else {
            if (!alldata?.name) {
                return false
            }
        }
        if (!AppUtils.validateEmail(alldata?.email)) {
            return false
        }
        if (!alldata?.phone || alldata?.phone == "") {
            return false
        }
        // if (alldata?.phone?.length < 10) {
        //     return false
        // }
        if ((!alldata?.password || alldata?.password == "" || !alldata?.confirmpassword || alldata?.confirmpassword == "")) {
            return false
        }
        // if (alldata?.password) {
        //     let regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
        //     if (!regex.test(alldata?.password)) {
        //         return false
        //     }
        // }
        // if (alldata?.password != alldata?.confirmpassword) {
        //     return false
        // }
        return true
    }, [alldata])
    const getSportsPos = async (id) => {
        try {
            setGettingPos(true)
            let res = await getPositionSports(id)
            setGettingPos(false)
            if (!res?.err) {
                setPositionList(res?.data)
            }
        } catch (e) {
            AppUtils.showLog(e, "error getting position")
        }
    }

    return (
        <AuthContainer
            children={
                <View style={{ flex: 1 }}>
                    {countryModal && <CountryPicker
                        withCallingCode
                        visible={countryModal}
                        onClose={() => setCountryModal(false)}
                        onSelect={(val) => {
                            setCountrycode(val?.callingCode[0])
                            writeSignupdata("cc", val?.callingCode[0])
                        }}
                    />}
                    <CustomImagePickerModal
                        visible={showPicker}
                        attachments={(img) => {
                            writeSignupdata("profilePic", img)
                        }}
                        onPress={() => setShowPicker(false)}
                        pressHandler={() => { setShowPicker(false) }}
                    />
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: hp(1), marginHorizontal: 18 }}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }}>
                            <FastImage source={images.dropleft} style={styles.left} resizeMode='contain' />
                        </Pressable>
                        <FastImage source={images.logocolor} style={styles.logo} resizeMode='contain' />
                        <View style={styles.left} />
                    </View>
                    <Text style={[styles.semibTxt, styles.tac, { marginTop: 16 }]}>{appkeys.GetMatched}</Text>
                    <Text style={[styles.medTxt, styles.tac, styles.bodytextalign, { fontSize: 11, lineHeight: 22 }]}>{appkeys.KeepingPrivate}</Text>
                    {/* <Text style={[styles.semibTxt, { fontSize: 12, margin: 18, marginTop: 20, marginBottom: 8 }]}>{appkeys.AreYoua}</Text> */}
                    {/* <View style={{ marginTop: 20, }} /> */}
                    {/* {renderOptions([appkeys.Athlete, appkeys.University])} */}
                    {/* <Pressable style={{ marginVertical: 20, alignSelf: "center" }}
                        onPress={() => { setShowPicker(true) }}
                    >
                        <FastImage source={profilePic ? { uri: profilePic?.path } : images.lib} style={{ height: wp(22), width: wp(22), alignSelf: 'center', borderRadius: wp(22), borderWidth: 1, borderColor: colors.primary }} />
                        <RequiredTxt txt={appkeys.Addprofilepicture} txtStyle={[styles.medTxt, styles.tac, { fontSize: 12 }]} styleMain={{ marginTop: 6 }} />
                    </Pressable> */}
                    {type.toLowerCase() == "athelete" ?
                        <>
                            <CustomInput
                                isRequiredTxt={true}
                                place={appkeys.fName}
                                img={images.avatar}
                                value={alldata?.fname}
                                onChangeText={(t) => {
                                    writeSignupdata("fname", t)
                                }}
                            />
                            <CustomInput
                                isRequiredTxt={true}
                                place={appkeys.lName}
                                img={images.avatar}
                                value={alldata?.lname}
                                onChangeText={(t) => {
                                    writeSignupdata("lname", t)
                                }}
                            />
                        </>
                        :
                        <CustomInput
                            isRequiredTxt={true}
                            place={appkeys.CollegeUniversity}
                            img={images.avatar}
                            value={alldata?.name}
                            textInputProps={{
                                autoCapitalize: "words"
                            }}
                            onChangeText={(t) => {
                                writeSignupdata("name", t)
                            }}
                        />
                    }
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.Email}
                        img={images.mail}
                        value={alldata?.email}
                        onChangeText={(t) => {
                            writeSignupdata("email", t)
                        }}
                        textInputProps={{
                            keyboardType: "email-address",
                            autoCapitalize: "none",
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        hasCountryCode={true}
                        countrycode={`+${countrycode}`}
                        onPressCountry={() => {
                            setCountryModal(true)
                        }}
                        place={appkeys.Mobilenumb}
                        img={images.phone}
                        textInputProps={{
                            keyboardType: "numeric",
                            maxLength: Platform?.OS == "ios" ? 10 : 12
                        }}
                        value={alldata?.phone}
                        onChangeText={(t) => {
                            writeSignupdata("phone", formatPhoneNumber(t))
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.Password}
                        secure
                        value={alldata?.password}
                        onChangeText={(t) => {
                            writeSignupdata("password", t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.ConfirmPass}
                        secure
                        value={alldata?.confirmpassword}
                        onChangeText={(t) => {
                            writeSignupdata("confirmpassword", t)
                        }}
                    />
                    {
                        type.toLowerCase() == "athelete" &&
                        <>
                            <View style={{ marginTop: 16 }}>
                                <MultichoiceQn
                                    hideQuestion={true}
                                    required={false}
                                    list={[{ label: "High School Athlete", value: "high" }, { label: "College Transfer Athlete", value: "transfer" }]}
                                    value={alldata?.collegeTransferringFrom}
                                    onChange={(t) => {
                                        writeSignupdata("collegeTransferringFrom", t)
                                    }}
                                />
                            </View>
                            <RequiredTxt txt={appkeys.Sports} txtStyle={[styles.placeTxt, { margin: 0, marginLeft: 20 }]} styleMain={{ marginTop: 16 }} />
                            <CustomDrop
                                list={sportList}
                                val={alldata?.sports ? alldata?.sports[0] : ""}
                                allData={true}
                                selectedData={(v) => {
                                    // getSportsPos(v?._id)
                                }}
                                setVal={(v) => {
                                    writeSignupdata("sports", [v])
                                }}
                            />
                            {/* {gettingPos ?
                                <View style={{ marginTop: 10 }}>
                                    <ActivityIndicator size={"large"} color={colors.primary} />
                                </View>
                                :
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 16 }}>
                                    <View style={{ width: wp(50) }}>
                                        <RequiredTxt txt={appkeys.Position1} txtStyle={[styles.placeTxt, { margin: 0 }]} />
                                        <CustomDrop
                                            place={appkeys.Position1}
                                            list={positionList}
                                            styleOptions={{ width: "80%" }}
                                            val={alldata?.position1 ?? ""}
                                            setVal={(v) => {
                                                writeSignupdata("position1", v)
                                            }}
                                        />
                                    </View>
                                    <View style={{ width: wp(50) }}>
                                        <RequiredTxt txt={appkeys.Position2} txtStyle={[styles.placeTxt, { margin: 0 }]} />
                                        <CustomDrop
                                            place={appkeys.Position2}
                                            list={positionList}
                                            styleOptions={{ width: "80%" }}
                                            val={alldata?.position2 ?? ""}
                                            setVal={(v) => {
                                                writeSignupdata("position2", v)
                                            }}
                                        />
                                    </View>
                                </View>
                            } */}
                            <RequiredTxt txt={appkeys.GraduationYear} txtStyle={[styles.placeTxt, { margin: 0, marginLeft: 20 }]} styleMain={{ marginTop: 16 }} />
                            <CustomDrop
                                list={getYearList()}
                                val={alldata?.gradYear}
                                setVal={(v) => {
                                    writeSignupdata("gradYear", v)
                                }}
                            />
                            {/* <CustomInput
                                isRequiredTxt={true}
                                place={appkeys.GraduationYear}
                                value={alldata?.gradYear}
                                onChangeText={(v) => {
                                    writeSignupdata("gradYear", v)
                                }}
                                textInputProps={{
                                    keyboardType: "number-pad",
                                    maxLength: 4
                                }}
                            /> */}
                        </>
                    }
                    <CustomBtn
                        titleTxt={appkeys.Next}
                        btnStyle={[{ marginTop: 60, marginBottom: 40 }, !dataFilled && { backgroundColor: colors.lightGrey }]}
                        onPress={() => {
                           
                            // navigation.navigate(AppRoutes.AboutUser)
                            // return
                            if (dataFilled) {
                                userAnalytics(USEREVENTS.nextbuttonselected, { user: "",platform: Platform.OS })
                                checkEmail()
                            }
                        }}
                    />
                    <PrivacyLine />
                    <View style={{ height: hp(4) }} />
                </View>
            }
        />
    )
}

export default SignUp

const useStyles = (colors) => StyleSheet.create({
    bodytextalign: {
        marginTop: 14,
        width: "70%",
        alignSelf: "center",
    },
    semibTxt: {
        color: colors.text,
        fontSize: 24,
        fontFamily: AppFonts.SemiBold,
    },
    logo: {
        height: hp(8),
        width: wp(30),
        alignSelf: "center",
    },
    left: {
        height: 24,
        width: 24,
    },
    tac: {
        textAlign: "center"
    },
    medTxt: {
        color: colors.text,
        fontSize: 16,
        fontFamily: AppFonts.Medium,
    },
    placeTxt: {
        margin: 18,
        marginBottom: 4,
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        marginLeft: 22
    },
})