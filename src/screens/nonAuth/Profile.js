import { ActivityIndicator, Alert, FlatList, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigation, useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { mediaurl } from '../../utils/mediarender';
import { getUserDetailThunk, logoutThunk, setUser } from '../../redux/Reducers/userData';
import { endpoints } from '../../api/Services/endpoints';
import PictureModal from '../modals/PictureModal';
import Logoutbtn from '../components/Logoutbtn';
import { generateDecimalNumbersArray, generateHeightsArray, generateWeightNumbers } from '../../utils/heightunit';
import { clearSignupdata } from '../../redux/Reducers/signup';
import Autolink from 'react-native-autolink';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import CompleteProfileModal from '../modals/CompleteProfileModal';

const Profile = ({ navigation }) => {
    const dispatch = useDispatch()
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const user = useSelector(state => state?.userData?.user)

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys
    const heightList = generateHeightsArray(5, 8)
    const weightList = generateWeightNumbers()
    const gpaList = generateDecimalNumbersArray(2.0, 4.0, 0.1)
    const [heightInd, setHeightInd] = useState(0)
    const [weightInd, setWeightInd] = useState(0)
    const [showCompletePopup, setShowCompletePopup] = useState(false)

    useEffect(() => {
        dispatch(getUserDetailThunk())
    }, [])
    useEffect(() => {
        if (user && heightList) {
            let h = heightList?.indexOf(user?.heightString)
            setHeightInd(h)
        }
        if (user && weightList) {
            let w = weightList?.indexOf(user?.weight)
            setWeightInd(w)
        }
    }, [heightList, user?.heightString, weightList])

    const logout = useCallback(() => {
        dispatch(logoutThunk())
        dispatch(clearSignupdata())
        setTimeout(() => {
            navigation.replace(AppRoutes.AuthStack, { screen: AppRoutes.Login })
        }, 0);
    }, [dispatch, navigation])

    return (
        <SolidView
            title={appkeys.Profile}
            view={
                <ScrollView showsVerticalScrollIndicator={false}>
                    {isAthlete ?
                        <Atheleteprofile athelete={user} />
                        :
                        <Uniprofile university={user} />
                    }
                    <CompleteProfileModal
                        vis={showCompletePopup}
                        onSkip={() => {
                            setShowCompletePopup(false)
                        }}
                        onPress={() => {
                            setShowCompletePopup(false)
                            setTimeout(() => {
                                navigation.navigate(AppRoutes.AboutUser)
                            }, 40);
                        }}
                    />
                    <CustomBtn
                        titleTxt={appkeys.EditProfile}
                        onPress={() => {
                            if (user?.currentStep != 2) {
                                setShowCompletePopup(true)
                                return
                            }
                            isAthlete ?
                                // navigation.navigate(AppRoutes.EditProfile, { iniHeight: heightList?.indexOf(user?.heightString), iniWeigth: weightList?.indexOf(user?.weight) }) , iniGpa: gpaList.indexOf((user?.heightString)?.toFixed(1))
                                navigation.navigate(AppRoutes.EditProfile, { iniHeight: heightInd, iniWeigth: weightInd, iniGpa: gpaList.indexOf((user?.gpa == 4 ? "4.0 +" : user?.gpa?.toFixed(1))) })
                                :
                                navigation.navigate(AppRoutes.EditProfileUni)
                        }}
                    />
                    <Logoutbtn
                        titleTxt={localization?.appkeys?.Logout}
                        btnStyle={{ alignSelf: "center", marginTop: 20, marginBottom: 80 }}
                        onPress={() => {
                            Alert.alert("Logout", "Are you sure?", [{ text: "Yes", onPress: () => logout() }, { text: "No" }])
                        }}
                    />
                    <View style={{ height: hp(4) }} />
                </ScrollView>
            }
        />
    )
}

export default Profile

const useStyles = (colors) => StyleSheet.create({
    coachTxt: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors.text,
        marginHorizontal: 18,
    },
    boldTxt: {
        color: colors.text,
        fontSize: 14,
        fontFamily: AppFonts.SemiBold,
    },
    regTxt: {
        fontSize: 14,
        fontFamily: AppFonts.Regular,
        color: colors.text,
    },
    semibTxt: {
        color: colors.text,
        fontFamily: AppFonts.SemiBold,
        fontSize: 24,
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

export const Uniprofile = ({ university }) => {
    const { colors } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys

    const [activeIndex, setActiveIndex] = useState(0)
    const [allMedia, setAllMedia] = useState([])
    const [visModal, setVisModal] = useState(false)
    const [showPic, setShowPic] = useState(null)

    useEffect(() => {
        if (university?.mascotImages) {
            let temp = [...university?.mascotImages]
            if (university?.profilePic != endpoints?.default_pic) {
                temp.splice(0, 0, university?.profilePic)
            }
            setAllMedia(temp)
        }
    }, [university])

    const onScroll = useCallback((event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex)
    }, []);

    return (
        <View>
            <PictureModal
                vis={visModal}
                img={showPic}
                onOutsidePress={() => { setVisModal(false); setShowPic(null) }}
            />
            <View style={{ height: hp(40), width: wp(92), alignSelf: 'center', marginVertical: 16, borderRadius: 8, overflow: 'hidden' }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={true}
                    data={allMedia}
                    onScroll={(events) => {
                        onScroll(events)
                    }}
                    renderItem={({ item, index }) => {
                        return (
                            <Pressable style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => { setShowPic(item), setVisModal(true) }}
                            >
                                {/* {item?.thumb && <FastImage style={{ height: 46, width: 46, position: "absolute", zIndex: 1 }} source={images.play} />} */}
                                <_renderImg item={item} />
                                {/* <FastImage onProgress={(e) => { console.log(e); }} source={{ uri: mediaurl(item) }} style={{ height: "100%", width: wp(92), alignSelf: "center" }} /> */}
                            </Pressable>
                        )
                    }}
                />
                <View style={{ backgroundColor: colors.blacktransparent, bottom: 0, flexDirection: 'row', height: 22, justifyContent: "center", alignItems: 'center', alignSelf: 'center', zIndex: 1, paddingHorizontal: 4, paddingVertical: 6, position: "absolute", borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                    {allMedia.map((i, j) => {
                        return (
                            <View style={{ height: 8, width: 8, borderRadius: 8, backgroundColor: colors.white, marginHorizontal: 4, opacity: activeIndex == j ? 1 : 0.6 }} key={j.toString()} />
                        )
                    })}
                </View>
            </View>
            {/* <FastImage source={{ uri: mediaurl(university?.mascotImages[0]) }} style={{ height: hp(40), width: "92%", alignSelf: "center", borderRadius: 8, marginVertical: 16 }} /> */}
            {/* <Text>{university?.coaches ? university?.coaches[0]?.coachName + " and " + university?.coaches[1]?.coachName : ""}</Text> */}
            <Text style={[styles.semibTxt, { margin: 18, marginVertical: 8 }]}>{university?.name}</Text>
            <Text style={styles.coachTxt}>{appkeys?.headCoach}: <Text style={{ fontFamily: AppFonts.Regular }}>{university?.coaches ? university?.coaches[0]?.coachName : ""}</Text></Text>
            {university?.coaches[1]?.coachName && <Text style={styles.coachTxt}>{appkeys?.recruitingCoordinator}: <Text style={{ fontFamily: AppFonts.Regular }}>{university?.coaches ? university?.coaches[1]?.coachName : ""}</Text></Text>}
            <Text style={[styles.coachTxt, { marginTop: 4 }]}><Text style={styles.coachTxt}>{appkeys?.programEmail}:</Text> {university?.programEmail}</Text>
            <Text style={[styles.regTxt, { marginHorizontal: 18, marginTop: 4 }]}><Text style={styles.coachTxt}>{appkeys?.ProgramBio}:</Text> {university?.programBio}</Text>
            {university?.bio && <Text style={[styles.regTxt, { marginHorizontal: 18, marginTop: 4 },]}><Text style={styles.coachTxt}>{appkeys?.SchoolBio}:</Text> {university?.bio}</Text>}
            {university?.uniLink && <Text style={[styles.boldTxt, { marginHorizontal: 18, marginVertical: 6 }]}>{appkeys.Website}: <Autolink text={university?.uniLink} linkStyle={{ color: colors.primary, fontSize: 14, fontFamily: AppFonts.SemiBold, }} /></Text>}
            {/* <Text style={[styles.boldTxt, { fontSize: 14, marginHorizontal: 18 }]}>{university?.locationAddress}</Text> */}
            {/* <View style={[{ backgroundColor: colors.white, margin: 18, padding: 12, borderRadius: 6 }, styles.shadow]}>
                <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{university?.sports[0]}</Text>
            </View> */}
        </View >
    )
}

export const Atheleteprofile = ({ athelete }) => {
    // console.log(athelete);
    const navigation = useNavigation()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys;

    const [activeIndex, setActiveIndex] = useState(0)
    const [allMedia, setAllMedia] = useState([])
    const [visModal, setVisModal] = useState(false)
    const [showPic, setShowPic] = useState(null)

    useEffect(() => {
        if (athelete?.photos && athelete?.videos) {
            // let temp = [...athelete?.photos.concat(athelete?.videos)]
            let temp = [...athelete?.videos]
            if (athelete?.profilePic != endpoints?.default_pic) {
                temp.splice(0, 0, athelete?.profilePic)
            }
            setAllMedia(temp)
        }
    }, [athelete])

    const onScroll = useCallback((event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex)
    }, []);

    return (
        <View>
            <PictureModal
                vis={visModal}
                img={showPic}
                onOutsidePress={() => { setVisModal(false); setShowPic(null) }}
            />
            {allMedia?.length > 0 && <View style={{ height: hp(40), width: wp(92), alignSelf: 'center', marginVertical: 16, borderRadius: 8, overflow: 'hidden' }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={true}
                    data={allMedia}
                    onScroll={(events) => {
                        onScroll(events)
                    }}
                    renderItem={({ item, index }) => {
                        return (
                            <Pressable style={{ justifyContent: "center", alignItems: "center" }}
                                onPress={() => {
                                    item?.thumb ?
                                        navigation.navigate(AppRoutes.VideoPlayer, { media: item?.link })
                                        :
                                        [setShowPic(item), setVisModal(true)]
                                }}
                            >
                                {item?.thumb && <FastImage style={{ height: 46, width: 46, position: "absolute", zIndex: 1 }} source={images.play} />}
                                {/* <FastImage onProgress={() => { return <ActivityIndicator size={"small"} color={colors.primary} /> }} source={item?.thumb ? { uri: mediaurl(item?.thumb) } : { uri: mediaurl(item) }} style={{ height: "100%", width: wp(92), alignSelf: "center" }} /> */}
                                <_renderImg item={item?.thumb ? item?.thumb : item} />
                            </Pressable>
                        )
                    }}
                />
                <View style={{ backgroundColor: colors.blacktransparent, bottom: 0, flexDirection: 'row', height: 22, justifyContent: "center", alignItems: 'center', alignSelf: 'center', zIndex: 1, paddingHorizontal: 4, paddingVertical: 6, position: "absolute", borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                    {allMedia.map((i, j) => {
                        return (
                            <View style={{ height: 8, width: 8, borderRadius: 8, backgroundColor: colors.white, marginHorizontal: 4, opacity: activeIndex == j ? 1 : 0.6 }} key={j.toString()} />
                        )
                    })}
                </View>
            </View>}
            <Text style={[styles.semibTxt, { margin: 18, marginVertical: 8 }]}>{`${athelete?.fname} ${athelete?.lname}`}{athelete?.sports?.length > 0 ? `, '${athelete?.gradYear?.substring(2)}` : ''}</Text>
            {/* ${, '${athelete?.gradYear?.substring(2)}`}} */}
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 18 }}>
                <View style={{ flexDirection: "row", }}>
                    {allMedia?.map((i, j) => {
                        return (
                            <Pressable key={j.toString()} onPress={() => { navigation.navigate(AppRoutes.VideoPlayer, { media: i?.link }) }} style={{ justifyContent: "center", alignItems: "center" }}>
                                <Image source={images.play} style={{ height: 40, width: 40, position: 'absolute', zIndex: 10 }} />
                                <FastImage source={{ uri: mediaurl(i?.thumb) }} style={{ height: wp(28), width: wp(28), marginLeft: 18, borderRadius: 8 }} />
                            </Pressable>
                        )
                    })}
                </View>
            </ScrollView> */}
            {athelete?.currentStep == 2 && <>
                <Text style={[styles.boldTxt, { marginHorizontal: 18 }]}>{appkeys.BioStats} :</Text>
                <Text style={[styles.regTxt, { margin: 18, marginVertical: 0, lineHeight: 20 },]} maxFontSizeMultiplier={1.4}>{athelete?.bio}</Text>
                <Text style={[styles.boldTxt, { margin: 18, marginBottom: 8 }]}>{appkeys.Position1}: <Text style={[styles.regTxt]}>{athelete?.position1}</Text></Text>
                <Text style={[styles.boldTxt, { marginHorizontal: 18, marginBottom: 18 }]}>{appkeys.Position2}: <Text style={[styles.regTxt]}>{athelete?.position2}</Text></Text>
                <Text style={[styles.boldTxt, { fontSize: 14, marginHorizontal: 18 }]}>{athelete?.state}</Text>
                {/* <Text style={[styles.boldTxt, { fontSize: 14, marginHorizontal: 18 }]}>{athelete?.city}, {athelete?.state}</Text> */}
                <View style={[{ margin: 18, borderRadius: 6 }]}>
                    <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.GPA} : <Text style={[styles.regTxt]}>{athelete?.gpa == 4 ? "4.0 +" : athelete?.gpa?.toFixed(1)}</Text></Text>
                    {(athelete?.satScore || athelete?.satScore > 0) && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.SATScore} : <Text style={[styles.regTxt]}>{athelete?.satScore}</Text></Text>}
                    {(athelete?.actScore || athelete?.actScore > 0) && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.ACTScore} : <Text style={[styles.regTxt]}>{athelete?.actScore}</Text></Text>}
                    <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.Height} : <Text style={[styles.regTxt]}>{athelete?.heightString}{" "}{athelete?.heightUnit}</Text></Text>
                    <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.Weight} : <Text style={[styles.regTxt]}>{athelete?.weight}{" "} lbs</Text></Text>
                    <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{athelete?.collegeTransferringFrom == "high" ? appkeys.highschool : "College/University Transferring from"}: <Text style={[styles.regTxt]}>{athelete?.collegeTransferringFrom == "high" ? athelete?.highSchoolName : athelete?.transferStudent}</Text></Text>
                    {athelete?.hsCoach && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.Highschoolcoach} : <Text style={[styles.regTxt]}>{athelete?.hsCoach}</Text></Text>}
                    {athelete?.hsCPhone && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.Coachcontact} : <Text style={[styles.regTxt]}>{"+" + athelete?.hsCcc}{athelete?.hsCPhone}</Text></Text>}
                    {athelete?.travelCoach && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.TravelCoach} : <Text style={[styles.regTxt]}>{athelete?.travelCoach}</Text></Text>}
                    {athelete?.travelCoachContact && <Text style={[styles.boldTxt, { marginBottom: 10 }]}>{appkeys.TravelCoachContact} : <Text style={[styles.regTxt]}>{"+" + athelete?.travelCoachCC}{athelete?.travelCoachContact}</Text></Text>}
                </View>
            </>}
            {/* <Text style={[styles.semibTxt, { margin: 18, marginVertical: 8 }]}>{appkeys.Planned_Majors}</Text>
            <View>
                <FlatList
                    scrollEnabled={false}
                    data={athelete?.planMajors || []}
                    numColumns={2}
                    renderItem={({ item, index }) => {
                        return (
                            <View style={{ paddingVertical: 14, marginBottom: 10, width: wp(44), backgroundColor: colors.primary, marginLeft: wp(4), borderRadius: 14, justifyContent: "center", alignItems: "center" }}>
                                <Text maxFontSizeMultiplier={1.2} style={[styles.regTxt, { fontSize: 14, color: colors.white, maxWidth: "90%", textAlign: "center" }]}>{item}</Text>
                            </View>
                        )
                    }}
                />
            </View> */}
        </View>
    )
}

const _renderImg = ({ item }) => {
    const [isloaded, setIsloaded] = useState(false)
    return (
        <>
            {!isloaded && <ActivityIndicator size={"small"} color={"red"} style={{ position: "absolute", zIndex: 100, alignSelf: "center", left: widthPercentageToDP(42) }} />}
            <FastImage onLoad={() => { setIsloaded(true) }} source={{ uri: mediaurl(item) }} style={{ height: "100%", width: wp(92), alignSelf: "center" }} />
        </>
    )
}