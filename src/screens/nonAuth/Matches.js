import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import { mediaurl } from '../../utils/mediarender';
import MatchModal from '../modals/MatchModal';
import { wp } from '../../utils/dimension';
import { getNoInteractionMatches } from '../../redux/Reducers/matches';
import { chattingEnabled } from '../../utils/SubscriptionCheck';

const Matches = ({ navigation }) => {
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const subFeatures = useSelector(state => state?.subcriptions?.features)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors)
    const appkeys = localization?.appkeys

    const [allMatches, setAllMatches] = useState([])
    const [gettingMore, setGettingMore] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [matchId, setMatchId] = useState(null)
    const [matchModal, setMatchModal] = useState(false)

    // for pagination
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(1)
    const limit = 20

    useFocusEffect(
        useCallback(() => {
            getAllMatches();
        }, [])
    );
    const getAllMatches = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(`${endpoints.swipes.matches}?populate=to,by&limit=${limit}`, "get")
            if (!res?.err) {
                setPage(res?.data?.page)
                setTotalPages(res?.data?.totalPages)
                setTotalResults(res?.data?.totalResults)

                setAllMatches(res?.data?.results)
            } else {
                AppUtils.showToast(res?.msg ?? appkeys.Sthw)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const loadMore = async () => {
        if ((page < totalPages)) {
            getMoreMatches(page + 1)
        }
    }
    const getMoreMatches = async (page) => {
        try {
            setGettingMore(true)
            let res = await hit(`${endpoints.swipes.matches}?populate=to,by&page=${page}&limit=${limit}`, "get")
            if (!res?.err) {
                setPage(res?.data?.page)
                setTotalPages(res?.data?.totalPages)
                setTotalResults(res?.data?.totalResults)

                let temp = [...allMatches]
                temp.concat(res?.data?.results)
                setAllMatches(temp)
            } else {
                AppUtils.showToast(res?.msg ?? appkeys.Sthw)
            }
        } catch (e) {
        } finally {
            setGettingMore(false)
        }
    }
    const closeModal = () => {
        setMatchId(null)
        setMatchModal(false)
    }
    const removeMatch = async (matchId) => {
        closeModal()
        try {
            let res = await hit(`${endpoints.swipes.matches}/${matchId}`, "delete")
            if (!res?.err) {
                let newArr = allMatches.filter(x => x?._id != matchId)
                setAllMatches(newArr)
                dispatch(getNoInteractionMatches())
            } else {
                AppUtils.showToast(res?.msg ?? appkeys?.Sthw)
            }
        } catch (e) {
        } finally {
        }
    }

    return (
        <SolidView
            title={isAthlete ? appkeys.Matches : appkeys.Recruits}
            view={
                <View style={{ flex: 1 }}>
                    <MatchModal
                        vis={matchModal}
                        onOutsidePress={() => {
                            closeModal()
                        }}
                        onPressOk={() => {
                            removeMatch(matchId)
                        }}
                    />
                    <FlatList
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={() => { setPage(1); getAllMatches() }}
                            />
                        }
                        data={allMatches}
                        contentContainerStyle={{ paddingTop: 18, paddingBottom: 50, flex: 1 }}
                        renderItem={({ item, index }) => {
                            return (
                                <MatchBlock item={item} index={index}
                                    onPress={(user) => {  // returns id of the user
                                        navigation.navigate(AppRoutes.OtherUserProfile, { user })
                                    }}
                                    onPressMessage={(u) => { // returns user obj
                                        if (isAthlete && !chattingEnabled(subFeatures)) {
                                            AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
                                            navigation?.navigate(AppRoutes?.Subscription)
                                            return
                                        }
                                        navigation.navigate(AppRoutes.InnerChat, { otherUserData: u })
                                    }}
                                    onLongPress={() => {
                                        setMatchId(item?._id)
                                        setMatchModal(true)
                                    }}
                                />
                            )
                        }}
                        ListEmptyComponent={() => {
                            return (<Text style={{ textAlign: "center", fontSize: 18, fontFamily: AppFonts.Black, color: colors.text }}>No matches yet.</Text>)
                        }}
                        onEndReached={() => {
                            loadMore()
                        }}
                    />
                    {gettingMore && <ActivityIndicator color={colors.primary} size={"large"} />}
                </View>
            }
        />
    )
}

export default Matches

const useStyles = (colors) => StyleSheet.create({
    matchMain: {
        justifyContent: 'space-between',
        marginHorizontal: 18,
        backgroundColor: colors.white,
        padding: 10,
        borderRadius: 10,
        maxHeight: 100,
        marginBottom: 10
    },
    row: {
        flexDirection: "row",
        alignItems: 'center',
    },
    shadow: {
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 2,
        shadowOpacity: 0.2,

        elevation: 1
    },
})

const MatchBlock = ({ item, onPress, onPressMessage, onLongPress }) => {
    const user = useSelector(state => state?.userData)?.user
    const isAthlete = useSelector(state => state?.userData?.isAthlete)

    const { colors, images } = useTheme();
    const styles = useStyles(colors)
    const matchUser = item?.by?._id == user?._id ? item?.to : item?.by

    return (
        <Pressable style={[styles.row, styles.matchMain, styles.shadow]}
            onPress={() => { onPress(matchUser?._id) }}
            onLongPress={onLongPress}
        >
            <FastImage source={{ uri: mediaurl(matchUser?.profilePic) }} style={{ height: wp(16), width: wp(16), borderRadius: 60, marginRight: 10, borderColor: colors.primary, borderWidth: 2 }} />
            <View style={{ height: "100%", width: wp(46), justifyContent: 'center' }}>
                <View style={styles.row}>
                    <Text style={{ fontFamily: AppFonts.SemiBold, fontSize: 16, color: colors.text }}>{isAthlete ? matchUser?.name : matchUser?.fname}</Text>
                    <FastImage source={images.i} style={{ height: 14, width: 14, marginLeft: 4 }} />
                </View>
                <Text style={{ fontFamily: AppFonts.Regular, fontSize: 10, color: colors.text, marginTop: 4 }}>{matchUser?.sports ? matchUser?.sports[0] : ""}</Text>
            </View>
            <Pressable style={{ backgroundColor: colors.primary, height: 40, width: wp(20), borderRadius: 40, justifyContent: "center", alignItems: 'center' }}
                onPress={() => { onPressMessage(matchUser) }}
            >
                <FastImage source={images.message} style={{ height: "56%", width: "60%", borderRadius: 4 }} resizeMode='contain' />
            </Pressable>
        </Pressable>
    )
}