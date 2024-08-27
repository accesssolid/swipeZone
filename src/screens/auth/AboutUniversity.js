import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import AuthContainer from '../components/AuthContainer';
import { LocalizationContext } from '../../localization/localization';
import AppFonts from '../../constants/fonts';
import { hp, wp } from '../../utils/dimension';
import CustomInput from '../components/CustomInput';
import CustomDrop from '../components/CustomDrop';
import ImagePicker from 'react-native-image-crop-picker';
import FastImage from 'react-native-fast-image';
import CameraModal from '../modals/CameraModal';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { authorize, setIsAthlete, } from '../../redux/Reducers/userData';
import Commonstyles from '../../utils/commonstyles';
import { PictureBlock } from './AtheleteSignup/AddMedia';
import { clearSignupdata, setSignupdata } from '../../redux/Reducers/signup';
import { uploadImage, uploadImagesFetchblob } from '../../api/Services/services';
import { setLoading } from '../../redux/Reducers/load';
import { endpoints } from '../../api/Services/endpoints';
import hit from '../../api/Manager/manager';
import AppUtils from '../../utils/appUtils';
import { storeData } from '../../utils/asyncStore';
import RequiredTxt from '../components/RequiredTxt';
import { parsePhoneNumber } from '../../utils/phonenumberformatter';
import { setUserHasCred } from '../../redux/Reducers/userCred';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';
import CustomImagePickerModal from '../modals/CustomImagePickerModal';

const AboutUniversity = ({ navigation }) => {
    const dispatch = useDispatch()
    const alldata = useSelector(state => state?.signup?.signupdata)
    const sportList = useSelector(state => state?.droplist?.sports)

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const style = useStyles(colors);

    const [list, setlist] = useState([
        { name: "Men's Basketball" },
        { name: "Women's Basketball" },
        { name: "Men's Volleyball" },
        { name: "Women's Volleyball" },
        { name: " Men's Soccer" },
        { name: "Women's Soccer" },
        { name: "Men's Baseball" },
        { name: "Women's Softball" },
        { name: "Men's Lacrosse " },
    ])
    const [addpicture, setAddpicture] = useState([])
    const [gallery, setGallery] = useState(false)
    const [coach1, setCoach1] = useState("")
    const [coach2, setCoach2] = useState("")
    const [showPicker, setShowPicker] = useState(false)
    const [profilePic, setProfilePic] = useState(null)

    useEffect(() => {
        if (alldata?.mascotImages) {
            setAddpicture(alldata?.mascotImages)
        }
        if (alldata?.profilePic) {
            setProfilePic(alldata?.profilePic)
        }
        // if (alldata?.coaches?.length > 0) {
        //     setCoach1(alldata?.coaches[0]?.coachName)
        //     setCoach2(alldata?.coaches[1]?.coachName)
        // }
    }, [alldata])
    useEffect(() => {
        if (alldata?.coaches) {
            setCoach1(alldata?.coaches[0]?.coachName)
            setCoach2(alldata?.coaches[1]?.coachName)
        }
    }, [alldata?.coaches])
    useEffect(() => {
        if (sportList) {
            setlist(sportList)
        }
    }, [sportList])

    async function OpenCamera() {
        let cameraAccess = await AppUtils.checkCameraPermisssion()
        if (!cameraAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openCamera({
            mediaType: "photo",
            multiple: false,
            compressImageQuality: .5,
        }).then(image => {
            setGallery(false)
            let temp = addpicture.concat([image])
            setAddpicture(temp)
            writeSignupdata("mascotImages", temp)
        });
    }
    async function OpenImage() {
        let galleryAccess = await AppUtils.checkGalleryPermisssion()
        if (!galleryAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openPicker({
            mediaType: "photo",
            multiple: false,
            compressImageQuality: .5,
        }).then(image => {
            setGallery(false)
            let temp = addpicture.concat([image])
            setAddpicture(temp)
            writeSignupdata("mascotImages", temp)
        })
    }
    const writeSignupdata = useCallback((key, value) => {
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])
    const uploadProfilepic = async (body) => {
        if (!alldata?.profilePic) {
            AppUtils.showToast("Profile picture is required.")
            return
        }
        if (addpicture.length == 0) {
            AppUtils.showToast("Mascot Image is required.")
            return
        }
        if (body?.sports?.length == 0 || !body?.sports || body?.sports?.[0] == "") {
            AppUtils.showToast("Sports is required.")
            return
        }
        if (coach1?.trim() == "") {
            AppUtils.showToast("Coach name is required.")
            return
        }
        if (!body?.programEmail || body?.programEmail?.trim() == "") {
            AppUtils.showToast("Program Email is required.")
            return
        }
        if (!body?.programBio || body?.programBio?.trim() == "") {
            AppUtils.showToast("Program bio is required.")
            return
        }
        dispatch(setLoading(true))
        if (!body?.profilePic) {
            body = { ...body, profilePic: endpoints.default_pic, coaches: [{ coachName: coach1 }, { coachName: coach2 }] }
            uploadMedia(body)
        } else {
            try {
                // let res = await uploadImage([body?.profilePic])
                // body = { ...body, profilePic: res?.data[0], coaches: [{ coachName: coach1 }, { coachName: coach2 }] }
                let res = await uploadImagesFetchblob([body?.profilePic])
                body = { ...body, profilePic: JSON.parse(res?.data)?.[0], coaches: [{ coachName: coach1 }, { coachName: coach2 }] }
                uploadMedia(body)
            } catch (e) {
            }
        }
    }
    const uploadMedia = async (body) => {
        try {
            // let res = await uploadImage(body?.mascotImages)
            // body = { ...body, mascotImages: res?.data, }
            let res = await uploadImagesFetchblob(body?.mascotImages)
            console.log(res, "mascotImages");
            if (res?.data) {
                body = { ...body, mascotImages: JSON.parse(res?.data), }
            }
            if (body.loginType == "social") {
                updateData(body)
            } else {
                submit(body)
            }
        } catch (e) {
            console.log(e, "mascotImages");
            dispatch(setLoading(false))
        }
    }
    const submit = async (body) => {
        try {
            body = { ...body, os: Platform?.OS, currentStep: 2 }
            if (body?.phone) {
                body = { ...body, phone: parsePhoneNumber(body?.phone) }
            }
            if (body?.schoolBio) {
                delete body.schoolBio
            }
            if (body?.userType) {
                delete body.userType
            }
            if (body?.confirmpassword) {
                delete body.confirmpassword
            }
            if (body.hasOwnProperty('position1')) {
                delete body.position1
            }
            if (body.hasOwnProperty('position2')) {
                delete body.position2
            }
            if (body.hasOwnProperty('collegeTransferringFrom')) {
                delete body.collegeTransferringFrom
            }
            if (body.hasOwnProperty('transferStudent')) {
                delete body.transferStudent
            }
            let res = await hit(endpoints.registerUni, "post", body, false)
            if (!res?.err) {
                userAnalytics(USEREVENTS.register, { user: res?.data?.user })
                userAnalytics(USEREVENTS.profileCompleted, { userId: res?.data?.user?._id })
                storeData("@tokens", res?.data?.tokens)
                dispatch(authorize({ user: res?.data?.user }))
                dispatch(setIsAthlete(false))
                dispatch(clearSignupdata())
                dispatch(setUserHasCred(true))
                AppUtils.showToast("Account created sucessfully.")
                dispatch(setLoading(false))
                setTimeout(() => {
                    navigation.replace(AppRoutes.NonAuthStack)
                }, 40);
            } else {
                AppUtils.showToast(res?.msg ?? "Something went wrong.")
            }
        } catch (e) {
            console.log(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const updateData = async (body) => {
        body = { ...body, os: Platform?.OS, currentStep: 2 }
        if (body?.phone) {
            body = { ...body, phone: parsePhoneNumber(body?.phone) }
        }
        if (body?.schoolBio) {
            delete body.schoolBio
        }
        if (body?.userType) {
            delete body.userType
        }
        if (body?.confirmpassword) {
            delete body.confirmpassword
        }
        if (body?.loginType) {
            delete body.loginType
        }
        if (body.hasOwnProperty('position1')) {
            delete body.position1
        }
        if (body.hasOwnProperty('position2')) {
            delete body.position2
        }
        try {
            let res = await hit(endpoints.updateself, "patch", body)
            console.log(res);
            if (!res?.err) {
                dispatch(authorize({ user: res?.data }))
                dispatch(setIsAthlete(false))
                dispatch(clearSignupdata())
                dispatch(setUserHasCred(true))
                AppUtils.showToast("Account created sucessfully.")
                dispatch(setLoading(false))
                setTimeout(() => {
                    navigation.replace(AppRoutes.NonAuthStack)
                }, 40);
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (err) {
            console.log(err);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <AuthContainer
            signupfooter
            progress={"50%"}
            onPressBack={() => {
                dispatch(setSignupdata({ ...alldata, coaches: [{ coachName: coach1 }, { coachName: coach2 }] }))
                navigation.goBack()
            }}
            onPressNext={() => {
                uploadProfilepic(alldata)
            }}
            children={
                <View>
                    <Text style={[style.title, { textAlign: "center" }]}>{localization?.appkeys?.About_University}</Text>
                    {/* <Text style={[style.desc, { textAlign: "center", fontSize: 12 }]}>{localization?.appkeys?.Youcanchangethislater}</Text> */}
                    <CameraModal
                        vis={gallery}
                        onPress={() => setGallery(false)}
                        onPressCamera={() => { OpenCamera() }}
                        onPressGallery={() => { OpenImage() }}
                    />
                    {/* <View style={{ marginHorizontal: 18 }}>
                        <Text style={style.addimage}>{localization?.appkeys?.AddMascotImages}</Text>
                    </View> */}
                    <CustomImagePickerModal
                        visible={showPicker}
                        attachments={(img) => {
                            writeSignupdata("profilePic", img)
                        }}
                        onPress={() => setShowPicker(false)}
                        pressHandler={() => { setShowPicker(false) }}
                    />
                    <Pressable style={{ marginVertical: 20, alignSelf: "center" }}
                        onPress={() => { setShowPicker(true) }}
                    >
                        <FastImage source={profilePic ? { uri: profilePic?.path } : images.lib} style={{ height: wp(22), width: wp(22), alignSelf: 'center', borderRadius: wp(22), borderWidth: 1, borderColor: colors.primary }} />
                        <RequiredTxt txt={localization?.appkeys.Addprofilepicture} txtStyle={[style.medTxt, style.tac, { fontSize: 12 }]} styleMain={{ marginTop: 6 }} />
                    </Pressable>
                    <RequiredTxt txt={localization?.appkeys?.AddMascotImages} txtStyle={style?.droptitle}
                        styleMain={{ marginTop: 18, marginHorizontal: 18 }}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", paddingHorizontal: 18, marginTop: 8 }}>
                            {addpicture.concat(["photo"]).map((item, index) => {
                                if (item == "photo") {
                                    if (addpicture?.length > 0) {
                                        return null
                                    }
                                    return <PictureBlock item={item}
                                        key={index.toString()}
                                        onPress={() => {
                                            if (addpicture.length <= 2) {
                                                setGallery(true)
                                                return
                                            }
                                            AppUtils.showToast("Maximum number reached.")
                                        }}
                                    />
                                }
                                return (
                                    <Pressable style={{ width: wp(25), height: wp(25), marginRight: wp(4) }}
                                        key={index.toString()}
                                        onPress={() => {
                                            let temp = [...addpicture]
                                            temp.splice(index, 1)
                                            console.log(temp);
                                            setAddpicture(temp)
                                            writeSignupdata("mascotImages", temp)
                                        }}
                                    >
                                        <FastImage source={{ uri: item?.path }} style={{ width: "100%", height: "100%", borderRadius: 4, }} />
                                        <FastImage source={images.bin} style={{ width: 20, height: 20, position: "absolute", top: 4, right: 8 }} />
                                    </Pressable>
                                )
                            })}
                        </View>
                    </ScrollView>
                    <RequiredTxt txt={localization?.appkeys?.Sports} txtStyle={style?.droptitle}
                        styleMain={{ marginTop: 18, marginHorizontal: 18 }}
                    />
                    <CustomDrop list={list}
                        val={alldata?.sports ? alldata?.sports[0] : ""}
                        setVal={(v) => {
                            writeSignupdata("sports", [v])
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={localization?.appkeys?.headCoach}
                        value={coach1}
                        textInputProps={{
                            autoCapitalize: "words"
                        }}
                        onChangeText={(t) => {
                            setCoach1(t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={false}
                        place={localization?.appkeys?.recruitingCoordinator}
                        value={coach2}
                        textInputProps={{
                            autoCapitalize: "words"
                        }}
                        onChangeText={(t) => {
                            setCoach2(t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={localization?.appkeys?.programEmail}
                        value={alldata?.programEmail}
                        textInputProps={{
                            keyboardType: "email-address",
                            autoCapitalize: "none",
                        }}
                        onChangeText={(t) => {
                            writeSignupdata("programEmail", t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={localization?.appkeys?.ProgramBio}
                        textInputProps={{
                            multiline: true,
                            placeholderTextColor: colors.grey,
                            style: { height: 140, ...Commonstyles.multipleinput },
                            textAlignVertical: "top",
                            maxLength: 400
                        }}
                        value={alldata?.programBio}
                        onChangeText={(t) => {
                            writeSignupdata("programBio", t)
                        }}
                    />
                    <CustomInput
                        place={localization?.appkeys?.SchoolBio}
                        value={alldata?.bio}
                        onChangeText={(t) => {
                            writeSignupdata("bio", t)
                        }}
                        textInputProps={{
                            multiline: true,
                            placeholderTextColor: colors.grey,
                            style: { height: 140, ...Commonstyles.multipleinput },
                            textAlignVertical: "top",
                            maxLength: 400
                        }}
                    />
                    <CustomInput
                        place={localization?.appkeys?.AthleticWebsiteLink}
                        value={alldata?.uniLink}
                        textInputProps={{
                            autoCapitalize: "none",
                            keyboardType: "email-address"
                        }}
                        onChangeText={(t) => {
                            writeSignupdata("uniLink", t)
                        }}
                    />
                    <View style={{ height: hp(6) }} />
                </View>
            }
        />

    )
}

export default AboutUniversity

const useStyles = (colors) => StyleSheet.create({
    parent: {
        flex: 1,
    },
    title: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 20,
        color: colors.text,
        marginTop: 10,
        marginHorizontal: 18
    },
    desc: {
        fontFamily: AppFonts.Medium,
        fontSize: 16,
        color: colors.text,
        marginTop: 8,
        marginHorizontal: 18
    },
    addimage: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 12,
        color: colors.text,
        marginTop: hp(3)
    },
    droptitle: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 12,
        color: colors.text,
        // marginTop: 18,
        // marginHorizontal: 18
    },
    drop: {
        width: wp(90),
        marginHorizontal: 0,
        marginTop: 0
    },
    dropoptions: {
        width: wp(90)
    },
    image: {
        width: wp(26),
        height: wp(26),
        justifyContent: 'center',
        alignItems: "center"
    },
    uploadimage: {
        width: wp(15),
        height: wp(15)
    },
    tac: {
        textAlign: "center"
    },
    medTxt: {
        color: colors.text,
        fontSize: 16,
        fontFamily: AppFonts.Medium,
    },
});