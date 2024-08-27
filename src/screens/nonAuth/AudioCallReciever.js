import { Alert, BackHandler, Image, PermissionsAndroid, Platform, StyleSheet, Text, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import AppUtils from '../../utils/appUtils'
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType } from 'react-native-agora'
import getCallToken from '../../utils/callUtils'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { CallBtn } from './Call'
import { useTheme } from '@react-navigation/native'
import AppFonts from '../../constants/fonts'
import AppRoutes from '../../routes/RouteKeys/appRoutes'
import { useDispatch, useSelector } from 'react-redux'
import { clearCallData, updateCallData } from '../../redux/Reducers/call'
import { sendNotification } from '../../api/Services/services'
import { hp, wp } from '../../utils/dimension'
import { mediaurl } from '../../utils/mediarender'
import { sensitiveData } from '../../constants/Sensitive/sensitiveData'

const AudioCallReciever = ({ navigation, route }) => {
    const user = useSelector((state) => state)?.userData?.user;
    const callData = useSelector(state => state?.call?.callData);
    const othercaller = useSelector(state => state?.call?.otherUserData);

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    let callerRef = useRef(null);
    let timer = useRef(0);
    const agoraEngineRef = useRef(null);

    const channelName = callData?.channelName
    // const appId = "186bd5320ce849d880bb92f21eff6853"
    const appId = sensitiveData?.agoraAppId
    const uid = Number(user?._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    const [isJoined, setIsJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState(0);
    const [stateTimer, setStateTimer] = useState(0);

    useEffect(() => {
        startEngine();
    }, [])
    useEffect(() => {
        if (!othercaller) {
            endCall()
        }
    }, [othercaller])
    useEffect(() => {
        const backAction = () => {
            Alert.alert('Are you sure?', 'This call will end.', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'YES', onPress: () => endCall() },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);
    useEffect(() => {
        if (isJoined) {
            agoraEngineRef.current?.setEnableSpeakerphone(false)
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
                appId: appId
            });
            agoraEngine.enableAudio()

            agoraEngine.registerEventHandler({
                onJoinChannelSuccess: () => {
                    // AppUtils.showLog('Successfully joined the channel 12233333 ' + channelName);
                    setIsJoined(true);
                },
                onUserJoined: (_connection, Uid) => {
                    // AppUtils.showLog('Remote user joined with uid ' + Uid);
                    setRemoteUid(Uid);
                    if (!callerRef?.current) {
                        callerRef.current = setInterval(() => {
                            timer.current = timer.current + 1;
                            callTimer(timer.current);
                        }, 1000);
                    }
                },
                onUserOffline: (_connection, Uid) => {
                    // AppUtils.showLog('Remote user left the channel. uid: ' + Uid);
                    endCall();
                },
                onError: (err) => {
                    AppUtils.showLog('Remote user left the channel. uid: ' + err);
                }
            });
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
            // agoraEngineRef.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            let x = await agoraEngineRef.current?.joinChannel(token, channelName, Number(uid), { clientRoleType: ClientRoleType.ClientRoleBroadcaster });
        } catch (e) {
            AppUtils.showLog(e);
        }
    }
    const endCall = () => {
        try {
            // sendNotification({ userIds: [othercaller?._id], title: "Call Ended" })
            agoraEngineRef.current?.leaveChannel();
            dispatch(clearCallData());
            Vibration.vibrate();
            navigation.navigate(AppRoutes.BottomTab);
            setRemoteUid(0);
            setIsJoined(false);
            clearInterval(callerRef.current);
            callerRef.current = null;
            timer.current = 0;
            setStateTimer(0);
        } catch (e) {
            AppUtils.showLog("ending call", e)
        }
    };
    const getToken = async () => {
        try {
            let res = await getCallToken(channelName)
            if (!res?.err) {
                return res?.data?.token
            }
        } catch (e) {
            AppUtils.showLog("getting auth token", e)
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
                            <FastImage source={{ uri: mediaurl(othercaller?.profilePic) }} style={{ height: "100%", width: "100%", borderRadius: 100 }} />
                        </View>
                        <Text style={{ color: colors.white, fontSize: 22, fontFamily: AppFonts.Bold, marginTop: 8 }}>{othercaller?.name || othercaller?.fname}</Text>
                        {/* <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Regular, marginTop: 4 }}>Baseball Program</Text> */}
                        <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Bold, marginTop: 4 }}>{stateTimer != 0 ? stateTimer : 'Ringing...'}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
                        <CallBtn img={callData?.muteMyMic ? images.micmute : images.mic} text={!callData?.muteMyMic ? "Mute" : "Unmute"} onPress={() => { muteAudio() }} />
                        <CallBtn img={images.callend} styleMain={{ backgroundColor: colors.red }}
                            text={"End call"}
                            onPress={() => {
                                endCall()
                            }}
                        />
                        <CallBtn img={callData?.speakerOn ? images.speakeroff : images.speaker} text={!callData?.speakerOn ? "Speaker on" : "Speaker off"} onPress={() => { speakerModeOn() }} />
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AudioCallReciever

const styles = StyleSheet.create({})