import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { LocalizationContext } from '../../localization/localization';
import { Atheleteprofile, Uniprofile } from './Profile';
import { useDispatch, useSelector } from 'react-redux';
import { hp } from '../../utils/dimension';
import CustomBtn from '../components/CustomBtn';
import { useTheme } from '@react-navigation/native';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import BlockUserModal from '../modals/BlockUserModal';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import firestore from '@react-native-firebase/firestore';

const OtherUserProfile = ({ navigation, route }) => {
    const { user } = route?.params

    const dispatch = useDispatch()

    const userMe = useSelector(state => state?.userData)?.user
    const isAthlete = useSelector(state => state?.userData?.isAthlete)

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys

    const [userDetail, setUserDetail] = useState(null)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [userBlockedModal, setUserBlockedModal] = useState(false)
    const [roomId, setRoomId] = useState("") //chat roomId

    useEffect(() => {
        if (user) {
            getUserDetail(user)
        }
    }, [user])
    useEffect(() => {
        if (user && userMe) {
            setRoomId(getRoomId(user, userMe?._id))
        }
    }, [user, userMe])

    const getRoomId = (u1, u2) => {
        let temp = [u1, u2]?.sort()?.join("_")
        return temp
    }
    const getUserDetail = async (id) => {
        try {
            dispatch(setLoading(true))
            let res = await hit(`${endpoints?.user}/${id}`, "get")
            if (!res?.err) {
                setUserDetail(res?.data)
            } else {
                AppUtils.showToast(res?.msg ?? appkeys.Sthw)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const onBlockPress = async () => {
        let chatId = ""
        if (roomId == "") {
            chatId = getRoomId(user, userMe?._id)
        } else {
            chatId = roomId
        }
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints?.blocks, "post", { user: userDetail?._id })
            console.log(res);
            if (!res?.err) {
                setShowBlockModal(false)
                setTimeout(() => {
                    setUserBlockedModal(true)
                }, 200);
                blockInChat(chatId)
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const blockInChat = async (room) => {
        try {
            firestore().collection("chats").doc(room).get().then(res => {
                if (res?.exists) {
                    let temp = { isBlocked: true, blockedBy: userMe?._id }
                    firestore().collection("chats").doc(room).set(temp, { merge: true })
                }
            })
        } catch (e) {
            AppUtils.showLog(e, "erooor block in chat")
        }
    }

    return (
        <SolidView
            back={true}
            title={appkeys.Profile}
            onPressLeft={() => {
                navigation.goBack()
            }}
            view={
                <ScrollView showsVerticalScrollIndicator={false}>
                    <BlockUserModal vis={showBlockModal}
                        onOutsidePress={() => setShowBlockModal(false)}
                        onPressOk={() => {
                            onBlockPress()
                        }}
                    />
                    <BlockUserModal
                        blocked={true}
                        vis={userBlockedModal}
                        onOutsidePress={() => setUserBlockedModal(false)}
                        onPressOk={() => {
                            setUserBlockedModal(false)
                            setTimeout(() => {
                                navigation.navigate(AppRoutes.BlockedAccounts)
                            }, 200);
                        }}
                    />
                    {userDetail &&
                        !isAthlete ?
                        <Atheleteprofile athelete={userDetail} />
                        :
                        <Uniprofile university={userDetail} />
                    }
                    <CustomBtn btnStyle={{ backgroundColor: colors.red }}
                        titleTxt={appkeys.BlockUser}
                        onPress={() => {
                            setShowBlockModal(true)
                        }}
                    />
                    <CustomBtn
                        titleTxt={appkeys.ReportUser}
                        onPress={() => {
                            navigation?.navigate(AppRoutes.ReportUser)
                        }}
                    />
                    <View style={{ height: hp(4) }} />
                </ScrollView>
            }
        />
    )
}

export default OtherUserProfile

const styles = StyleSheet.create({})