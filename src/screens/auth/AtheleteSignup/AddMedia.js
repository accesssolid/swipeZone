import { View, Text, StyleSheet, SafeAreaView, FlatList, ImageBackground, TouchableOpacity, Pressable, ScrollView, Alert, Modal, Linking } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import AuthContainer from '../../components/AuthContainer';
import { LocalizationContext } from '../../../localization/localization';
import AppFonts from '../../../constants/fonts';
import { hp, wp } from '../../../utils/dimension';
import CustomInput from '../../components/CustomInput';
import CustomDrop from '../../components/CustomDrop';
import ImagePicker from 'react-native-image-crop-picker';
import FastImage from 'react-native-fast-image';
import CameraModal from '../../modals/CameraModal';
import AppRoutes from '../../../routes/RouteKeys/appRoutes';
import { createThumbnail } from 'react-native-create-thumbnail';
import AppUtils from '../../../utils/appUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setSignupdata } from '../../../redux/Reducers/signup';
import TrimmerModal from '../../modals/TrimmerModal';
import RequiredTxt from '../../components/RequiredTxt';
import { uploadVideos, uploadVideosFetchblob } from '../../../api/Services/services';
import { setLoading } from '../../../redux/Reducers/load';
import getEnvVars from '../../../../env';
import { Video, createVideoThumbnail } from 'react-native-compressor';

const AddMedia = ({ navigation }) => {
    const dispatch = useDispatch()
    const alldata = useSelector(state => state?.signup?.signupdata)

    const { colors, images } = useTheme();
    const style = useStyles(colors);
    const { localization } = useContext(LocalizationContext);

    const [addpicture, setAddpicture] = useState([])
    const [addvideo, setAddvideo] = useState([])
    const [gallery, setGallery] = useState(false)
    const [mediaType, setMediaType] = useState("photo")
    const [trimVideo, setTrimVideo] = useState(null)
    const [showTrimModal, setShowTrimModal] = useState(false)
    const [showCompressModal, setShowCompressModal] = useState(false)
    const [progress, setProgress] = useState(0)
    const reqVideo = Array(4 - addvideo?.length).fill("video")

    useEffect(() => {
        if (alldata?.photos) {
            setAddpicture(alldata?.photos)
        }
        if (alldata?.videos) {
            setAddvideo(alldata?.videos)
        }
    }, [alldata])

    async function OpenCamera() {
        let cameraAccess = await AppUtils.checkCameraPermisssion()
        if (!cameraAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openCamera({
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
        let galleryAccess = await AppUtils.checkGalleryPermisssion()
        if (!galleryAccess) {
            Linking.openSettings()
            return
        }
        ImagePicker.openPicker({
            mediaType: mediaType,
            multiple: false,
            compressVideoPreset: "MediumQuality",
            // maxFiles: 1
        }).then(image => {
            // console.log(image);
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
        // try {
        //     dispatch(setLoading(true))
        //     // let res = await uploadVideosFetchblob(arr)
        //     let res = await uploadVideos(arr)
        //     console.log(res);
        //     if (res?.data) {
        //         // let allMedia = [...addvideo]?.concat(JSON.parse(res?.data)?.[0])
        //         let allMedia = [...addvideo]?.concat((res?.data)?.[0])
        //         setAddvideo(allMedia)
        //         writeSignupdata("videos", allMedia)
        //     }
        // } catch (e) {
        //     AppUtils.showLog(e, "err uploading video")
        // } finally {
        //     dispatch(setLoading(false))
        // }
        // return
        // const videos = arr.map(async (e) => {
        //     try {
        // const res = await createThumbnail({ url: e?.path, timeStamp: 500 });
        //         return { ...e, thumb: res?.path, };
        //     } catch (err) {
        //         throw err;
        //     }
        // });
        // const videos = arr.map(async (e) => {
        //     try {
        //         const thumbnail = await createVideoThumbnail(e?.path);
        //         const result = await Video.compress(e?.path, { compressionMethod: 'manual', }, (progress) => {
        //             console.log('Compression Progress: ', progress);
        //             setProgress(progress)
        //         });
        //         // const res = await createThumbnail({ url: e?.path, timeStamp: 500 });
        //         console.log(result);
        //         return { ...e, thumb: thumbnail?.path, path: result };
        //     } catch (err) {
        //         throw err;
        //     }
        // });
        // Promise.all(videos).then(results => {
        //     let allMedia = []
        //     allMedia = [...addvideo, ...allMedia, ...results];
        //     setAddvideo(allMedia)
        //     setShowCompressModal(false)
        //     setProgress(0)
        //     writeSignupdata("videos", allMedia)
        // }).catch(err => {
        //     console.error(err);
        // });
    }
    const writeSignupdata = useCallback((key, value) => {
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])
    const onPressNext = () => {
        // if (addpicture?.length == 0) {
        //     AppUtils.showToast("Photo is required.")
        //     return
        // }
        if (addvideo?.length < 2) {
            AppUtils.showToast("Minimum of two videos required.")
            return
        }
        navigation.navigate(AppRoutes.Interest)
    }

    return (
        <AuthContainer
            signupfooter
            progress={"60%"}
            onPressBack={() => {
                navigation.goBack()
            }}
            onPressNext={() => {
                onPressNext()
            }}
            children={
                <View style={style.parent}>
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
                        title={mediaType == "photo" ? "Photo" : "Video"}
                        onPress={() => setGallery(false)}
                        onPressCamera={() => { OpenCamera() }}
                        onPressGallery={() => { OpenImage() }}
                    />
                    <Text style={style.title}>{localization?.appkeys?.UploadHighlights}</Text>
                    <Text style={style.desc}>{localization?.appkeys?.updateanytime}</Text>
                    {alldata?.profilePic && <FastImage source={{ uri: alldata?.profilePic?.path }} style={{ width: wp(25), height: wp(25), margin: wp(4), marginBottom: 0, borderRadius: wp(20), }} />}
                    {/* <RequiredTxt txt={localization?.appkeys?.AddPicture} txtStyle={[style.addimage, { marginTop: 0, marginHorizontal: 0, marginLeft: 18 }]} styleMain={{ marginBottom: 8, marginTop: 18 }} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", paddingHorizontal: 18 }}>
                            {addpicture.concat(["photo"]).map((item, index) => {
                                if (item == "photo") {
                                    if (addpicture.length > 0) {
                                        return null
                                    }
                                    return <PictureBlock item={item} key={index}
                                        styleMain={{ width: wp(25), height: wp(25), marginRight: wp(4) }}
                                        onPress={() => {
                                            if (addpicture.length < 1) {
                                                setGallery(true)
                                                setMediaType(item)
                                                return
                                            }
                                            AppUtils.showToast("Maximum number reached.")
                                        }}
                                    />
                                }
                                return (
                                    <Pressable style={{ width: wp(25), height: wp(25), marginRight: wp(4) }} key={index}
                                        onPress={() => {
                                            let temp = [...addpicture]
                                            temp.splice(index, 1)
                                            setAddpicture(temp)
                                            writeSignupdata("photos", temp)
                                        }}
                                    >
                                        <FastImage source={{ uri: item?.path }} style={{ width: "100%", height: "100%", borderRadius: 4, }} />
                                        <FastImage source={images.bin} style={{ width: 20, height: 20, position: "absolute", top: 4, right: 8 }} />
                                    </Pressable>
                                )
                            })}
                        </View>
                    </ScrollView> */}
                    <Text style={style.addimage}>{localization?.appkeys?.AddVideos}</Text>
                    <Text style={[style.desc, { marginBottom: 8 }]}>{localization?.appkeys?.Pleaseadd}</Text>
                    <FlatList
                        data={addvideo.concat(reqVideo)}
                        numColumns={2}
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        renderItem={({ item, index }) => {
                            if (item == "video") {
                                return <PictureBlock item={item} star={index < 2 ? true : false} styleMain={{ width: wp(45), height: wp(36), marginLeft: wp(4), marginBottom: wp(4) }}
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
                                    {/* <FastImage source={{ uri: getEnvVars()?.fileUrl +/ item?.thumb }} style={{ width: wp(45), height: wp(36), borderRadius: 4, }} /> */}
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
                </View>
            }
        />
    )
}

export default AddMedia;

const useStyles = (colors) => StyleSheet.create({
    uploadmain: {
        backgroundColor: "#FE6F271A",
        borderRadius: 6,
        borderWidth: 1.6,
        borderColor: colors.primary,
        borderStyle: "dashed",
        height: 110,
        width: 110,
        justifyContent: "center",
        alignItems: "center",
    },
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
    videotitle: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 16,
        color: colors.text,
    },
    addvideo: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors.lightblack,
        marginTop: 8
    },
    image: {
        width: wp(25),
        height: wp(25),
        justifyContent: 'center',
        alignItems: "center"
    },
    uploadimage: {
        width: wp(12),
        height: wp(12)
    },
    video: {
        width: wp(45),
        height: wp(25),
        justifyContent: 'center',
        alignItems: "center"
    },
    uploadvideo: {
        width: 40,
        height: 50
    }
});

export const PictureBlock = ({ onPress, styleMain, star }) => {
    const { colors, images } = useTheme();
    const style = useStyles(colors);
    return (
        <TouchableOpacity onPress={onPress} style={[style.uploadmain, styleMain]}>
            {star && <FastImage source={images.star} style={{ height: 8, width: 8, marginLeft: 26 }} resizeMode='contain' />}
            <FastImage source={images.upload} style={style.uploadimage} resizeMode='contain' />
        </TouchableOpacity>
    )
}