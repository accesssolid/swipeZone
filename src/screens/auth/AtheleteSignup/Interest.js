import { View, Text, StyleSheet, FlatList, SafeAreaView, TextInput, Pressable, ScrollView, Platform } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { hp, wp } from '../../../utils/dimension'
import { useTheme } from '@react-navigation/native'
import { LocalizationContext } from "../../../localization/localization";
import AppFonts from '../../../constants/fonts';
import AuthContainer from '../../components/AuthContainer';
import AppRoutes from '../../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { authorize, setAuth, setIsAthlete, setUser } from '../../../redux/Reducers/userData';
import InterestBlock from '../../components/RenderItem';
import AppUtils from '../../../utils/appUtils';
import { clearSignupdata, setSignupdata } from '../../../redux/Reducers/signup';
import { uploadImage, uploadImagesFetchblob, uploadVideos, uploadVideosFetchblob } from '../../../api/Services/services';
import { setLoading } from '../../../redux/Reducers/load';
import { endpoints } from '../../../api/Services/endpoints';
import hit from '../../../api/Manager/manager';
import convertHeightToFeet from '../../../utils/heightunit';
import { storeData } from '../../../utils/asyncStore';
import CheckBoxBlock from '../../components/CheckBoxBlock';
import { parsePhoneNumber } from '../../../utils/phonenumberformatter';
import { setUserHasCred } from '../../../redux/Reducers/userCred';
import { getSubFeatures } from '../../../redux/Reducers/subcriptions';

const Interest = ({ navigation, }) => {
    const dispatch = useDispatch()
    const alldata = useSelector(state => state?.signup?.signupdata)
    const majors = useSelector(state => state?.droplist?.majors)

    const inputRef = useRef(null)
    const { colors } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const [Data, setData] = useState(['Agricultural Science', 'Architecture', 'Art', 'Business management', 'Communications', 'Computer Science', 'Criminal Justice', 'Film', 'Economics', 'Education', 'Global Studies', 'Engineering', 'Graphic Design', 'History', 'Kinesiology', 'Sports Management', 'Nursing', 'Religious Studies', 'Political Science', 'Law', 'Other'])
    const [planMajors, setPlanMajors] = useState([])
    const [major, setMajor] = useState("")

    useEffect(() => {
        if (alldata?.planMajors) {
            setPlanMajors(alldata?.planMajors)
        }
    }, [alldata])
    useEffect(() => {
        if (majors) {
            let temp = [...majors].sort()
            setData(temp)
        }
    }, [majors])

    const writeSignupdata = useCallback((key, value) => {
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])
    const endingFunction = (txt) => {
        dispatch(setLoading(false))
        txt && AppUtils.showToast(txt)
    }
    const submit = () => {
        if (planMajors?.length == 0) {
            AppUtils.showToast("Select at least one major.")
            return
        }
        uploadProfilePic(alldata)
    }
    const uploadProfilePic = async (data) => {
        let body = { ...data }
        dispatch(setLoading(true))
        if (!body?.profilePic) {
            body = { ...body, profilePic: endpoints?.default_pic }
            // uploadMedia(body)
            uploadThumbnails(body)
            // uploadMediaVideos(body)
        } else {
            try {
                let res = await uploadImagesFetchblob([body?.profilePic])
                // let res = await uploadImage([body?.profilePic])
                AppUtils.showLog(res, "profilePicture upload");
                if (res?.data) {
                    if (res?.data?.length > 0) {
                        body = { ...body, profilePic: JSON.parse(res?.data)?.[0] }
                        // body = { ...body, profilePic: res?.data[0] }
                        // uploadMedia(body)
                        // uploadMediaVideos(body)
                        uploadThumbnails(body)
                    } else {
                        endingFunction("Something went wrong while uploading profile picture.")
                        return
                    }
                } else {
                    dispatch(setLoading(false))
                    AppUtils.showToast("Something went wrong")
                }
            } catch (err) {
                AppUtils.showLog(err, "uploading profilepic");
            } finally {
            }
        }
    }
    const uploadMedia = async (data) => {
        let body = { ...data }
        if (body?.profilePic) {
            if (typeof body?.profilePic != "string") {
                endingFunction("Something went wrong while uploading profile picture.")
                return
            }
        } else {
            endingFunction("Something went wrong while uploading profile picture.")
            return
        }
        // try {
        //     let res = await uploadImagesFetchblob(body?.photos)
        //     AppUtils.showLog(res, "media upload");
        //     if (res?.data) {
        //         body = { ...body, photos: JSON.parse(res?.data) }
        //         // body = { ...body, photos: res?.data }
        //         // uploadMediaVideos(body)
        //     } else {
        //         AppUtils.showToast(res?.msg);
        //         dispatch(setLoading(false))
        //     }
        // } catch (err) {
        //     AppUtils.showLog(err, "media upload error");
        // }
        if (body.loginType == "social") {
            updateData(body)
            return
        }
        signUP(body)
    }
    const uploadThumbnails = async (body) => {
        let thumbs = body?.videos?.map(x => ({ path: x?.thumb, mime: "image/png" }))
        try {
            let res = await uploadImagesFetchblob(thumbs)
            if (res?.data) {
                let temp = JSON.parse(res?.data)
                uploadMediaVideos(body, temp)
            }
        } catch (e) {
        } finally {
        }
    }
    const uploadMediaVideos = async (data, th) => {
        let body = { ...data }
        try {
            let res = await uploadVideosFetchblob(body?.videos)
            console.log(res, "video");
            if (res?.data) {
                let videoarr = [...JSON.parse(res?.data)]
                let resultArray = videoarr.map(function (obj, index) {
                    return {
                        link: obj.link,
                        thumb: th[index]
                    };
                });
                body = { ...body, videos: resultArray }
                // body = { ...body, videos: JSON.parse(res?.data) }
            } else {
                dispatch(setLoading(false))
            }
        } catch (e) {
        }
        // console.log(body);
        // return
        if (body.loginType == "social") {
            updateData(body)
            return
        }
        signUP(body)
    }
    const signUP = async (data) => {
        let body = { ...data, os: Platform?.OS }
        if (body?.videos) {
            await body?.videos.forEach(e => {
                if (!e?.link) {
                    endingFunction("Something went wrong while uploading videos.")
                    return
                }
                if (typeof e?.link != "string") {
                    endingFunction("Something went wrong while uploading videos.")
                    return
                }
            });
        } else {
            endingFunction("Something went wrong while uploading videos.")
            return
        }
        if (body?.height) {
            body = { ...body, height: body?.height, heightUnit: "ft" }
        }
        if (body?.phone) {
            body = { ...body, phone: parsePhoneNumber(body?.phone) }
        }
        if (body?.hsCPhone) {
            body = { ...body, hsCPhone: parsePhoneNumber(body?.hsCPhone) }
        }
        if (body?.travelCoachContact) {
            body = { ...body, travelCoachContact: parsePhoneNumber(body?.travelCoachContact) }
        }
        if (body?.confirmpassword) {
            delete body.confirmpassword
        }
        if (body?.userType) {
            delete body.userType
        }
        if (body.hasOwnProperty('programBio')) {
            delete body.programBio
        }
        if (body.hasOwnProperty('programEmail')) {
            delete body.programEmail
        }
        if (body.hasOwnProperty('uniLink')) {
            delete body.uniLink
        }
        if (body.hasOwnProperty('coaches')) {
            delete body.coaches
        }
        console.log(body, "finalllllll");
        try {
            let res = await hit(endpoints.registerAthelete, "post", body)
            AppUtils.showLog(res, "signup");
            if (!res?.err) {
                storeData("@tokens", res?.data?.tokens)
                dispatch(authorize({ user: res?.data?.user }))
                dispatch(getSubFeatures(res?.data?.user))
                dispatch(setIsAthlete(true))
                dispatch(clearSignupdata())
                dispatch(setLoading(false))
                dispatch(setUserHasCred(true))
                AppUtils.showToast("Account created sucessfully.")
                setTimeout(() => {
                    navigation.replace(AppRoutes.Subscription, { signup: "signup" })
                }, 40);
                // navigation.navigate(AppRoutes.NonAuthStack)
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (err) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const updateData = async (data) => {
        let body = { ...data, os: Platform?.OS }
        if (body?.height) {
            body = { ...body, height: body?.height, heightUnit: "ft" }
        }
        if (body?.phone) {
            body = { ...body, phone: parsePhoneNumber(body?.phone) }
        }
        if (body?.hsCPhone) {
            body = { ...body, hsCPhone: parsePhoneNumber(body?.hsCPhone) }
        }
        if (body?.confirmpassword) {
            delete body.confirmpassword
        }
        if (body?.userType) {
            delete body.userType
        }
        if (body?.loginType) {
            delete body.loginType
        }
        if (body.hasOwnProperty('programBio')) {
            delete body.programBio
        }
        if (body.hasOwnProperty('programEmail')) {
            delete body.programEmail
        }
        if (body.hasOwnProperty('uniLink')) {
            delete body.uniLink
        }
        if (body.hasOwnProperty('coaches')) {
            delete body.coaches
        }
        try {
            let res = await hit(endpoints.updateself, "patch", body)
            if (!res?.err) {
                dispatch(authorize({ user: res?.data }))
                dispatch(setIsAthlete(true))
                dispatch(clearSignupdata())
                dispatch(setLoading(false))
                dispatch(setUserHasCred(true))
                AppUtils.showToast("Account created sucessfully.")
                setTimeout(() => {
                    navigation.replace(AppRoutes.Subscription, { signup: "signup" })
                }, 40);
                // setTimeout(() => {
                //     navigation.replace(AppRoutes.Subscription, { signup: "signup" })
                // }, 100);
                // setTimeout(() => {
                //     navigation.navigate(AppRoutes.Subscription, { signup: "signup" })
                // }, 100);
                // navigation.navigate(AppRoutes.NonAuthStack)
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (err) {
            console.log(err);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const addMajor = () => {
        if (major.trim() == "") {
            return
        }
        if (Data?.includes(major)) {
            let temp = [...planMajors]
            let ind = temp.indexOf(major)
            if (ind == -1) {
                if (temp?.length < 3) {
                    temp.push(major)
                } else {
                    AppUtils.showToast("You can only select 3 majors.")
                }
            } else {
                temp.splice(ind, 1)
            }
            setPlanMajors(temp)
        } else {
            let temp = [...Data]
            temp.splice(0, 0, major.trim())
            temp.sort()
            setData(temp)
            let x = [...planMajors]
            if (x?.length < 3) {
                x.push(major)
                writeSignupdata("planMajors", x)
                setPlanMajors(x)
            }
        }
        setMajor("")
    }
    const undecidedHandler = (item) => {
        let temp = [...planMajors]
        let ind = temp.indexOf(item)
        if (ind == -1) {
            if (!(temp.length < 3)) {
                AppUtils.showToast("Maximum number reached.")
                return
            }
            temp?.push(item)
        } else {
            temp.splice(ind, 1)
        }
        setPlanMajors(temp)
        writeSignupdata("planMajors", temp)
    }
    return (
        <AuthContainer
            signupfooter
            progress={"80%"}
            onPressBack={() => {
                // dispatch(setSignupdata({ ...alldata, "planMajors": [] }))
                // setPlanMajors([])
                navigation.goBack()
            }}
            onPressNext={() => {
                submit()
            }}
            children={
                <View style={styles.main}>
                    <Text style={[styles.Titletext, { color: colors.black }]}>{localization?.appkeys?.Planned_Majors}</Text>
                    <Text style={[styles.SubTitletext, { color: colors.black, fontFamily: AppFonts.Regular, fontSize: 14 }]}>{localization?.appkeys?.Select_passionate}</Text>
                    {/* <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginTop: 8, marginHorizontal: 18 }}>
                        <TextInput
                            ref={inputRef}
                            placeholder='Type your majors'
                            value={major}
                            onChangeText={(t) => { setMajor(t) }}
                            style={{ height: 52, width: "76%", alignSelf: "center", paddingLeft: 6, borderColor: colors.primary, borderWidth: 2, borderRadius: 4, fontFamily: AppFonts.Medium, fontSize: 14, color: colors.text }}
                            onSubmitEditing={() => {
                                addMajor()
                            }}
                        />
                        <Pressable
                            style={{ backgroundColor: major?.length == 0 ? "transparent" : colors.primary, borderWidth: 2, borderColor: colors.primary, height: 52, width: "16%", justifyContent: "center", alignItems: "center", flexDirection: "row", alignItems: "center", borderRadius: 4 }}
                            onPress={() => addMajor()}
                        >
                            <Text style={{ fontFamily: AppFonts.Medium, fontSize: 16, color: major?.length == 0 ? colors.primary : colors.white }}>{localization?.appkeys?.Add}</Text>
                        </Pressable>
                    </View> */}
                    <CheckBoxBlock txt={localization?.appkeys?.Undecided} arr={planMajors} onPress={(data) => undecidedHandler(data)} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FlatList
                            data={Data}
                            numColumns={2}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ marginHorizontal: 8 }}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <InterestBlock item={item} index={index} arr={planMajors}
                                        onPress={() => {
                                            if (item == "Other") {
                                                inputRef?.current?.focus()
                                                return
                                            }
                                            let temp = [...planMajors]
                                            let ind = temp.indexOf(item)
                                            if (ind == -1) {
                                                if (planMajors?.length < 3) {
                                                    temp.push(item)
                                                } else {
                                                    AppUtils.showToast("You can only select 3 majors.")
                                                }
                                            } else {
                                                temp.splice(ind, 1)
                                            }
                                            writeSignupdata("planMajors", temp)
                                            setPlanMajors(temp)
                                        }}
                                    />
                                )
                            }}
                            ListFooterComponent={() => {
                                return <CheckBoxBlock arr={planMajors} txt={localization?.appkeys?.notlisted} onPress={(data) => undecidedHandler(data)} />
                            }}
                        />
                    </ScrollView>
                </View>
            }
        />
    )
}

export default Interest
const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    Titletext: {
        fontSize: 22, marginHorizontal: 18, marginVertical: 5,
        fontFamily: AppFonts?.SemiBold
    },
    SubTitletext: {
        fontSize: 16, marginHorizontal: 18, marginVertical: 5,
        lineHeight: 19, fontFamily: AppFonts?.Medium
    }
}
)