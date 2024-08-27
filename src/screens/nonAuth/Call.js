import { Alert, BackHandler, Image, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { createAgoraRtcEngine, ClientRoleType, ChannelProfileType, } from 'react-native-agora'
import hit from '../../api/Manager/manager';
import AppUtils from '../../utils/appUtils';
import { endpoints } from '../../api/Services/endpoints';
import getCallToken from '../../utils/callUtils';
import { sendNotification } from '../../api/Services/services';
import { clearCallData, updateCallData } from '../../redux/Reducers/call';
import { mediaurl } from '../../utils/mediarender';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { hp, wp } from '../../utils/dimension';
import { sensitiveData } from '../../constants/Sensitive/sensitiveData';

const Call = ({ navigation, route }) => {
    const user = useSelector((state) => state)?.userData?.user;
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const othercaller = useSelector(state => state?.call?.otherUserData)
    const callData = useSelector(state => state?.call?.callData);

    const { colors, images } = useTheme();
    const dispatch = useDispatch()
    let callerRef = useRef(null);
    let timer = useRef(0);
    const agoraEngineRef = useRef(null);

    // const channelName = ("SwipeRight").toString()
    const channelName = Number(user._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    const uid = Number(user?._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    // const appId = "186bd5320ce849d880bb92f21eff6853"
    const appId = sensitiveData?.agoraAppId

    const [otherUser, setOtherUser] = useState({})
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(0);
    const [stateTimer, setStateTimer] = useState(0);

    useEffect(() => {
        if (othercaller) {
            setOtherUser(othercaller)
        } else {
            leave()
        }
    }, [othercaller])
    useEffect(() => {
        startEngine();
    }, [otherUser])
    useEffect(() => {
        if (isJoined) {
            agoraEngineRef.current?.setEnableSpeakerphone(false)
        }
    }, [isJoined])
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
    }
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
            agoraEngine.enableAudio()
            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    AppUtils.showLog('Successfully joined the channel ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    AppUtils.showLog('Remote user joined with uid ' + Uid);
                    setRemoteUid(Uid);
                    if (!callerRef?.current) {
                        callerRef.current = setInterval(() => {
                            timer.current = timer.current + 1;
                            callTimer(timer.current);
                        }, 1000);
                    }
                },
                onUserOffline: (_connection, Uid) => {
                    AppUtils.showLog('Remote user left the channel. uid: ' + Uid);
                    leave();
                },
                onError: (err) => {
                    AppUtils.showLog('Remote user left the channel. uid: ' + err);
                }
            });
            let data = {
                "channelName": channelName,
                "uid": uid,
                "user": user,
                "type": "audiocall",
                "notiType": "4",
                "call": true
            }
            let extraData = JSON.stringify(data)
            let body = {
                userIds: [otherUser?._id],
                payload: {
                    title: isAthlete ? user?.fname : user?.name,
                    sound: "calling.mp3",
                    body: "Voice Call",
                    channel_id: "call",
                    data: { extraData }
                }
            }
            dispatch(updateCallData(data))
            let res = await sendNotification(body)
            join();
        } catch (e) {
            AppUtils.showLog(e);
        }
    }
    const getPermission = async () => {
        if (Platform.OS === 'android') {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
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
    }
    const leave = () => {
        try {
            agoraEngineRef.current?.leaveChannel();
            dispatch(clearCallData());
            navigation.navigate(AppRoutes.BottomTab);
            setRemoteUid(0);
            setIsJoined(false);
            Vibration.vibrate();
            clearInterval(callerRef.current);
            callerRef.current = null;
            timer.current = 0;
            setStateTimer(0);
            endCallByNotification()
        } catch (e) {
            AppUtils.showLog(e, "Call Ended");
        }
    };
    const endCallByNotification = async () => {
        let body = { userIds: [otherUser?._id], title: "Call Ended", body: "Audio Call" }
        try {
            let res = await hit(endpoints?.notifications?.noti, "post", body)
        } catch (e) {
        }
    }
    const muteAudio = () => {
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
    }
    const speakerModeOn = () => {
        if (callData?.speakerOn) {
            let temp = { ...callData }
            if (temp?.speakerOn) {
                delete temp?.speakerOn
            }
            agoraEngineRef.current?.setEnableSpeakerphone(false)
            dispatch(updateCallData(temp))
        } else {
            let temp = { ...callData, speakerOn: true }
            agoraEngineRef.current?.setEnableSpeakerphone(true)
            dispatch(updateCallData(temp))
        }
    }
    const callTimer = (duration) => {
        // Hours, minutes and seconds
        var hrs = ~~(duration / 3600);
        var mins = ~~((duration % 3600) / 60);
        var secs = ~~duration % 60;
        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        setStateTimer(ret)
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <View style={{ flex: 1, backgroundColor: colors.grey, justifyContent: 'space-around' }}>
                    <Image source={images.logocolor} style={{ height: hp(16), width: wp(50), resizeMode: "contain", position: "absolute", top: hp(40), alignSelf: "center" }} />
                    <View style={{ justifyContent: "center", alignItems: 'center' }}>
                        <View style={{ height: 120, width: 120, borderRadius: 100, borderWidth: 4, borderColor: colors.white }}>
                            <FastImage source={{ uri: mediaurl(otherUser?.profilePic) }} style={{ height: "100%", width: "100%", borderRadius: 100 }} />
                        </View>
                        <Text style={{ color: colors.white, fontSize: 22, fontFamily: AppFonts.Bold, marginTop: 8 }}>{otherUser?.name}</Text>
                        {/* <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Regular, marginTop: 4 }}>Baseball Program</Text> */}
                        <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Bold, marginTop: 4 }}>{stateTimer != 0 ? stateTimer : 'Ringing...'}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <CallBtn img={callData?.muteMyMic ? images.micmute : images.mic} text={!callData?.muteMyMic ? "Mute" : "Unmute"} onPress={() => { muteAudio() }} />
                        <CallBtn img={images.callend} styleMain={{ backgroundColor: colors.red }} text={"End call"}
                            onPress={() => {
                                leave();
                            }}
                        />
                        <CallBtn img={callData?.speakerOn ? images.speakeroff : images.speaker} text={!callData?.speakerOn ? "Speaker on" : "Speaker off"} onPress={() => { speakerModeOn() }} />
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Call

const styles = StyleSheet.create({})

export const CallBtn = ({ img, text, styleMain, imgStyle, onPress }) => {
    const { colors, images } = useTheme();
    return (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Pressable style={[{ justifyContent: 'center', alignItems: "center", height: 62, width: 62, borderRadius: 80, backgroundColor: colors.primary }, styleMain]}
                onPress={onPress}
            >
                <FastImage source={img} style={[{ height: "40%", width: "50%" }, imgStyle]} resizeMode='contain' />
            </Pressable>
            <Text style={{ fontSize: 10, fontFamily: AppFonts.Regular, color: colors.white, marginTop: 4, textAlign: "center" }}>{text}</Text>
        </View>
    )
}