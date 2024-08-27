import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { mediaurl } from '../../utils/mediarender';
import AppFonts from '../../constants/fonts';
import { CallBtn } from './Call';
import { hp } from '../../utils/dimension';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { sendNotification } from '../../api/Services/services';
import call, { setHasIncomingCall, updateCallData, updateOtherUserData } from '../../redux/Reducers/call';
import Video from 'react-native-video';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';

const CallReciever = ({ navigation, route }) => {
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const hasIncomingcall = useSelector(state => state?.call?.hasIncomingCall)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();

    const [userData, setUserData] = useState(null)
    const [callType, setCallType] = useState(0)
    const [paused, setPaused] = useState(false);
    const [callAction, setCallAction] = useState(false)
    console.log("hreeeeeeeeeeeeeeeeee");

    useEffect(() => {
        let a = setTimeout(() => {
            if (!callAction) {
                endCall()
            }
        }, 30000)
        return () => {
            clearTimeout(a)
        }
    }, [callAction, userData])
    // useFocusEffect(useCallback(() => {
    //     console.log("hrehse");
    //     // let a = setTimeout(() => {
    //     //     console.log("hreeeeeeeeeeeeeeeeee");
    //     //     if (!callAction) {
    //     //         console.log("hreeee");
    //     //         endCall()
    //     //     }
    //     // }, 30000)
    //     // return () => {
    //     //     clearTimeout(a)
    //     // }
    // }, [route?.params?.data, callAction, hasIncomingcall]))
    useEffect(() => {
        if (route?.params?.data) {
            setPaused(false)
            let temp = route?.params?.data?.extraData || null
            if (temp) {
                temp = JSON.parse(temp)
                if (temp?.type == "videocall") {
                    setCallType(1)
                }
                setUserData(temp?.user)
                dispatch(updateOtherUserData(temp?.user))
                dispatch(setHasIncomingCall(1))
                dispatch(updateCallData({ appId: temp?.appId, channelName: temp?.channelName, uid: temp?.uid }))
            }
        }
    }, [route?.params?.data])
    useEffect(() => {
        if (hasIncomingcall == 2) {
            dispatch(setHasIncomingCall(0))
            navigation.navigate(AppRoutes.BottomTab)
        }
    }, [hasIncomingcall])

    const onPickUpCall = () => {
        setCallAction(true)
        setPaused(true)
        if (callType == 1) {
            setTimeout(() => {
                // navigation.navigate(AppRoutes.VideoCall,{cName:})
                navigation.navigate(AppRoutes.VideoCall)
            }, 100);
            return
        }
        setTimeout(() => {
            navigation.navigate(AppRoutes.AudioCallReciever)
        }, 100);
    }
    const endCall = async () => {
        setCallAction(false)
        setPaused(true)
        let body = { userIds: [userData?._id], title: "Call Ended", body: "Call Declined" }
        try {
            let res = await hit(endpoints?.notifications?.noti, "post", body)
            if (!res?.err) {
                navigation.goBack()
            }
        } catch (e) {
            AppUtils.showLog(e, "notification chat")
        }
    }

    return (
        <ImageBackground source={images.splashgrad} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Video source={images.calling} resizeMode="contain" audioOnly={true} paused={paused} style={{ width: 0, height: 0 }} repeat={true} />
            <FastImage source={{ uri: mediaurl(userData?.profilePic) }} style={{ height: 120, width: 120, borderRadius: 100, borderWidth: 4, borderColor: colors.white }} />
            <Text style={{ color: colors.white, fontSize: 22, fontFamily: AppFonts.Bold, marginTop: 8 }}>{isAthlete ? userData?.name : userData?.fname}</Text>
            <View style={{ flexDirection: "row", width: "60%", marginTop: hp(16), justifyContent: 'space-between' }}>
                <CallBtn img={callType == 1 ? images.videoon : images.callend} styleMain={{ backgroundColor: colors.primary }}
                    text={"Accept"}
                    onPress={() => {
                        onPickUpCall()
                    }}
                />
                <CallBtn img={images.callend} imgStyle={{ transform: [{ rotate: '136deg' }] }} styleMain={{ backgroundColor: colors.red }}
                    text={"Decline"}
                    onPress={() => {
                        endCall()
                    }}
                />
            </View>
        </ImageBackground>
    )
}

export default CallReciever

const styles = StyleSheet.create({})