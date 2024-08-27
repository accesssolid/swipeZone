import { Alert, BackHandler, ImageBackground, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import { CallBtn } from './Call';
import { hp, wp } from '../../utils/dimension';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import AppUtils from '../../utils/appUtils';
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType, RtcSurfaceView } from 'react-native-agora';
import getCallToken from '../../utils/callUtils';
import { sendNotification } from '../../api/Services/services';
import { clearCallData, updateCallData } from '../../redux/Reducers/call';
import Draggable from 'react-native-draggable';
import firestore from '@react-native-firebase/firestore'
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { sensitiveData } from '../../constants/Sensitive/sensitiveData';

const VideoCall = ({ navigation, route }) => {
    const user = useSelector((state) => state)?.userData?.user;
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const othercaller = useSelector(state => state?.call?.otherUserData)
    const callData = useSelector(state => state?.call?.callData);

    const { colors, images } = useTheme();
    const dispatch = useDispatch()
    let callerRef = useRef(null);
    let timer = useRef(0);
    const agoraEngineRef = useRef(null);

    // const channelName =  ("SwipeRightVideo").toString()
    const channelName = callData?.channelName ? callData?.channelName : Number(user._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    const uid = Number(user?._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    // const appId = "186bd5320ce849d880bb92f21eff6853"
    const appId = sensitiveData?.agoraAppId

    const [otherUser, setOtherUser] = useState(null)
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(0);
    const [stateTimer, setStateTimer] = useState(0);
    const [enableVideo, setEnableVideo] = useState(false);
    const [room, setRoom] = useState("")
    const [otherUserCallInfo, setOtherUserCallInfo] = useState(null)

    const getCallRef = (room) => {
        return firestore().collection("calling").doc(room)
    }

    useEffect(() => {
        if (othercaller) {
            setOtherUser(othercaller)
        } else {
            leave()
        }
    }, [othercaller])
    useEffect(() => {
        if (otherUser) {
            startEngine();
        }
    }, [otherUser])
    useEffect(() => {
        const backAction = () => {
            Alert.alert('Are you sure?', 'This call will end.', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'YES', onPress: () => leave() },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);
    useEffect(() => {
        agoraEngineRef.current?.setEnableSpeakerphone(true)
    }, [isJoined])
    useEffect(() => {
        if (user?._id && otherUser?._id) {
            setRoom([user?._id, otherUser?._id].sort().join("_"))
        }
    }, [user, otherUser])
    useEffect(() => {
        if (room) {
            getCallRef(room).set({ [user?._id]: { videoPaused: callData?.videoPaused || false } }, { merge: true })
        }
    }, [callData, room])
    useEffect(() => {
        let unsub = getCallRef(room).onSnapshot((snapshot) => {
            let temp = snapshot?.data()
            setOtherUserCallInfo(temp?.[otherUser?._id])
        })
        return () => {
            unsub()
        }
    }, [room])
    useEffect(() => {
        if (isJoined) {
            agoraEngineRef.current?.setEnableSpeakerphone(true)
        }
    }, [isJoined])

    const startEngine = async () => {
        try {
            if (Platform.OS === 'android') {
                await getPermission()
            };
            agoraEngineRef.current = createAgoraRtcEngine();
            const agoraEngine = agoraEngineRef.current;
            await agoraEngine.initialize({
                appId: appId,
            });

            agoraEngine.enableVideo();
            agoraEngine.startPreview();
            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    AppUtils.showLog('Successfully joined the video call channel ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    AppUtils.showLog('Remote user joined video call with uid ' + Uid);
                    setRemoteUid(Uid);
                    // if (!callerRef?.current) {
                    //     callerRef.current = setInterval(() => {
                    //         timer.current = timer.current + 1;
                    //         callTimer(timer.current);
                    //     }, 1000);
                    // }
                },
                onUserOffline: (_connection, Uid) => {
                    AppUtils.showLog('Remote user left the video call channel. uid: ' + Uid);
                    leave();
                },
                onError: (err) => {
                    AppUtils.showLog('Remote user left the video call channel. uid: ' + err);
                }
            });
            if (!callData) {
                let data = {
                    "channelName": channelName,
                    "uid": uid,
                    "user": user,
                    "type": "videocall",
                    "notiType": "4",
                    "call": true
                }
                let extraData = JSON.stringify(data)
                let body = {
                    userIds: [otherUser?._id],
                    payload: {
                        title: isAthlete ? user?.fname : user?.name,
                        sound: "calling.mp3",
                        body: "Video Call",
                        channel_id: "call",
                        data: { extraData }
                    }
                }
                dispatch(updateCallData(data))
                let res = await sendNotification(body)
            }
            join();
        } catch (e) {
            AppUtils.showLog(e);
        }
    };
    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.CAMERA,
            ]);
        }
    };
    const join = async () => {
        if (isJoined) {
            return;
        }
        try {
            let token = await getToken();
            agoraEngineRef.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            let a = agoraEngineRef.current?.joinChannel(token, channelName, Number(uid), { clientRoleType: ClientRoleType.ClientRoleBroadcaster });
        } catch (e) {
            AppUtils.showLog(e);
        }
    };
    const getToken = async () => {
        try {
            let res = await getCallToken(channelName)
            if (!res?.err) {
                return res?.data?.token
            } else {
                return null
            }
        } catch (e) {
            AppUtils.showLog("getting auth token", e)
        }
    };
    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            dispatch(clearCallData())
            navigation.navigate(AppRoutes.BottomTab);
            setRemoteUid(0);
            setIsJoined(false);
            Vibration.vibrate();
            clearInterval(callerRef.current);
            callerRef.current = null;
            timer.current = 0;
            setStateTimer(0);
            getCallRef(room).delete()
            endCallByNotification()
        } catch (e) {
            AppUtils.showLog(e, "Video Call Ended");
        }
    };
    const endCallByNotification = async () => {
        let body = { userIds: [otherUser?._id], title: "Call Ended", body: "Video Call" }
        try {
            let res = await hit(endpoints?.notifications?.noti, "post", body)
        } catch (e) {
        }
    }
    const muteMic = async () => {
        if (callData?.muteMyMic) {
            let temp = { ...callData }
            if (temp?.muteMyMic) {
                delete temp?.muteMyMic
            }
            agoraEngineRef.current?.muteLocalAudioStream(false)
            dispatch(updateCallData(temp))
        } else {
            let temp = { ...callData, muteMyMic: true }
            agoraEngineRef.current?.muteLocalAudioStream(true)
            dispatch(updateCallData(temp))
        }
    };
    const switchCamera = () => {
        agoraEngineRef.current?.switchCamera()
    };
    const cameraToggle = () => {
        if (callData?.videoPaused) {
            let temp = { ...callData }
            if (temp?.videoPaused) {
                delete temp?.videoPaused
            }
            agoraEngineRef.current?.enableLocalVideo(true)
            dispatch(updateCallData(temp))
        } else {
            let temp = { ...callData, videoPaused: true }
            agoraEngineRef.current?.enableLocalVideo(false)
            dispatch(updateCallData(temp))
        }
    };
    const bigView = () => {
        return (
            <RtcSurfaceView
                canvas={{ uid: remoteUid }}
                style={{ width: '100%', height: '100%' }}
            />
        );
    };
    const smallView = () => {
        return (
            <RtcSurfaceView
                zOrderMediaOverlay={Platform.OS === 'ios' ? false : true}
                zOrderOnTop={Platform.OS === 'ios' ? false : true}
                canvas={{ uid: 0 }}
                style={{ width: '100%', height: '100%' }}
            />
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    {isJoined && <React.Fragment key={0}>
                        {otherUserCallInfo?.videoPaused == true ?
                            <View style={{ width: '100%', height: '100%', justifyContent: "center", alignItems: "center", backgroundColor: colors.black }}>
                                <FastImage source={images.logo} style={{ width: '50%', height: '30%' }} resizeMode='contain' />
                            </View>
                            :
                            bigView()
                        }
                    </React.Fragment>}
                    {isJoined && remoteUid != 0 &&
                        <React.Fragment key={1}>
                            <Draggable x={wp(100) - 160} y={10} maxX={wp(100)} maxY={hp(80)} minX={0} minY={0}>
                                <View style={{ height: 200, width: 150 }}>
                                    <Pressable style={{ width: '100%', height: '100%' }}>
                                        {!callData?.videoPaused ? smallView() : <View />}
                                    </Pressable>
                                </View>
                            </Draggable>
                        </React.Fragment>
                    }
                    <View style={{ alignItems: 'center', bottom: hp(6), position: "absolute", alignSelf: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", paddingHorizontal: 16 }}>
                            <CallBtn img={images.camerarotate} text={"Switch"} onPress={() => switchCamera()} />
                            <CallBtn img={!callData?.videoPaused ? images.videooff : images.videoon} text={!callData?.videoPaused ? "Video off" : "Video on"} onPress={() => cameraToggle()} />
                            <CallBtn img={!callData?.muteMyMic ? images.micmute : images.mic} text={!callData?.muteMyMic ? "Mute" : "Unmute"} onPress={() => muteMic()} />
                            <CallBtn img={images.callend} styleMain={{ backgroundColor: colors.red }}
                                text={"End call"}
                                onPress={() => {
                                    leave();
                                }}
                            />
                        </View>

                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default VideoCall

const styles = StyleSheet.create({})