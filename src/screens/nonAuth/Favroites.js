import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { mediaurl } from '../../utils/mediarender';
import { endpoints } from '../../api/Services/endpoints';
import { setLoading } from '../../redux/Reducers/load';
import hit from '../../api/Manager/manager';
import { getFavListThunk } from '../../redux/Reducers/favs';
import AppUtils from '../../utils/appUtils';
import AppRoutes from '../../routes/RouteKeys/appRoutes';

const Favroites = ({ navigation }) => {
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const favList = useSelector(state => state?.favs?.favList)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys

    const [allFavs, setAllFavs] = useState([])

    useEffect(() => {
        setAllFavs(favList)
    }, [favList])

    const removeFromFav = async (id) => {
        try {
            dispatch(setLoading(true))
            let res = await hit(`${endpoints.fav}/${id}`, "delete")
            if (!res?.err) {
                dispatch(getFavListThunk())
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (error) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SolidView
            back={true}
            onPressLeft={() => {
                navigation.goBack()
            }}
            title={appkeys.Favourites}
            view={
                <FlatList
                    numColumns={2}
                    data={allFavs}
                    renderItem={({ item, index }) => {
                        return (
                            <FavBlock item={item} index={index}
                                onPressRemove={() => { removeFromFav(item?._id) }}
                                onPressDetail={() => { navigation.navigate(AppRoutes.OtherUserProfile, { user: item?.item?._id }) }}
                            />
                        )
                    }}
                    ListEmptyComponent={() => {
                        return (<Text style={{ textAlign: "center", fontSize: 18, marginTop: 18, fontFamily: AppFonts.Black, color: colors.text }}>No data found.</Text>)
                    }}
                />
            }
        />
    )
}

export default Favroites

const useStyles = (colors) => StyleSheet.create({
    favMain: {
        height: hp(26),
        maxHeight: 300,
        width: wp(42),
        marginLeft: wp(5.2),
        marginTop: wp(6),
    },
    gradient: {
        height: "60%",
        width: "100%",
        borderRadius: 8,
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
    },
    descContainer: {
        backgroundColor: colors.blacktransparent,
        padding: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        position: 'absolute',
        bottom: 0,
        zIndex: 2,
        width: "100%",
    },
    heartView: {
        backgroundColor: colors.blacktransparent,
        position: "absolute",
        right: 4,
        top: 6,
        padding: 8,
        borderRadius: 4,
        zIndex: 2,
    },
    imgfav: {
        height: "100%",
        width: "100%",
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: "center",
    },
})

const FavBlock = ({ item, index, onPressRemove, onPressDetail }) => {
    const isAthlete = useSelector(state => state?.userData?.isAthlete)

    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    const otherUserData = item?.item

    return (
        <View style={styles.favMain}>
            {isAthlete ?
                <FastImage source={{ uri: otherUserData?.profilePic == endpoints.default_pic ? mediaurl(otherUserData?.mascotImages[0]) : mediaurl(otherUserData?.profilePic) }} style={styles.imgfav} />
                :
                <FastImage source={{ uri: otherUserData?.profilePic == endpoints.default_pic ? mediaurl(otherUserData?.photos[0]) : mediaurl(otherUserData?.profilePic) }} style={styles.imgfav} />
            }
            <FastImage source={images.gradfav} style={styles.gradient} />
            {/* heartbtn */}
            <Pressable style={styles.heartView}
                onPress={onPressRemove}
            >
                <Image source={images.whiteheart} style={{ height: 16, width: 16 }} resizeMode='contain' tintColor={colors.red} />
            </Pressable>
            {/* bottomview */}
            <Pressable style={[styles.descContainer]}
                onPress={onPressDetail}
            >
                <View style={[styles.row]}>
                    <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Bold }}>{isAthlete ? otherUserData?.name : otherUserData?.fname}</Text>
                    <Image source={images.i} style={{ height: 12, width: 12, marginLeft: 6, tintColor: colors.white }} />
                </View>
                <Text style={{ marginVertical: 2, color: colors.white, fontSize: 12, fontFamily: AppFonts.Regular }} numberOfLines={1}>{isAthlete ? otherUserData?.programBio : otherUserData?.sports ? otherUserData?.sports[0] : ""}</Text>
            </Pressable>
        </View>
    )
}