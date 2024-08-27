import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Linking, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomDrop from '../components/CustomDrop';
import CustomBtn from '../components/CustomBtn';
import { useDispatch, useSelector } from 'react-redux';
import CountryPicker from 'react-native-country-picker-modal'
import { mediaurl } from '../../utils/mediarender';
import { PictureBlock } from '../auth/AtheleteSignup/AddMedia';
import AppUtils from '../../utils/appUtils';
import CustomImagePickerModal from '../modals/CustomImagePickerModal';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { getPositionSports, uploadImage, uploadImagesFetchblob, uploadVideos, uploadVideosFetchblob } from '../../api/Services/services';
import { endpoints } from '../../api/Services/endpoints';
import { setUser } from '../../redux/Reducers/userData';
import { setLoading } from '../../redux/Reducers/load';
import CameraModal from '../modals/CameraModal';
import ImagePicker from 'react-native-image-crop-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import hit from '../../api/Manager/manager';
import convertHeightToFeet, { generateDecimalNumbersArray, generateHeightsArray, generateWeightNumbers } from '../../utils/heightunit';
import { selectContactPhone } from 'react-native-select-contact';
import TrimmerModal from '../modals/TrimmerModal';
import { updateProfilePicChats } from '../../utils/updateProfilePicChats';
import { City, Country, State } from 'country-state-city';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import HorizontalPicker from '@vseslav/react-native-horizontal-picker';
import { formatPhoneNumber, formatPhoneNumber2, parsePhoneNumber } from '../../utils/phonenumberformatter';
import checkIsSubScribedStill from '../../utils/checkIsSubScribedStill';
import { editingProfileAndHighlights } from '../../utils/SubscriptionCheck';
import MultichoiceQn from '../components/MultichoiceQn';

const EditProfile = ({ navigation, route }) => {
    const tempMaj = route?.params ?? []
    const user = useSelector(state => state?.userData?.user)
    const sportList = useSelector(state => state?.droplist?.sports)
    const subFeatures = useSelector(state => state?.subcriptions?.features)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys

    const [athleteData, setAthleteData] = useState(null)
    const [uploadModal, setUploadModal] = useState(false)
    const [videoPicker, setVideoPicker] = useState(false)
    const [imgPicker, setImgPicker] = useState(false)
    const [countryModal, setCountryModal] = useState(false)
    const [ccfor, setCcfor] = useState("user")
    const [mediaVid, setMediaVid] = useState([])
    const [mediaPhoto, setMediaPhoto] = useState([])
    const [positionList, setPositionList] = useState([])
    const [trimVideo, setTrimVideo] = useState(null)
    const [showTrimModal, setShowTrimModal] = useState(false)
    const reqVideo = Array(4 - mediaVid?.length).fill("add")
    const country = "US"
    const [stateList, setStateList] = useState([])
    const [allCities, setAllCities] = useState([])
    const gpaList = generateDecimalNumbersArray(2.0, 4.0, 0.1)
    const heightList = generateHeightsArray(5, 8)
    const weightList = generateWeightNumbers()
    const [weightIni, setWeightIni] = useState(route?.params?.iniWeigth || "")
    const [heightIni, setHeightIni] = useState(route?.params?.iniHeight || "")
    const [gpaIni, setGpaIni] = useState(route?.params?.iniGpa || "")
    const [currentWeight, setCurrentWeight] = useState(route?.params?.iniWeigth || 0)
    const [ts, setTs] = useState(false)

    useEffect(() => {
        if (user) {
            setAthleteData(user)
            setMediaVid(user?.videos)
            setMediaPhoto(user?.photos)
        }
    }, [user])
    useEffect(() => {
        if (tempMaj?.planMajors) {
            updateField("planMajors", tempMaj?.planMajors)
        }
    }, [tempMaj])
    useFocusEffect(useCallback(() => {
        if (user?.state) {
            setTimeout(() => {
                updateCityArray(user?.state)
            }, 400);
        }
    }, [user, stateList]))
    useEffect(() => {
        // setStateList(State.getStatesOfCountry(country))
        setStateList(State.getStatesOfCountry(country)?.filter(x => (!x?.isoCode?.includes("UM") && !x?.isoCode?.includes("AS") && !x?.isoCode?.includes("GU") && !x?.isoCode?.includes("MP"))))
    }, [])
    useEffect(() => {
        if (athleteData?.collegeTransferringFrom == "high") {
            setTs(false)
        } else {
            setTs(true)
        }
    }, [athleteData?.collegeTransferringFrom])

    async function OpenCamera(type) {
        let cameraAccess = await AppUtils.checkCameraPermisssion()
        if (!cameraAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openCamera({
            mediaType: type,
            compressVideoPreset: "HighestQuality"
        }).then(image => {
            if (type == "photo") {
                let temp = { ...image, isLocal: true }
                let x = [...mediaPhoto, temp]
                setMediaPhoto(x)
                setImgPicker(false)
            } else {
                // createVidThumbnail([image])
                if (image?.duration < 45000) {
                    createVidThumbnail([image])
                    return
                }
                setVideoPicker(false)
                setTrimVideo(image)
                setTimeout(() => {
                    setShowTrimModal(true)
                }, 400);
            }
        });
    }
    async function OpenImage(type) {
        let galleryAccess = await AppUtils.checkGalleryPermisssion()
        if (!galleryAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openPicker({
            mediaType: type,
            compressVideoPreset: "HighestQuality"
        }).then(image => {
            setImgPicker(false)
            if (type == "photo") {
                let temp = { ...image, isLocal: true }
                let x = [...mediaPhoto, temp]
                setMediaPhoto(x)
            } else {
                // createVidThumbnail([image])
                // console.log(image);
                if (image?.duration < 45000) {
                    createVidThumbnail([image])
                    return
                }
                setVideoPicker(false)
                setTrimVideo(image)
                setTimeout(() => {
                    setShowTrimModal(true)
                }, 400);
            }
        })
    }
    const createVidThumbnail = (arr) => {
        const videos = arr.map(async (e) => {
            // if (e?.duration < 4000) {
            //     showToast("Video must be more than 5 seconds.");
            //     return null;
            // } else {
            try {
                const res = await createThumbnail({ url: e?.path, timeStamp: 500 });
                return { ...e, thumb: res?.path, isLocal: true };
            } catch (err) {
                throw err;
            }
            // }
        });

        Promise.all(videos).then(results => {
            let allMedia = []
            allMedia = [...mediaVid, ...allMedia, ...results];
            setVideoPicker(false)
            setMediaVid(allMedia)
        }).catch(err => {
            console.error(err);
        });
    }
    const updateField = useCallback((key, value) => {
        let temp = { ...athleteData, [key]: value }
        setAthleteData(temp)
    }, [athleteData])
    const validation = () => {
        if (!athleteData?.fname) {
            AppUtils.showToast("First name is required.")
            return
        }
        if (!athleteData?.lname) {
            AppUtils.showToast("Last Name is required.")
            return
        }
        if (!athleteData?.phone || athleteData?.phone == "") {
            AppUtils.showToast("Phone number is required.")
            return
        }
        if (!athleteData?.bio) {
            AppUtils.showToast("Bio is required.")
            return
        }
        if (!athleteData?.gpa) {
            AppUtils.showToast("GPA is required.")
            return
        }
        if (athleteData?.collegeTransferringFrom == "high") {
            if (!athleteData?.highSchoolName || athleteData?.highSchoolName?.trim() == "") {
                AppUtils.showToast("High school attending is required.")
                return
            }
        } else {
            if (!athleteData?.transferStudent || athleteData?.transferStudent?.trim() == "") {
                AppUtils.showToast("Transfer school name is required.")
                return
            }
        }
        if (!athleteData?.position1 || !athleteData?.position2) {
            AppUtils.showToast("Position is required.")
            return
        }
        if (!athleteData?.heightString) {
            AppUtils.showToast("Height is required.")
            return
        }
        if (!athleteData?.weight) {
            AppUtils.showToast("Weight is required.")
            return
        }
        if (!athleteData?.gradYear) {
            AppUtils.showToast("Graduation year is required.")
            return
        }
        // if (mediaPhoto?.length == 0) {
        //     AppUtils.showToast("You need to add a photo.")
        //     return
        // }
        if (mediaVid?.length < 2) {
            AppUtils.showToast("You need to add atleast 2 videos.")
            return
        }
        // if (athleteData?.planMajors?.length == 0) {
        //     AppUtils.showToast("You need add atleast 1 major.")
        //     return
        // }
        submit()
    }
    const uploadThumbnails = async (arr) => {
        let thumbs = arr?.map(x => ({ path: x?.thumb, mime: "image/png" }))
        try {
            let res = await uploadImagesFetchblob(thumbs)
            if (res?.data) {
                let temp = JSON.parse(res?.data)
                return temp
            }
        } catch (e) {
        } finally {
        }
    }
    const submit = async () => {
        dispatch(setLoading(true))
        let body = { ...athleteData }
        if (user?.height != body?.height) {
            // const heightInFt = convertHeightToFeet(body?.height);
            // body = { ...body, height: heightInFt.toFixed(2), heightUnit: "ft" }
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
        // upload profile pic
        if (typeof body?.profilePic == 'object') {
            try {
                let res = await uploadImage([body?.profilePic])
                body = { ...body, profilePic: res?.data[0] }
            } catch (e) {
            }
        }

        // update new photos
        // let uploadedimages = []
        // let newimages = []
        // mediaPhoto.forEach(e => {
        //     if (e?.isLocal) {
        //         newimages.push(e)
        //     } else {
        //         uploadedimages.push(e)
        //     }
        // });
        // if (newimages.length > 0) {
        //     try {
        //         let res = await uploadImage(newimages)
        //         uploadedimages = uploadedimages.concat(res?.data)
        //     } catch (error) {
        //     }
        // }
        // body = { ...body, photos: uploadedimages }

        //update new videos
        let uploadedimg = []
        let newimg = []
        mediaVid.forEach(e => {
            if (e?.isLocal) {
                newimg.push(e)
            } else {
                uploadedimg.push(e)
            }
        });
        if (newimg.length > 0) {
            let thumbs = await uploadThumbnails(newimg)
            try {
                // let res = await uploadVideos(newimg)
                let res = await uploadVideosFetchblob(newimg)
                let videoarr = [...JSON.parse(res?.data)]
                let resultArray = videoarr.map(function (obj, index) {
                    return {
                        link: obj.link,
                        thumb: thumbs[index]
                    };
                });
                // uploadedimg = uploadedimg.concat(res?.data)
                uploadedimg = uploadedimg.concat(resultArray)
            } catch (error) {
            }
        }
        body = { ...body, videos: uploadedimg }
        try {
            let res = await hit(endpoints.updateself, "patch", body)
            if (!res?.err) {
                if (res?.data?.profilePic != user?.profilePic) {
                    updateProfilePicChats(res?.data)
                }
                dispatch(setUser(res?.data))
                AppUtils.showToast("Updated sucessfully")
                navigation.goBack()
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
            AppUtils.showLog(e, "editath")
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function getPhoneNumber() {
        if (Platform.OS === 'android') {
            const request = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            );
            if (request === PermissionsAndroid.RESULTS.DENIED) throw Error("Permission Denied");
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

        let temp = { ...athleteData, hsCoach: contact?.name, hsCPhone: lastTenDigits }
        setAthleteData(temp)
    }
    const updateCityArray = (name) => {
        let temp = [...stateList]
        let isoCode = temp.filter(x => x?.name == name)[0]?.isoCode || ""
        setAllCities(City.getCitiesOfState(country, isoCode))
    }
    const getSportsPos = async (id) => {
        try {
            let res = await getPositionSports(id)
            console.log(res);
            if (!res?.err) {
                setPositionList(res?.data)
            }
        } catch (e) {
            AppUtils.showLog(e, "error getting position")
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
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                    {countryModal && <CountryPicker
                        withCallingCode
                        visible={countryModal}
                        onClose={() => setCountryModal(false)}
                        onSelect={(val) => {
                            updateField(ccfor == "user" ? "cc" : ccfor == "coach" ? "hsCcc" : "travelCoachCC", val?.callingCode[0])
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
                            newvid = { ...newvid, isLocal: true }
                            let allMedia = [...mediaVid];
                            allMedia.push(newvid)
                            setMediaVid(allMedia)
                        }}
                    // onTrimPress={(vid) => {
                    //     createVidThumbnail([vid])
                    // }}
                    />
                    <CustomImagePickerModal
                        visible={uploadModal}
                        pressHandler={() => {
                            setUploadModal(false)
                        }}
                        attachments={(img) => {
                            let temp = { ...athleteData, profilePic: img }
                            setAthleteData(temp)
                        }}
                    />
                    <CameraModal
                        vis={videoPicker}
                        title={"Videos"}
                        onPressCamera={() => {
                            OpenCamera("video")
                        }}
                        onPressGallery={() => {
                            OpenImage("video")
                        }}
                        onPress={() => {
                            setVideoPicker(false)
                        }}
                    />
                    <CameraModal
                        vis={imgPicker}
                        title={"Photos"}
                        onPressCamera={() => {
                            OpenCamera("photo")
                        }}
                        onPressGallery={() => {
                            OpenImage("photo")
                        }}
                        onPress={() => {
                            setImgPicker(false)
                        }}
                    />
                    <Pressable style={{ marginVertical: 20, alignSelf: "center" }}
                        onPress={() => {
                            setUploadModal(true)
                        }}
                    >
                        <FastImage source={athleteData?.profilePic?.path ? { uri: athleteData?.profilePic?.path } : { uri: mediaurl(athleteData?.profilePic) }} style={{ height: wp(22), width: wp(22), borderRadius: 100, alignSelf: 'center', borderWidth: 2, borderColor: colors.primary }} />
                        <Text style={[styles.medTxt, styles.tac, { fontSize: 12, marginTop: 4 }]}>{appkeys.ChangePicture}</Text>
                    </Pressable>
                    <CustomInput
                        place={appkeys.fName}
                        img={images.avatar}
                        value={athleteData?.fname}
                        onChangeText={(t) => {
                            updateField("fname", t)
                        }}
                    />
                    <CustomInput
                        place={appkeys.lName}
                        img={images.avatar}
                        value={athleteData?.lname}
                        onChangeText={(t) => {
                            updateField("lname", t)
                        }}
                    />
                    <CustomInput
                        place={appkeys.Email}
                        img={images.mail}
                        value={athleteData?.email}
                        onChangeText={(t) => {
                            updateField("email", t)
                        }}
                        textInputProps={{
                            editable: false
                        }}
                    />
                    <CustomInput
                        place={appkeys.Mobilenumb}
                        img={images.phone}
                        hasCountryCode={true}
                        countrycode={`+${athleteData?.cc}`}
                        onPressCountry={() => {
                            setCcfor("user")
                            setCountryModal(true)
                        }}
                        value={formatPhoneNumber(athleteData?.phone)}
                        onChangeText={(t) => {
                            updateField("phone", formatPhoneNumber(t))
                        }}
                        textInputProps={{
                            keyboardType: "numeric",
                            maxLength: Platform?.OS == "ios" ? 10 : 12
                        }}
                    />
                    <View style={{ height: 10 }} />
                    <MultichoiceQn
                        required={false}
                        list={[{ label: "High School Athlete", value: "high" }, { label: "Transfer Athlete", value: "transfer" }]}
                        value={athleteData?.collegeTransferringFrom}
                        onChange={(t) => {
                            updateField("collegeTransferringFrom", t)
                        }}
                    />
                    {ts && <CustomInput
                        place={"College/University Transferring From? "}
                        isRequiredTxt={true}
                        value={athleteData?.transferStudent}
                        onChangeText={(t) => {
                            updateField("transferStudent", t)
                        }}
                    />}
                    <CustomInput
                        place={appkeys.BioStats}
                        textInputProps={{
                            multiline: true,
                            textAlignVertical: "top",
                            style: {
                                height: 100, width: "100%", padding: 10, color: colors.text
                            }
                        }}
                        value={athleteData?.bio}
                        onChangeText={(t) => {
                            updateField("bio", t)
                        }}
                    />
                    <Text style={[styles.placeTxt]}>{appkeys.GPA}</Text>
                    <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            activeItemTextStyle={{ fontFamily: AppFonts.Bold, color: colors.primary, fontSize: 18 }}
                            dataSource={gpaList}
                            selectedIndex={gpaIni}
                            onValueChange={(data) => {
                                if (data == "4.0 +") {
                                    updateField("gpa", data?.split(" ")[0])
                                    return
                                }
                                updateField("gpa", data)
                            }}
                        />
                    </View>
                    {/* <CustomInput
                        place={appkeys.GPA}
                        value={athleteData?.gpa?.toString() ?? ""}
                        onChangeText={(t) => {
                            updateField("gpa", t)
                        }}
                        textInputProps={{
                            keyboardType: "numeric"
                        }}
                    /> */}
                    {/* {!ts && <>
                        <CustomInput
                            place={appkeys.SATScore}
                            value={athleteData?.satScore?.toString() ?? ""}
                            onChangeText={(t) => {
                                updateField("satScore", Number(t))
                            }}
                            textInputProps={{
                                keyboardType: "number-pad"
                            }}
                        />
                        <CustomInput
                            place={appkeys.ACTScore}
                            value={athleteData?.actScore?.toString() ?? ""}
                            onChangeText={(t) => {
                                updateField("actScore", Number(t))
                            }}
                            textInputProps={{
                                keyboardType: "number-pad"
                            }}
                        />
                    </>} */}
                    {/* <CustomInput
                        place={appkeys.Enteryourheight}
                        placespecific={"5.7"}
                        textInputProps={{
                            keyboardType: "numeric",
                        }}
                        value={athleteData?.height.toString()}
                        onChangeText={(v) => {
                            updateField("height", v)
                        }}
                    /> */}
                    <Text style={[styles.placeTxt]}>{appkeys.height}</Text>
                    <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            activeItemTextStyle={{ fontFamily: AppFonts.Bold, color: colors.primary, fontSize: 18 }}
                            dataSource={heightList}
                            selectedIndex={heightIni}
                            onValueChange={(data) => {
                                updateField("heightString", data)
                            }}
                        />
                    </View>
                    <CustomInput
                        place={appkeys.weight}
                        img={images.lb}
                        textInputProps={{
                            keyboardType: "number-pad",
                            maxLength: 3
                        }}
                        value={athleteData?.weight.toString()}
                        onChangeText={(v) => {
                            updateField("weight", parsePhoneNumber(v))
                        }}
                    />
                    {/* <Text style={[styles.placeTxt]}>{appkeys.weight}</Text>
                    <HorizontalPicker
                        data={weightList}
                        renderItem={(item) => {
                            return (
                                <View style={[{ width: wp(12), minHeight: 40, justifyContent: "center" }]}>
                                    <Text style={[styles.itemText, currentWeight == item && { fontFamily: AppFonts.Medium, color: colors.primary }]}>
                                        {item}
                                    </Text>
                                </View>
                            )
                        }}
                        onChange={(data) => {
                            updateField("weight", data)
                            setCurrentWeight(data)
                        }}
                        defaultIndex={weightIni}
                        animatedScrollToDefaultIndex={true}
                        itemWidth={wp(12)}
                        snapTimeout={1000}
                    /> */}
                    {/* <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            dataSource={weightList}
                            selectedIndex={weightIni}
                            onValueChange={(data) => {
                                updateField("weight", data)
                            }}
                        />
                    </View> */}
                    {/* <CustomInput
                        place={appkeys.EnteryourWeight}
                        value={athleteData?.weight.toString()}
                        onChangeText={(t) => {
                            updateField("weight", t)
                        }}
                        textInputProps={{
                            keyboardType: "numeric"
                        }}
                    /> */}
                    <Text style={[styles.placeTxt]}>{ts ? "Residence State" : "State"}</Text>
                    <CustomDrop
                        list={stateList}
                        val={athleteData?.state}
                        allData={true}
                        selectedData={(v) => {
                            updateField("state", v?.name)
                            if (v?.name) {
                                updateCityArray(v?.name)
                            }
                        }}
                        setVal={(v) => { null }}
                    />
                    {allCities?.length > 0 &&
                        <>
                            <Text style={[styles.placeTxt]}>{ts ? "Residence City" : "City"}</Text>
                            <CustomDrop
                                search={true}
                                list={allCities}
                                val={athleteData?.city}
                                allData={true}
                                selectedData={(v) => {
                                    updateField("city", v?.name)
                                }}
                                setVal={(v) => { null }}
                            />
                            <Text style={{ textAlign: "center", color: colors?.text, fontSize: 12, fontFamily: AppFonts.Medium, marginTop: 8 }}>or</Text>
                        </>
                    }
                    <CustomInput
                        place={ts ? "Residence City" : "City"}
                        value={athleteData?.city}
                        onChangeText={(t) => updateField("city", t)}
                    />
                    {/* for enabling editing sports uncomment the code below */}
                    {/* <Text style={[styles.placeTxt]}>{appkeys.Sports}</Text>
                    <CustomDrop
                        list={sportList}
                        val={athleteData?.sports[0] || ""}
                        allData={true}
                        selectedData={(v) => {
                            getSportsPos(v?._id)
                        }}
                        setVal={(v) => {
                            if (v != athleteData?.sports[0]) {
                                let temp = { ...athleteData, sports: [v], position1: "", position2: "" }
                                setAthleteData(temp)
                            }
                        }}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                        <View style={{ width: wp(50) }}>
                            <Text style={[styles.placeTxt]}>{appkeys.Position1}</Text>
                            <CustomDrop
                                list={positionList}
                                styleOptions={{ width: "80%" }}
                                val={athleteData?.position1}
                                setVal={(v) => { updateField("position1", v) }}
                            />
                        </View>
                        <View style={{ width: wp(50) }}>
                            <Text style={[styles.placeTxt]}>{appkeys.Position2}</Text>
                            <CustomDrop
                                list={positionList}
                                styleOptions={{ width: "80%" }}
                                val={athleteData?.position2}
                                setVal={(v) => { updateField("position2", v) }}
                            />
                        </View>
                    </View> */}
                    {!ts && <>
                        <CustomInput
                            place={appkeys.highschool}
                            value={athleteData?.highSchoolName}
                            onChangeText={(t) => {
                                updateField("highSchoolName", t)
                            }}
                        />
                        {/* <CustomInput
                            place={appkeys.Highschoolcoach}
                            img={images.avatar}
                            onPressRight={() => {
                                Keyboard.dismiss()
                                getPhoneNumber()
                            }}
                            value={athleteData?.hsCoach}
                            onChangeText={(t) => {
                                updateField("hsCoach", t)
                            }}
                        />
                        <CustomInput
                            place={appkeys.Coachcontact}
                            img={images.phone}
                            hasCountryCode={true}
                            countrycode={`+${athleteData?.hsCcc}`}
                            onPressCountry={() => {
                                setCcfor("coach")
                                setCountryModal(true)
                            }}
                            value={formatPhoneNumber(athleteData?.hsCPhone)}
                            onChangeText={(t) => {
                                updateField("hsCPhone", formatPhoneNumber(t))
                            }}
                            textInputProps={{
                                keyboardType: "numeric",
                                maxLength: Platform?.OS == "ios" ? 10 : 12
                            }}
                            onPressRight={() => {
                                Keyboard.dismiss()
                                getPhoneNumber()
                            }}
                        />
                        <CustomInput
                            place={appkeys.TravelCoach}
                            img={images.avatar}
                            value={athleteData?.travelCoach}
                            onChangeText={(t) => {
                                updateField("travelCoach", t)
                            }}
                        />
                        <CustomInput
                            hasCountryCode={true}
                            countrycode={`+${athleteData?.travelCoachCC}`}
                            onPressCountry={() => {
                                setCcfor("travelcoach")
                                setCountryModal(true)
                            }}
                            place={appkeys.TravelCoachContact}
                            img={images.phone}
                            textInputProps={{
                                keyboardType: "numeric",
                                maxLength: Platform?.OS == "ios" ? 10 : 13
                            }}
                            value={athleteData?.travelCoachContact}
                            onPressRight={() => {
                                Keyboard.dismiss();
                                getPhoneNumber();
                            }}
                            onChangeText={(t) => {
                                updateField("travelCoachContact", formatPhoneNumber2(t))
                            }}
                        /> */}
                    </>}
                    <CustomInput
                        place={appkeys.GraduationYear}
                        value={athleteData?.gradYear}
                        onChangeText={(t) => {
                            updateField("gradYear", parsePhoneNumber(t))
                        }}
                        textInputProps={{
                            keyboardType: "numeric",
                            maxLength: 4
                        }}
                    />
                    {/* <Text style={[styles.semibTxt, { margin: 18, marginBottom: 8 }]}>{appkeys.Photos}</Text>
                    <View>
                        <FlatList
                            data={mediaPhoto?.concat("add")}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                if (item == "add") {
                                    if (mediaPhoto.length > 0) {
                                        return null
                                    }
                                    return (
                                        <PictureBlock
                                            styleMain={{ height: wp(27), marginBottom: 18, marginLeft: wp(4), width: wp(27) }}
                                            onPress={() => {
                                                if (mediaPhoto.length < 3) {
                                                    setImgPicker(true)
                                                    return
                                                }
                                                AppUtils.showToast("Maximum number reached.")
                                            }}
                                        />
                                    )
                                }
                                return (
                                    <View style={{ height: wp(27), marginBottom: 18, width: wp(27), marginLeft: wp(4), borderRadius: 4, justifyContent: "center", alignItems: "center" }}>
                                        <FastImage source={item?.isLocal ? { uri: item?.path } : { uri: mediaurl(item) }} style={{ height: "100%", width: "100%", borderRadius: 4 }} />
                                        <Pressable style={{ height: 26, width: 26, position: 'absolute', top: 4, right: 4 }}
                                            onPress={() => {
                                                let temp = [...mediaPhoto]
                                                temp.splice(index, 1)
                                                setMediaPhoto(temp)
                                            }}
                                        >
                                            <FastImage source={images.bin} style={{ height: "100%", width: "100%" }} resizeMode='contain' />
                                        </Pressable>
                                    </View>
                                )
                            }}
                        />
                    </View> */}
                    <Text style={[styles.semibTxt, { margin: 18, marginBottom: 8 }]}>{appkeys.Videos}</Text>
                    <View>
                        <FlatList
                            data={mediaVid.concat(reqVideo)}
                            numColumns={2}
                            renderItem={({ item, index }) => {
                                if (item == "add") {
                                    return (
                                        <PictureBlock
                                            star={index < 2 ? true : false}
                                            styleMain={{ height: wp(27), marginBottom: 18, marginLeft: wp(5), width: wp(43) }}
                                            onPress={() => {
                                                if (mediaVid.length < 4) {
                                                    setVideoPicker(true)
                                                    return
                                                }
                                                AppUtils.showToast("Maximum number reached.")
                                            }}
                                        />
                                    )
                                }
                                return (
                                    <Pressable style={{ height: wp(27), marginBottom: 18, width: wp(43), marginLeft: wp(5), borderRadius: 4, justifyContent: "center", alignItems: "center" }}
                                        onPress={() => {
                                            navigation.navigate(AppRoutes.VideoPlayer, { media: item?.isLocal ? item?.path : item?.link })
                                        }}
                                    >
                                        <FastImage source={item?.isLocal ? { uri: item?.thumb } : { uri: mediaurl(item?.thumb) }} style={{ height: "100%", width: "100%", borderRadius: 4 }} />
                                        <FastImage source={images.play} style={{ height: 40, width: 40, position: 'absolute' }} resizeMode='contain' />
                                        <Pressable style={{ height: 26, width: 26, position: 'absolute', top: 4, right: 4 }}
                                            onPress={() => {
                                                let temp = [...mediaVid]
                                                temp.splice(index, 1)
                                                setMediaVid(temp)
                                            }}
                                        >
                                            <FastImage source={images.bin} style={{ height: "100%", width: "100%" }} resizeMode='contain' />
                                        </Pressable>
                                    </Pressable>
                                )
                            }}
                        />
                    </View>
                    {/* <Text style={[styles.semibTxt, { margin: 18, marginBottom: 8 }]}>{appkeys.Planned_Majors}</Text>
                    <View>
                        <FlatList
                            data={athleteData?.planMajors.concat("add")}
                            scrollEnabled={false}
                            numColumns={2}
                            renderItem={({ item, index }) => {
                                if (item == "add") {
                                    return (
                                        <Pressable style={{ paddingVertical: 8, marginBottom: wp(4), width: wp(44), backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.primary, marginLeft: wp(4), borderRadius: 14, justifyContent: "center", alignItems: "center" }}
                                            onPress={() => { navigation?.navigate(AppRoutes.MajorsUpdate) }}
                                        >
                                            <Text style={[styles.regTxt, { color: colors.white, fontSize: 30 }]}>+</Text>
                                        </Pressable>
                                    )
                                }
                                return (
                                    <View style={{ paddingVertical: 14, marginBottom: wp(4), width: wp(44), backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, marginLeft: wp(4), borderRadius: 14, justifyContent: "center", alignItems: "center" }}>
                                        <Text style={[styles.regTxt]}>{item}</Text>
                                    </View>
                                )
                            }}
                        />
                    </View> */}
                    <CustomBtn
                        titleTxt={appkeys.Update}
                        onPress={() => {
                            // if (checkIsSubScribedStill()) {
                            //     validation()
                            // } 

                            validation()
                            return
                            if (editingProfileAndHighlights(subFeatures)) {
                                validation()
                            } else {
                                navigation?.navigate(AppRoutes?.Subscription)
                            }
                        }}
                    />
                    <View style={{ height: hp(6) }} />
                </ScrollView >
            }
        />
    )
}

export default EditProfile

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
        fontSize: 12, color: colors.text, fontFamily: AppFonts.Medium,
        margin: 18, marginBottom: 4
    },
    regTxt: {
        fontSize: 14, color: colors.text
    },
    itemText: {
        fontSize: 14, fontFamily: AppFonts.Regular, color: colors.text, textAlign: "right"
    }
})