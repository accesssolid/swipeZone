import { FlatList, Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigation, useTheme } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import FastImage from 'react-native-fast-image'
import { mediaurl } from '../../utils/mediarender'
import { hp, wp } from '../../utils/dimension'
import AppFonts from '../../constants/fonts'
import { endpoints } from '../../api/Services/endpoints'
import AppRoutes from '../../routes/RouteKeys/appRoutes'
import { getDistance } from 'geolib';

const CardBlock = ({ card, heartPressed, onPressLoc }) => {
    const isAthlete = useSelector(state => state?.userData?.isAthlete)
    const favList = useSelector(state => state?.favs?.favList)
    const user = useSelector(state => state?.userData)?.user

    const scrollRef = useRef()
    const navigation = useNavigation()
    const { colors, images } = useTheme();
    const styles = useStyles(colors)

    const [activeIndex, setActiveIndex] = useState(0)
    const [displayImg, setDisplayImg] = useState([])
    const [isFav, setIsFav] = useState(false)
    const [distance, setDistance] = useState(0)

    const cardHeight = Platform?.OS == "ios" ? hp(72) : hp(78)

    useEffect(() => {
        if (card) {
            let temp = []
            if (isAthlete) {
                temp = card.mascotImages?.map(e => e)
                if (card.profilePic != endpoints.default_pic) {
                    temp?.splice(0, 0, card.profilePic)
                }
            } else {
                let imgs = card?.photos?.map(e => e)
                let vids = card?.videos?.map(e => e)
                // temp = imgs.concat(vids)
                temp = vids
                if (card.profilePic != endpoints.default_pic) {
                    temp?.splice(0, 0, card.profilePic)
                }
            }
            setDisplayImg(temp)
        }
    }, [card, isAthlete])
    useEffect(() => {
        favList.filter(x => x?.item?._id == card?._id)?.length > 0 ?
            setIsFav(true)
            :
            setIsFav(false)
    }, [favList, card])
    useEffect(() => {
        if (user && card) {
            const temp = user?.location?.coordinates
            const userloc = { longitude: (temp?.length > 0 ? temp[0] : 0), latitude: (temp?.length > 0 ? temp[1] : 0) }
            let dis = 0
            if ((userloc?.longitude == 0 && userloc?.latitude == 0) || (card?.location?.coordinates[0] == 0 && card?.location?.coordinates[1] == 0)) {
                return
            }
            dis = getDistance({ latitude: card?.location?.coordinates[1], longitude: card?.location?.coordinates[0] }, userloc)
            dis = Math.round(dis / 1000)
            // dis = (dis / 1000).toFixed(3)
            setDistance(dis)
        }
    }, [user, card])

    const onScroll = useCallback((event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex)
    }, []);

    return (
        <View style={{ height: cardHeight, borderRadius: 10, width: wp(92), alignSelf: "center", justifyContent: 'center', overflow: "hidden", backgroundColor: colors.background }}>
            <View style={[styles.row, { justifyContent: "space-between", padding: 10, position: "absolute", top: 0, zIndex: 1, width: "100%" }]}>
                <Pressable style={{ opacity: 0, backgroundColor: colors.blacktransparent, padding: 8, borderRadius: 4, }}>
                    <View style={styles.row}>
                        <Image source={images.locationpin} style={{ height: 22, width: 22, marginRight: 6 }} resizeMode="contain" />
                        <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Regular }}>{distance} km</Text>
                    </View>
                </Pressable>
                <Pressable style={{ backgroundColor: colors.blacktransparent, padding: 8, borderRadius: 4 }}
                    onPress={() => {
                        setIsFav(!isFav)
                        heartPressed(
                            isFav ?
                                ["remove", favList.filter(x => x?.item?._id == card?._id)[0]]
                                :
                                ["add"]
                        )
                    }}
                >
                    <Image source={images.whiteheart} style={{ height: 22, width: 22, resizeMode: "contain" }} tintColor={isFav ? colors.red : "#FFF"} />
                </Pressable>
            </View>
            <FlatList
                pagingEnabled={true}
                horizontal
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ref={scrollRef}
                bounces={false}
                data={displayImg}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity activeOpacity={1} style={{ height: cardHeight, width: wp(92), justifyContent: 'center', alignItems: "center" }}>
                            {<TouchableOpacity style={{ position: "absolute", height: "100%", width: wp(46), left: 0, zIndex: 10 }}
                                onPress={() => {
                                    if (index - 1 >= 0) {
                                        scrollRef?.current?.scrollToIndex({ index: index - 1 })
                                    }
                                }}
                            />}
                            {typeof item != "string" &&
                                <TouchableOpacity style={{ height: 60, width: 60, position: 'absolute', zIndex: 12, alignSelf: "center" }}
                                    onPress={() => { navigation.navigate(AppRoutes.VideoPlayer, { media: item?.link }) }}
                                >
                                    <FastImage source={images.play} style={{ height: "100%", width: "100%" }} />
                                </TouchableOpacity>
                            }
                            <FastImage source={typeof item == "string" ? { uri: mediaurl(item) } : { uri: mediaurl(item?.thumb) }} style={{ height: "100%", width: "100%" }} />
                            {<TouchableOpacity style={{ position: "absolute", height: "100%", width: wp(46), zIndex: 10, right: 0 }}
                                onPress={() => {
                                    if ((index + 1) < displayImg?.length) {
                                        scrollRef?.current?.scrollToIndex({ index: index + 1 })
                                    }
                                }}
                            />}
                        </TouchableOpacity>
                    )
                }}
                onScroll={(events) => {
                    onScroll(events)
                }}
            />
            <BottomCardView
                displayImg={displayImg}
                activeIndex={activeIndex}
                name={!isAthlete ? (card?.fname + " " + card?.lname) : card?.name}
                program={isAthlete ? card?.programBio : card?.sports ? card?.sports[0] : ""}
                onPressInfo={() => {
                    navigation.navigate(AppRoutes.OtherUserProfile, { user: card?._id })
                }}
                gradYear={card?.gradYear}
                coaches={card?.coaches}
            />
        </View>
    )
}

export default CardBlock;

const BottomCardView = ({ name, program, onPressInfo, displayImg, activeIndex, gradYear, coaches }) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors);
    return (
        <View style={[{ position: "absolute", bottom: 0, zIndex: 1, width: "100%" }]}>
            <View style={{ backgroundColor: colors.blacktransparent, height: 24, minWidth: 40, justifyContent: "center", alignItems: 'center', alignSelf: "center", paddingHorizontal: 6, borderTopLeftRadius: 6, borderTopRightRadius: 6, flexDirection: 'row' }}>
                {displayImg?.map((i, j) => {
                    return (
                        <View style={{ height: 8, width: 8, borderRadius: 8, backgroundColor: colors.white, marginHorizontal: 4, opacity: activeIndex == j ? 1 : 0.6 }} key={j.toString()} />
                    )
                })}
            </View>
            <Pressable style={[{ backgroundColor: colors.blacktransparent, padding: 8, borderRadius: 8 }]}
                onPress={onPressInfo}
            >
                <View style={[styles.row]}>
                    <Text style={{ color: colors.white, fontSize: 22, fontFamily: AppFonts.MediumIta, maxWidth: "94%" }}>{name}{gradYear ? ` '${gradYear?.substring(2)}` : ""}</Text>
                    <Image source={images.i} style={{ height: 20, width: 20, marginLeft: 8, tintColor: colors.white, }} />
                </View>
                {coaches?.length > 0 && <Text style={{ color: colors.white, fontSize: 14, fontFamily: AppFonts.Regular }}>{coaches[0]?.coachName}, {coaches[1]?.coachName}</Text>}
                <Text style={{ marginVertical: 6, color: colors.white, fontSize: 16, fontFamily: AppFonts.Regular }} numberOfLines={1}>{program}</Text>
            </Pressable>
        </View>
    )
}

const useStyles = (colors) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: "center",
    },
});