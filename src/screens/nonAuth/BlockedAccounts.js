import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import SolidView from '../components/SolidView'
import { LocalizationContext } from '../../localization/localization';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import UnblockUserModal from '../modals/UnblockUserModal';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { mediaurl } from '../../utils/mediarender';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../redux/Reducers/load';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import AppUtils from '../../utils/appUtils';
import firestore from '@react-native-firebase/firestore';

const BlockedAccounts = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys

    const userMe = useSelector(state => state?.userData)?.user


    const [blockList, setBlockList] = useState([])
    const [showUnBlockModal, setShowUnBlockModal] = useState(false)
    const [userUnblockedModal, setUserUnblockedModal] = useState(false)
    const [unblockUser, setUnblockUser] = useState(null)

    useFocusEffect(useCallback(() => {
        setTimeout(() => {
            getAllBlockedAccounts()
        }, 400);
    }, []))

    const getAllBlockedAccounts = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints?.blocks, "get")
            if (!res?.err) {
                setBlockList(res?.data)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const onUnblock = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(`${endpoints?.blocks}/${unblockUser}`, "delete")
            if (!res?.err) {
                setShowUnBlockModal(false)
                setTimeout(() => {
                    setUserUnblockedModal(true)
                }, 200);
                unblockInChat(unblockUser)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
            setTimeout(() => {
                getAllBlockedAccounts()
            }, 400);
        }
    }
    const unblockInChat = async (u1) => {
        let room = [u1, userMe?._id]?.sort()?.join("_") || ""
        if (room == "") {
            room = [u1, userMe?._id]?.sort()?.join("_")
        }
        try {
            firestore().collection("chats").doc(room).get().then(res => {
                if (res?.exists) {
                    let temp = { isBlocked: false, blockedBy: "" }
                    firestore().collection("chats").doc(room).set(temp, { merge: true })
                }
            })
        } catch (e) {
            AppUtils.showLog(e, "erooor unblock in chat")
        }
    }

    return (
        <SolidView
            back={true}
            onPressLeft={() => { navigation.navigate(AppRoutes.BottomTab, { screen: AppRoutes.Home }) }}
            title={appkeys.BlockedAccounts}
            view={
                <View>
                    <UnblockUserModal vis={showUnBlockModal}
                        onOutsidePress={() => setShowUnBlockModal(false)}
                        onPressOk={() => {
                            onUnblock()
                        }}
                    />
                    <UnblockUserModal vis={userUnblockedModal}
                        unblocked={true}
                        onOutsidePress={() => setShowUnBlockModal(false)}
                        onPressOk={() => {
                            setUserUnblockedModal(false)
                        }}
                    />
                    <FlatList
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        data={blockList}
                        contentContainerStyle={{ paddingBottom: 38, paddingTop: 18 }}
                        renderItem={({ item, index }) => {
                            return (
                                <BlockedUsers item={item} index={index}
                                    onPressUnblock={() => {
                                        setUnblockUser(item?.blocked_user?._id)
                                        setShowUnBlockModal(true)
                                    }}
                                />
                            )
                        }}
                        ListEmptyComponent={() => {
                            return (<Text style={{ textAlign: "center", fontSize: 18, fontFamily: AppFonts.Black, color: colors.text }}>No data found.</Text>)
                        }}
                    />
                </View>
            }
        />
    )
}

export default BlockedAccounts

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3,
        shadowOpacity: 0.2,

        elevation: 1
    },
    row: {
        flexDirection: "row",
        alignItems: 'center',
    },
})

const BlockedUsers = ({ item, onPress, onPressUnblock }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);

    const blockeduser = item?.blocked_user

    return (
        <Pressable style={[styles.row, { justifyContent: 'space-between', marginHorizontal: 18, backgroundColor: colors.white, padding: 10, borderRadius: 10 }, styles.shadow]}
            onPress={onPress}
        >
            <View style={{ maxWidth: "56%", flexDirection: "row", alignItems: "center" }}>
                <FastImage source={{ uri: mediaurl(blockeduser?.profilePic) }} style={{ height: 60, width: 60, borderRadius: 60, borderColor: colors.primary, borderWidth: 2 }} />
                <Text style={{ fontFamily: AppFonts.Medium, fontSize: 16, color: colors.text, marginLeft: 4 }}>{blockeduser?.name}</Text>
            </View>
            <Pressable style={{ backgroundColor: colors.primary, height: 40, width: 88, borderRadius: 40, justifyContent: "center", alignItems: 'center' }}
                onPress={onPressUnblock}
            >
                <Text style={{ fontFamily: AppFonts.Regular, fontSize: 10, color: colors.white, marginTop: 4 }}>{localization?.appkeys?.Unblock}</Text>
            </Pressable>
        </Pressable>
    )
}