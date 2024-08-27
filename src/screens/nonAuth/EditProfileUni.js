import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomDrop from '../components/CustomDrop';
import CustomBtn from '../components/CustomBtn';
import Commonstyles from '../../utils/commonstyles';
import { useDispatch, useSelector } from 'react-redux';
import { mediaurl } from '../../utils/mediarender';
import CountryPicker from 'react-native-country-picker-modal';
import { PictureBlock } from '../auth/AtheleteSignup/AddMedia';
import AppUtils from '../../utils/appUtils';
import CustomImagePickerModal from '../modals/CustomImagePickerModal';
import { uploadImage } from '../../api/Services/services';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { setUser } from '../../redux/Reducers/userData';
import { setLoading } from '../../redux/Reducers/load';
import { updateProfilePicChats } from '../../utils/updateProfilePicChats';
import RequiredTxt from '../components/RequiredTxt';
import { formatPhoneNumber, parsePhoneNumber } from '../../utils/phonenumberformatter';

const EditProfileUni = ({ navigation }) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state?.userData?.user)
    const sportList = useSelector(state => state?.droplist?.sports)
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys

    const [uniData, setUniData] = useState(null)
    const [mascotImg, setMascotImg] = useState([])
    const [countryModal, setCountryModal] = useState(false)
    const [uploadModal, setUploadModal] = useState(false)
    const [uploadtype, setUploadtype] = useState("profile")
    const [coach1, setCoach1] = useState("")
    const [coach2, setCoach2] = useState("")

    useEffect(() => {
        if (user) {
            setUniData(user)
            setCoach1(user?.coaches[0]?.coachName)
            setCoach2(user?.coaches[1]?.coachName)
        }
        if (user?.mascotImages) {
            setMascotImg(user?.mascotImages)
        }
    }, [user])

    const updateField = useCallback((key, value) => {
        let temp = { ...uniData, [key]: value }
        setUniData(temp)
    }, [uniData])
    const verifyParams = () => {
        if (!coach1 || coach1?.trim() == "") {
            AppUtils.showToast("Coach name is required.")
            return
        }
        if (!uniData?.name) {
            AppUtils.showToast("College/University name is required.")
            return
        }
        if (!uniData?.email) {
            AppUtils.showToast("Email is required.")
            return
        }
        if (!uniData?.phone) {
            AppUtils.showToast("Phone number is required.")
            return
        }
        if (!uniData?.programEmail) {
            AppUtils.showToast("Program Email is required.")
            return
        }
        if (!uniData?.programBio) {
            AppUtils.showToast("Program Bio is required.")
            return
        }
        if (mascotImg?.length == 0) {
            AppUtils.showToast("Mascot image is required.")
            return
        }
        submit()
    }
    const submit = async () => {
        dispatch(setLoading(true))
        let body = { ...uniData, coaches: [{ coachName: coach1 }, { coachName: coach2 }] }
        if (body?.phone) {
            body = { ...body, phone: parsePhoneNumber(body?.phone) }
        }
        if (typeof uniData?.profilePic == 'object') {
            try {
                let res = await uploadImage([uniData?.profilePic])
                body = { ...body, profilePic: res?.data[0] }
            } catch (e) {
            }
        }
        let uploadedimg = []
        let newimg = []
        mascotImg.forEach(e => {
            if (typeof e == "string") {
                uploadedimg.push(e)
            } else {
                newimg.push(e)
            }
        });
        if (newimg.length > 0) {
            try {
                let res = await uploadImage(newimg)
                uploadedimg = uploadedimg.concat(res?.data)
            } catch (error) {
            }
        }
        body = { ...body, mascotImages: uploadedimg }
        try {
            let res = await hit(endpoints.updateself, "patch", body)
            if (!res?.err) {
                let newCoach = res?.data?.coaches?.filter(item1 => !user?.coaches.some(item2 => (item2.coachName === item1.coachName)))
                if (res?.data?.profilePic != user?.profilePic || newCoach?.length > 0) {
                    updateProfilePicChats(res?.data)
                }
                AppUtils.showToast("Updated Sucessfully.")
                dispatch(setUser(res?.data))
                navigation.goBack()
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            AppUtils.showLog(e, "edituni")
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SolidView
            back={true}
            title={appkeys.EditProfile}
            onPressLeft={() => {
                navigation.goBack()
            }}
            view={
                <ScrollView showsVerticalScrollIndicator={false}>
                    {countryModal && <CountryPicker
                        withCallingCode
                        visible={countryModal}
                        onClose={() => setCountryModal(false)}
                        onSelect={(val) => {
                            updateField("cc", val?.callingCode[0])
                        }}
                    />}
                    <CustomImagePickerModal
                        visible={uploadModal}
                        pressHandler={() => {
                            setUploadModal(false)
                        }}
                        attachments={(img) => {
                            if (uploadtype == "profile") {
                                let temp = { ...uniData, profilePic: img }
                                setUniData(temp)
                                return
                            }
                            let temp = [...mascotImg, img]
                            setMascotImg(temp)
                        }}
                    />
                    <Pressable style={{ marginVertical: 20, alignSelf: "center", alignItems: 'center' }}
                        onPress={() => {
                            setUploadtype("profile")
                            setUploadModal(true)
                        }}
                    >
                        <FastImage source={uniData?.profilePic?.path ? { uri: uniData?.profilePic?.path } : { uri: mediaurl(uniData?.profilePic) }} style={{ height: wp(22), width: wp(22), alignSelf: 'center', borderRadius: 100, borderWidth: 2, borderColor: colors.primary }} />
                        <RequiredTxt txt={appkeys?.AddUniPic} txtStyle={[styles.medTxt, styles.tac, { fontSize: 12, color: colors.primary }]} styleMain={{ marginTop: 8, }} />
                    </Pressable>
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.Name}
                        img={images.avatar}
                        value={uniData?.name}
                        textInputProps={{
                            autoCapitalize: "words"
                        }}
                        onChangeText={(t) => {
                            updateField("name", t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.Email}
                        img={images.mail}
                        value={uniData?.email}
                        onChangeText={(t) => {
                            updateField("email", t)
                        }}
                        textInputProps={{
                            editable: false
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.Mobilenumb}
                        img={images.phone}
                        hasCountryCode={true}
                        onPressCountry={() => {
                            setCountryModal(true)
                        }}
                        countrycode={`+${uniData?.cc}`}
                        value={formatPhoneNumber(uniData?.phone)}
                        onChangeText={(t) => {
                            updateField("phone", formatPhoneNumber(t))
                        }}
                        textInputProps={{
                            keyboardType: "numeric",
                            maxLength: Platform?.OS == "ios" ? 10 : 12
                        }}
                    />
                    <CustomInput
                        place={appkeys.AthleticWebsiteLink}
                        value={uniData?.uniLink}
                        textInputProps={{
                            autoCapitalize: "none",
                            keyboardType: "email-address"
                        }}
                        onChangeText={(t) => {
                            updateField("uniLink", t)
                        }}
                    />
                    <RequiredTxt txt={appkeys?.Sports} txtStyle={[styles.placeTxt, { margin: 0, marginBottom: 0 }]} styleMain={{ margin: 18, marginBottom: 8 }} />
                    <CustomDrop
                        // disable={true}
                        list={sportList}
                        val={uniData?.sports[0] ?? ""}
                        setVal={(t) => {
                            updateField("sports", [t])
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys?.headCoach}
                        value={coach1}
                        textInputProps={{
                            autoCapitalize: "words"
                        }}
                        onChangeText={(t) => {
                            setCoach1(t)
                        }}
                    />
                    <CustomInput
                        place={appkeys?.recruitingCoordinator}
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
                        place={appkeys?.programEmail}
                        value={uniData?.programEmail}
                        textInputProps={{
                            autoCapitalize: "none",
                            keyboardType: "email-address"
                        }}
                        onChangeText={(t) => {
                            updateField("programEmail", t)
                        }}
                    />
                    <CustomInput
                        place={appkeys.SchoolBio}
                        textInputProps={{
                            multiline: true,
                            style: { height: 140, ...Commonstyles.multipleinput },
                            textAlignVertical: "top",
                            maxLength: 400
                        }}
                        value={uniData?.bio}
                        onChangeText={(t) => {
                            updateField("bio", t)
                        }}
                    />
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.ProgramBio}
                        textInputProps={{
                            multiline: true,
                            style: { height: 140, ...Commonstyles.multipleinput },
                            textAlignVertical: "top",
                            maxLength: 400
                        }}
                        value={uniData?.programBio}
                        onChangeText={(t) => {
                            updateField("programBio", t)
                        }}
                    />
                    <RequiredTxt txt={appkeys.MascotImages} txtStyle={styles.semibTxt} styleMain={{ margin: 18, marginBottom: 8 }} />
                    <FlatList
                        data={mascotImg.concat("select")}
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 18 }}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            if (item == "select") {
                                if (mascotImg.length > 0) {
                                    return null
                                }
                                return <PictureBlock
                                    styleMain={{ height: wp(30), marginBottom: 18, width: wp(30) }}
                                    onPress={() => {
                                        setUploadtype("mascot")
                                        if (mascotImg.length < 3) {
                                            setUploadModal(true)
                                            return
                                        }
                                        AppUtils.showToast("Maximum number reached.")
                                    }}
                                />
                            }
                            return (
                                <View style={{ height: wp(30), marginBottom: 18, width: wp(30), marginRight: wp(3), borderRadius: 4, justifyContent: "center", alignItems: "center" }}>
                                    <FastImage source={item?.path ? { uri: item?.path } : { uri: mediaurl(item) }} style={{ height: "100%", width: "100%", borderRadius: 4 }} />
                                    <Pressable style={{ height: 26, width: 26, position: 'absolute', top: 4, right: 4, zIndex: 10 }}
                                        onPress={() => {
                                            let temp = [...mascotImg]
                                            temp.splice(index, 1)
                                            setMascotImg(temp)
                                        }}
                                    >
                                        <FastImage source={images.bin} style={{ height: "100%", width: "100%" }} resizeMode='contain' />
                                    </Pressable>
                                </View>
                            )
                        }}
                    />
                    <CustomBtn
                        titleTxt={appkeys.Update}
                        onPress={() => {
                            verifyParams()
                        }}
                    />
                    <View style={{ height: hp(6) }} />
                </ScrollView>
            }
        />
    )
}

export default EditProfileUni

const useStyles = (colors) => StyleSheet.create({
    tac: {
        textAlign: "center"
    },
    medTxt: {
        color: colors.text,
        fontSize: 16,
        fontFamily: AppFonts.Medium,
    },
    semibTxt: {
        color: colors.text,
        fontSize: 20,
        fontFamily: AppFonts.SemiBold,
    },
    placeTxt: {
        fontSize: 12, color: colors.text, fontFamily: AppFonts.SemiBold,
        margin: 18, marginBottom: 4
    }
})