import { ActivityIndicator, FlatList, Keyboard, Linking, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import AuthContainer from '../../components/AuthContainer'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../../localization/localization';
import AppFonts from '../../../constants/fonts';
import CustomInput from '../../components/CustomInput';
import CustomDrop from '../../components/CustomDrop';
import { hp, wp } from '../../../utils/dimension';
import AppRoutes from '../../../routes/RouteKeys/appRoutes';
import Commonstyles from '../../../utils/commonstyles'
import { useDispatch, useSelector } from 'react-redux';
import { clearSignupdata, setSignupdata } from '../../../redux/Reducers/signup';
import AppUtils from '../../../utils/appUtils';
import CountryPicker from 'react-native-country-picker-modal';
import { selectContactPhone } from 'react-native-select-contact';
import RequiredTxt from '../../components/RequiredTxt';
import { City, State } from 'country-state-city';
import { generateDecimalNumbersArray, generateHeightsArray } from '../../../utils/heightunit';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { formatPhoneNumber, formatPhoneNumber2, parsePhoneNumber } from '../../../utils/phonenumberformatter';
import { getPositionSports, uploadImagesFetchblob, uploadVideosFetchblob } from '../../../api/Services/services';
import MultichoiceQn from '../../components/MultichoiceQn';
import { PictureBlock } from './AddMedia';
import FastImage from 'react-native-fast-image';
import ImageCropPicker from 'react-native-image-crop-picker';
import TrimmerModal from '../../modals/TrimmerModal';
import CameraModal from '../../modals/CameraModal';
import { Video, createVideoThumbnail } from 'react-native-compressor';
import { endpoints } from '../../../api/Services/endpoints';
import { setLoading } from '../../../redux/Reducers/load';
import hit from '../../../api/Manager/manager';
import CompleteProfileModal from '../../modals/CompleteProfileModal';
import { getUserDetailThunk } from '../../../redux/Reducers/userData';
import userAnalytics, { USEREVENTS } from '../../../utils/userAnalytics';
import CustomImagePickerModal from '../../modals/CustomImagePickerModal';

const AboutUser = ({ navigation }) => {
    const dispatch = useDispatch()
    const alldata = useSelector(state => state?.signup?.signupdata)
    const user = useSelector(state => state?.userData?.user)
    const sportList = useSelector(state => state?.droplist?.sports)

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);

    const [countrycode, setCountrycode] = useState("1")
    const [ccmode, setCcmode] = useState(0)
    const [tcCountrycode, setTcCountrycode] = useState("1")
    const [countryModal, setCountryModal] = useState(false)
    const [positionList, setPositionList] = useState([])
    const [gettingPos, setGettingPos] = useState(false)
    const country = "US"
    const [stateList, setStateList] = useState([])
    const [allCities, setAllCities] = useState([])
    const gpaList = generateDecimalNumbersArray(2.0, 4.0, 0.1)
    const [ts, setTs] = useState(false)
    const heightList = generateHeightsArray(5, 8)
    const [heightIni, setHeightIni] = useState(0)
    const [addvideo, setAddvideo] = useState([])
    const reqVideo = Array(4 - addvideo?.length).fill("video")
    const [gallery, setGallery] = useState(false)
    const [showCompressModal, setShowCompressModal] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showTrimModal, setShowTrimModal] = useState(false)
    const [trimVideo, setTrimVideo] = useState(null)
    const [mediaType, setMediaType] = useState("photo")
    const [dataFilled, setDataFilled] = useState(false)
    const [showCompletePopup, setShowCompletePopup] = useState(false)
    const [profilePic, setProfilePic] = useState(null)
    const [showPicker, setShowPicker] = useState(false)

    useEffect(() => {
        setStateList(State.getStatesOfCountry(country)?.filter(x => !x?.isoCode?.includes("UM") && !x?.isoCode?.includes("AS") && !x?.isoCode?.includes("GU") && !x?.isoCode?.includes("MP")))
        dispatch(setSignupdata({ ...alldata, travelCoachCC: tcCountrycode, hsCcc: countrycode, heightString: `5'0"`, gpa: "2.0" }))
        // dispatch(setSignupdata({ ...alldata, travelCoachCC: tcCountrycode, hsCcc: countrycode, heightString: `5'0"`, gpa: "2.0", collegeTransferringFrom: alldata?.collegeTransferringFrom ?? "high" }))
    }, [])
    useEffect(() => {
        setDataFilled(checkDataFilled())
        if (alldata) {
            updateCityArray(alldata?.state)
        }
        if (alldata?.profilePic) {
            setProfilePic(alldata?.profilePic)
        }
        // if (alldata?.photos) {
        //     setAddpicture(alldata?.photos)
        // }
        if (alldata?.videos) {
            setAddvideo(alldata?.videos)
        }
    }, [alldata])
    useEffect(() => {
        if (positionList?.length == 0) {
            if (alldata?.sports?.length) {
                getSportsId(alldata?.sports?.[0])
            }
        }
    }, [alldata, positionList])
    useEffect(() => {
        if (user?.collegeTransferringFrom == "high") {
            setTs(false)
        } else {
            setTs(true)
        }
    }, [user])
    // useEffect(() => {
    //     if (alldata?.collegeTransferringFrom == "high") {
    //         setTs(false)
    //     } else {
    //         setTs(true)
    //     }
    // }, [alldata?.collegeTransferringFrom])
    useEffect(() => {
        if (positionList?.length == 0) {
            if (user?.sports?.length) {
                getSportsId(user?.sports?.[0])
            } else {
                getUserSport()
            }
        }
    }, [user, positionList])

    const getUserSport = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.updateself, "get")
            if (res?.data) {
                let sports = res?.data?.sports?.[0]
                getSportsId(sports)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function getPhoneNumber(coachType) {
        // on android we need to explicitly request for contacts permission and make sure it's granted
        // before calling API methods
        if (Platform.OS === 'android') {
            const request = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            );
            // denied permission
            if (request === PermissionsAndroid.RESULTS.DENIED) throw Error("Permission Denied");
            // user chose 'deny, don't ask again'
            else if (request === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) throw Error("Permission Denied");
        }
        // Here we are sure permission is granted for android or that platform is not android
        const selection = await selectContactPhone();
        if (!selection) {
            return null;
        }
        let { contact, selectedPhone } = selection;
        const numberString = selectedPhone.number.toString();
        const stringWithoutSpaces = numberString.replace(/\s+/g, '');
        const stringWithoutSpecialChars = stringWithoutSpaces.replace(/[^\w\s]/gi, '');
        const lastTenDigits = stringWithoutSpecialChars.slice(-10);
        if (coachType == 0) {
            dispatch(setSignupdata({ ...alldata, hsCoach: contact?.name, hsCPhone: formatPhoneNumber2(lastTenDigits) }))
        } else {
            dispatch(setSignupdata({ ...alldata, travelCoach: contact?.name, travelCoachContact: formatPhoneNumber2(lastTenDigits) }))
        }
    }
    const updateCityArray = (name) => {
        let temp = [...stateList]
        let isoCode = temp.filter(x => x?.name == name)[0]?.isoCode || ""
        setTimeout(() => {
            setAllCities(City.getCitiesOfState(country, isoCode))
        }, 400);
    }
    const writeSignupdata = useCallback((key, value) => {
        if (key == "sports") {
            dispatch(setSignupdata({ ...alldata, [key]: value, position1: "", position2: "" }))
            return
        }
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])

    const uploadThumbnails = async (body) => {
        dispatch(setLoading(true))
        let thumbs = body?.videos?.map(x => ({ path: x?.thumb, mime: "image/png" }))
        try {
            let res = await uploadImagesFetchblob(thumbs)
            console.log(res, "thumbnails");
            if (res?.data) {
                let temp = JSON.parse(res?.data)
                uploadMediaVideos(body, temp)
            } else {
                AppUtils.showToast('Something went wrong.')
                dispatch(setLoading(false))
            }
        } catch (e) {
            console.error(e);
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
            } else {
                dispatch(setLoading(false))
            }
        } catch (e) {
            console.error(e);
        }
        onPressNext(body)
    }
    const onPressNext = async (data) => {
        let body = { ...data, currentStep: 2 }
        if (body?.profilePic) {
            let profileImage = await uploadProfilePic(body?.profilePic)
            if (profileImage?.error) {
                dispatch(setLoading(false))
                AppUtils.showToast('Failed Image Upload.')
                return
            } else {
                body = { ...body, profilePic: profileImage?.image }
            }
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
                userAnalytics(USEREVENTS.onboardingComplete, { userId: user?._id, platform: Platform.OS })
                // userAnalytics(USEREVENTS.profileCompleted, { userId: user?._id })
                dispatch(clearSignupdata())
                dispatch(getUserDetailThunk())
                AppUtils.showToast("Profile Updated.")
                setTimeout(() => {
                    navigation.navigate(AppRoutes.BottomTab)
                }, 40);
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }

        // if (alldata?.sports?.length == 0 || alldata?.sports?.[0] == "" || !alldata?.sports) {
        //     AppUtils.showToast("Select your sport.")
        //     return
        // }
        // if (!alldata?.position1 || !alldata?.position2) {
        //     AppUtils.showToast("Position is required.")
        //     return
        // }
        // if (!alldata?.bio) {
        //     AppUtils.showToast("Bio is required.")
        //     return
        // }
        // if (!alldata?.gpa) {
        //     AppUtils.showToast("GPA is required.")
        //     return
        // }
        // if (!alldata?.state) {
        //     AppUtils.showToast(ts ? "Residence State is required." : "State is required.")
        //     return
        // }
        // if (!alldata?.city) {
        //     AppUtils.showToast(ts ? "Residence City is required." : "City is required.")
        //     return
        // }
        // if (alldata?.collegeTransferringFrom == "high") {
        //     if (!alldata?.highSchoolName) {
        //         AppUtils.showToast("High school name is required.")
        //         return
        //     }
        // } else {
        //     if (!alldata?.transferStudent) {
        //         AppUtils.showToast("Transfer school name is required.")
        //         return
        //     }
        // }
        // // if (!alldata?.satScore) {
        // //     AppUtils.showToast("SAT is required.")
        // //     return
        // // }
        // if (alldata?.hsCoach && !alldata?.hsCPhone) {
        //     AppUtils.showToast("High school coach phone is required.")
        //     return
        // }
        // if (!alldata?.hsCoach && alldata?.hsCPhone) {
        //     AppUtils.showToast("High school coach is required.")
        //     return
        // }
        // if (alldata?.hsCoach && alldata?.hsCPhone) {
        //     if (alldata?.hsCPhone?.length < 10) {
        //         AppUtils.showToast("High school coach phone number not valid.")
        //         return
        //     }
        // }
        // if (alldata?.travelCoach && !alldata?.travelCoachContact) {
        //     AppUtils.showToast("Travel coach contact is required.")
        //     return
        // }
        // if (!alldata?.travelCoach && alldata?.travelCoachContact) {
        //     AppUtils.showToast("Travel coach is required.")
        //     return
        // }
        // if (alldata?.travelCoachContact?.length < 10) {
        //     AppUtils.showToast("Travel coach contact number not valid.")
        //     return
        // }
        // navigation.navigate(AppRoutes.UserHeightdetail)
    }
    // const formatPhoneNumber = (input) => {
    //     // Remove any non-digit characters from the input
    //     const cleanedInput = input.replace(/\D/g, '');

    //     // Check if the input is not empty and is a valid number
    //     if (cleanedInput && !isNaN(cleanedInput)) {
    //         // Format the phone number as "111-111-1111"
    //         const formattedNumber = cleanedInput.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    //         writeSignupdata("hsCPhone", formattedNumber)
    //     } else {
    //         // If the input is empty or not a valid number, clear the state
    //         writeSignupdata("hsCPhone", input)
    //     }
    // };
    const getSportsId = (sportName) => {
        let sport = sportList?.filter(x => x?.name == sportName)
        let id = sport?.[0]?._id
        getSportsPos(id)
    }
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
    async function OpenCamera() {
        let mediaType = 'video'
        let cameraAccess = await AppUtils.checkCameraPermisssion()
        if (!cameraAccess) {
            Linking.openSettings()
            return
        }
        ImageCropPicker.openCamera({
            mediaType: mediaType,
            multiple: true,
            compressVideoPreset: "MediumQuality",
            maxFiles: 1
        }).then(image => {
            setGallery(false)
            if (mediaType == "video") {
                if (image?.duration < 45000) {
                    createVidThumbnail([image])
                    return
                }
                setTrimVideo(image)
                setShowTrimModal(true)
                return
            }
            let temp = addpicture.concat([image])
            setAddpicture(temp)
            writeSignupdata("photos", temp)
        });
    }
    async function OpenImage() {
        let mediaType = 'video'
        let galleryAccess = await AppUtils.checkGalleryPermisssion()
        if (!galleryAccess) {
            Linking.openSettings()
            return
        }
        ImageCropPicker.openPicker({
            mediaType: mediaType,
            multiple: false,
            compressVideoPreset: "MediumQuality",
        }).then(image => {
            setGallery(false)
            if (mediaType == "video") {
                if (image?.duration < 2000) {
                    AppUtils.showToast("Select video of more than 2 seconds.")
                    return
                }
                if (image?.duration < 45000) {
                    createVidThumbnail([image])
                    return
                }
                setTrimVideo(image)
                setShowTrimModal(true)
                return
            }
            let temp = addpicture.concat([...image])
            setAddpicture(temp)
            writeSignupdata("photos", temp)
            // if (mediaType == "video") {
            //     if (image[0]?.duration < 2000) {
            //         AppUtils.showToast("Select video of more than 2 seconds.")
            //         return
            //     }
            //     if (image[0]?.duration < 45000) {
            //         createVidThumbnail(image)
            //         return
            //     }
            //     setTrimVideo(image[0])
            //     setShowTrimModal(true)
            //     return
            // }
            // let temp = addpicture.concat([...image])
            // setAddpicture(temp)
            // writeSignupdata("photos", temp)
        })
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
    const createVidThumbnail = async (arr) => {
        try {
            setShowCompressModal(true)
            let e = arr[0]
            const thumbnail = await createVideoThumbnail(e?.path);
            const result = await Video.compress(e?.path, { compressionMethod: 'manual', }, (progress) => {
                // console.log('Compression Progress: ', progress);
                setProgress(progress)
            });
            let vid = { ...e, thumb: thumbnail?.path, path: result }
            let allMedia = [...addvideo]
            allMedia.push(vid)
            setAddvideo(allMedia)
            writeSignupdata("videos", allMedia)
            setShowCompressModal(false)
            setProgress(0)
        } catch (e) {
            AppUtils.showLog(e, "eroorrr")
        }
    }
    const checkDataFilled = useCallback(() => {
        //MARK:User Detail
        // if (alldata?.sports?.length == 0 || alldata?.sports?.[0] == "" || !alldata?.sports) {
        //     return false
        // }
        if (!alldata?.position1 || !alldata?.position2) {
            return false
        }
        // if (!alldata?.bio) {
        //     return false
        // }
        // if (!alldata?.gpa) {
        //     return false
        // }
        // if (!alldata?.state) {
        //     return false
        // }
        // if (!alldata?.city) {
        //     return false
        // }
        if (!alldata?.profilePic) {
            return false
        }
        if (!ts) {
            if (!alldata?.highSchoolName) {
                return false
            }
        } else {
            if (!alldata?.transferStudent) {
                return false
            }
        }
        // if (!alldata?.satScore) {
        // return false
        // }
        // if (alldata?.hsCoach && !alldata?.hsCPhone) {
        //     return false
        // }
        // if (!alldata?.hsCoach && alldata?.hsCPhone) {
        //     return false
        // }
        // if (alldata?.hsCoach && alldata?.hsCPhone) {
        //     if (alldata?.hsCPhone?.length < 10) {
        //         return false
        //     }
        // }
        // if (alldata?.travelCoach && !alldata?.travelCoachContact) {
        //     return false
        // }
        // if (!alldata?.travelCoach && alldata?.travelCoachContact) {
        //     return false
        // }
        // if (alldata?.travelCoachContact?.length < 10) {
        //     return false
        // }

        // MARK: Height
        if (!alldata?.heightString) {
            return false
        }
        if (!alldata?.weight) {
            return false
        }
        // if (!alldata?.gradYear) {
        //     return false
        // }
        if (alldata?.weight > 999 || alldata?.weight < 100) {
            return false
        }

        //MARK:Video 
        if (addvideo?.length < 2) {
            return false
        }
        return true
    }, [alldata])

    return (
        <AuthContainer
            signupfooter
            progress={"100%"}
            t1={'Skip'}
            onPressBack={() => {
                userAnalytics(USEREVENTS.skipselected, { user: "", platform: Platform.OS })
                setShowCompletePopup(true)
                // navigation.goBack()
                // navigation.navigate(AppRoutes.BottomTab)
            }}
            styleNextBtn={{ backgroundColor: dataFilled ? colors.primary : colors.lightGrey }}
            onPressNext={() => {
                userAnalytics(USEREVENTS.nextselected, { user: "", platform: Platform.OS })
                if (dataFilled)
                    uploadThumbnails(alldata)
                // onPressNext(alldata)
            }}
            children={
                <View>
                    <CompleteProfileModal
                        vis={showCompletePopup}
                        onSkip={() => {
                            userAnalytics(USEREVENTS.reminderPromptSkipSelected, { user: "", platform: Platform.OS })
                            setShowCompletePopup(false)
                            setTimeout(() => {
                                navigation.navigate(AppRoutes.BottomTab)
                            }, 40);
                        }}
                        onPress={() => {
                            userAnalytics(USEREVENTS.reminderPromptCompleteNowSelected, { user: "", platform: Platform.OS })
                            setShowCompletePopup(false)
                        }}
                    />
                    <CustomImagePickerModal
                        visible={showPicker}
                        attachments={(img) => {
                            writeSignupdata("profilePic", img)
                        }}
                        onPress={() => setShowPicker(false)}
                        pressHandler={() => { setShowPicker(false) }}
                    />
                    {countryModal && <CountryPicker
                        withCallingCode
                        visible={countryModal}
                        onClose={() => setCountryModal(false)}
                        onSelect={(val) => {
                            if (ccmode == 1) {
                                setTcCountrycode(val?.callingCode[0])
                                writeSignupdata("travelCoachCC", val?.callingCode[0])
                                setCcmode(0)
                                return
                            }
                            setCountrycode(val?.callingCode[0])
                            writeSignupdata("hsCcc", val?.callingCode[0])
                        }}
                    />}
                    <TrimmerModal
                        visible={showTrimModal}
                        item={trimVideo}
                        onPressCancel={() => setShowTrimModal(false)}
                        totalduration={trimVideo?.duration}
                        trimDuration={45000}
                        onTrimPress={async (vid) => {
                            let newvid = await vid
                            let allMedia = [...addvideo];
                            allMedia.push(newvid)
                            setAddvideo(allMedia)
                            writeSignupdata("videos", allMedia)
                        }}
                    />
                    <CameraModal
                        vis={gallery}
                        title={"Video"}
                        onPress={() => setGallery(false)}
                        onPressCamera={() => { OpenCamera() }}
                        onPressGallery={() => { OpenImage() }}
                    />
                    {/* <Text style={[styles.semibTxt, { marginHorizontal: 18, marginVertical: 18, marginBottom: 8 }]}>{appkeys.AboutYou}</Text>
                    <Text style={[styles.medTxt, { margin: 18, marginTop: 0 }]}>{appkeys.Canchangelater}</Text> */}
                    {/* <RequiredTxt txt={appkeys.Sports} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginTop: 16 }} />
                    <CustomDrop
                        place={appkeys.Sports}
                        list={sportList}
                        val={alldata?.sports ? alldata?.sports[0] : ""}
                        allData={true}
                        selectedData={(v) => {
                            getSportsPos(v?._id)
                        }}
                        setVal={(v) => {
                            writeSignupdata("sports", [v])
                            // let temp = sportList.filter(x => x?.name == v)
                            // setPositionList(temp[0]?.data)
                        }}
                    /> */}
                    {/* <MultichoiceQn
                        required={false}
                        list={[{ label: "High School Athlete", value: "high" }, { label: "Transfer Athlete", value: "transfer" }]}
                        value={alldata?.collegeTransferringFrom}
                        onChange={(t) => {
                            writeSignupdata("collegeTransferringFrom", t)
                        }}
                    /> */}
                    <Pressable style={{ marginVertical: 20, alignSelf: "center" }}
                        onPress={() => { setShowPicker(true) }}
                    >
                        <FastImage source={profilePic ? { uri: profilePic?.path } : images.lib} style={{ height: wp(22), width: wp(22), alignSelf: 'center', borderRadius: wp(22), borderWidth: 1, borderColor: colors.primary }} />
                        <RequiredTxt txt={appkeys.Addprofilepicture} txtStyle={[styles.medTxt, styles.tac, { fontSize: 12 }]} styleMain={{ marginTop: 6 }} />
                    </Pressable>
                    {ts ?
                        <CustomInput
                            place={"College/University Transferring From?"}
                            isRequiredTxt={true}
                            value={alldata?.transferStudent}
                            onChangeText={(t) => {
                                writeSignupdata("transferStudent", t)
                            }}
                        />
                        :
                        <CustomInput
                            place={appkeys.highschool}
                            isRequiredTxt={true}
                            value={alldata?.highSchoolName}
                            onChangeText={(t) => {
                                writeSignupdata("highSchoolName", t)
                            }}
                        />
                    }
                    {gettingPos ?
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
                    }
                    <CustomInput
                        place={appkeys.BioStats}
                        isRequiredTxt={true}
                        textInputProps={{
                            multiline: true,
                            placeholderTextColor: colors.grey,
                            style: { ...Commonstyles.multipleinput, color: colors.text },
                            textAlignVertical: "top"
                        }}
                        value={alldata?.bio}
                        onChangeText={(t) => {
                            writeSignupdata("bio", t)
                        }}
                    />
                    <RequiredTxt txt={ts ? "Residence State" : "State"} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginTop: 16 }} />
                    <CustomDrop
                        place={"State"}
                        list={stateList}
                        val={alldata?.state ?? ""}
                        allData={true}
                        selectedData={(v) => {
                            writeSignupdata("state", v?.name)
                            updateCityArray(v?.name)
                        }}
                        setVal={(v) => { null }}
                    />
                    {/* {allCities?.length > 0 &&
                        <>
                            <RequiredTxt txt={ts ? "Residence City" : "City"} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginTop: 16 }} />
                            <CustomDrop
                                place={ts ? "Residence City" : "City"}
                                search={true}
                                list={allCities}
                                val={alldata?.city ?? ""}
                                allData={true}
                                selectedData={(v) => {
                                    writeSignupdata("city", v?.name)
                                }}
                                setVal={(v) => { null }}
                            />
                            <Text style={{ textAlign: "center", color: colors?.text, fontSize: 12, fontFamily: AppFonts.Medium, marginTop: 8 }}>or</Text>
                        </>
                    }
                    <CustomInput
                        place={ts ? "Residence City" : "City"}
                        isRequiredTxt={true}
                        value={alldata?.city}
                        onChangeText={(t) => writeSignupdata("city", t)}
                    /> */}
                    <RequiredTxt txt={appkeys.GPA} txtStyle={[styles.placeTxt, { margin: 0, marginBottom: 0, }]} styleMain={{ marginTop: 18 }} />
                    <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            dataSource={gpaList}
                            activeItemTextStyle={{ fontFamily: AppFonts.Bold, color: colors.primary, fontSize: 18 }}
                            onValueChange={(data) => {
                                if (data == "4.0 +") {
                                    writeSignupdata("gpa", data?.split(" ")[0])
                                    return
                                }
                                writeSignupdata("gpa", data)
                            }}
                        />
                    </View>
                    {/* {!ts && <>
                        <CustomInput
                            place={appkeys.SATScore}
                            textInputProps={{
                                keyboardType: "number-pad"
                            }}
                            value={alldata?.satScore?.toString()}
                            onChangeText={(t) => {
                                writeSignupdata("satScore", Number(t))
                            }}
                        />
                        <CustomInput
                            place={appkeys.ACTScore}
                            textInputProps={{
                                keyboardType: "number-pad"
                            }}
                            value={alldata?.actScore?.toString()}
                            onChangeText={(t) => {
                                writeSignupdata("actScore", Number(t))
                            }}
                        />
                        <CustomInput
                            place={appkeys.highschool}
                            isRequiredTxt={true}
                            value={alldata?.highSchoolName}
                            onChangeText={(t) => {
                                writeSignupdata("highSchoolName", t)
                            }}
                        />
                        <CustomInput
                            place={appkeys.Highschoolcoach}
                            img={images.avatar}
                            value={alldata?.hsCoach}
                            onChangeText={(t) => {
                                writeSignupdata("hsCoach", t)
                            }}
                            onPressRight={() => {
                                Keyboard.dismiss();
                                getPhoneNumber(0);
                            }}
                        />
                        <CustomInput
                            hasCountryCode={true}
                            countrycode={`+${countrycode}`}
                            onPressCountry={() => {
                                setCountryModal(true)
                            }}
                            place={appkeys.Coachcontact}
                            img={images.phone}
                            textInputProps={{
                                keyboardType: "numeric",
                                maxLength: Platform?.OS == "ios" ? 10 : 13
                            }}
                            value={alldata?.hsCPhone}
                            onChangeText={(t) => {
                                writeSignupdata("hsCPhone", formatPhoneNumber2(t))
                            }}
                        />
                        <CustomInput
                            place={appkeys.TravelCoach}
                            img={images.avatar}
                            value={alldata?.travelCoach}
                            onChangeText={(t) => {
                                writeSignupdata("travelCoach", t)
                            }}
                            onPressRight={() => {
                                Keyboard.dismiss();
                                getPhoneNumber(1);
                            }}
                        />
                        <CustomInput
                            hasCountryCode={true}
                            countrycode={`+${tcCountrycode}`}
                            onPressCountry={() => {
                                setCcmode(1)
                                setCountryModal(true)
                            }}
                            place={appkeys.TravelCoachContact}
                            img={images.phone}
                            textInputProps={{
                                keyboardType: "numeric",
                                maxLength: Platform?.OS == "ios" ? 10 : 13
                            }}
                            value={alldata?.travelCoachContact}
                            onChangeText={(t) => {
                                writeSignupdata("travelCoachContact", formatPhoneNumber2(t))
                            }}
                        />
                    </>} */}
                    <RequiredTxt txt={appkeys.height} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginTop: 16 }} />
                    <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            activeItemTextStyle={{ fontFamily: AppFonts.Bold, color: colors.primary, fontSize: 18 }}
                            dataSource={heightList}
                            selectedIndex={heightIni}
                            onValueChange={(data) => {
                                writeSignupdata("heightString", data)
                            }}
                        />
                    </View>
                    <CustomInput
                        place={appkeys.weight}
                        isRequiredTxt={true}
                        txt={"lbs"}
                        textInputProps={{
                            keyboardType: "number-pad",
                            maxLength: 3
                        }}
                        value={alldata?.weight?.toString()}
                        onChangeText={(v) => {
                            writeSignupdata("weight", parsePhoneNumber(v))
                        }}
                    />
                    {/* <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.GraduationYear}
                        value={alldata?.gradYear}
                        onChangeText={(v) => {
                            writeSignupdata("gradYear", parsePhoneNumber(v))
                        }}
                        textInputProps={{
                            keyboardType: "number-pad",
                            maxLength: 4
                        }}
                    /> */}
                    <Text style={styles.addimage}>{localization?.appkeys?.AddVideos}</Text>
                    <Text style={[styles.desc, { marginBottom: 8 }]}>{localization?.appkeys?.Pleaseadd}</Text>
                    <FlatList
                        data={addvideo.concat(reqVideo)}
                        numColumns={2}
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        renderItem={({ item, index }) => {
                            if (item == "video") {
                                return <PictureBlock item={item}
                                    // star={index < 2 ? true : false}
                                    styleMain={{ width: wp(45), height: wp(36), marginLeft: wp(4), marginBottom: wp(4) }}
                                    onPress={() => {
                                        if (addvideo.length < 4) {
                                            setGallery(true)
                                            setMediaType(item)
                                            return
                                        }
                                        AppUtils.showToast("Maximum number reached.")
                                    }}
                                />
                            }
                            return (
                                <Pressable
                                    onPress={() => navigation.navigate(AppRoutes?.VideoPlayer, { media: item?.path })}
                                    style={{ width: wp(45), height: wp(36), marginLeft: wp(4), marginBottom: wp(4), justifyContent: "center", alignItems: "center" }}>
                                    <FastImage source={{ uri: item?.thumb }} style={{ width: wp(45), height: wp(36), borderRadius: 4, }} />
                                    <FastImage source={images.play} style={{ width: 40, height: 40, position: "absolute", alignSelf: "center" }} />
                                    <Pressable
                                        onPress={() => {
                                            let temp = [...addvideo]
                                            temp.splice(index, 1)
                                            setAddvideo(temp)
                                            writeSignupdata("videos", temp)
                                        }}
                                        style={{ position: "absolute", top: 4, right: 8 }}
                                    >
                                        <FastImage source={images.bin} style={{ width: 20, height: 20 }} />
                                    </Pressable>
                                </Pressable>
                            )
                        }}
                    />
                    <Modal
                        visible={showCompressModal}
                        transparent={true}
                    >
                        <Pressable
                            // onPress={() => { setShowCompressModal(false) }}
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: "center", alignItems: "center" }}>
                            <View style={{ backgroundColor: colors.white, minHeight: 80, width: "80%", padding: 8 }}>
                                <Text style={{ fontSize: 14, color: colors.text, fontFamily: AppFonts.Medium, textAlign: "center" }}>Compressing video</Text>
                                <Text style={{ fontSize: 18, color: colors.text, fontFamily: AppFonts.Medium, textAlign: "center" }}>{(progress * 100).toFixed(2)}</Text>
                            </View>
                        </Pressable>
                    </Modal>
                    <View style={{ height: hp(10) }} />
                </View>
            }
        />
    )
}

export default AboutUser

const useStyles = (colors) => StyleSheet.create({
    placeTxt: {
        margin: 18,
        marginBottom: 4,
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        marginLeft: 22
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
    desc: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors.lightblack,
        marginTop: 4,
        marginHorizontal: 18
    },
    addimage: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 16,
        color: colors.text,
        marginTop: 18,
        marginHorizontal: 18
    },
})