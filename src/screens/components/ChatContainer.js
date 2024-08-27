import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { wp } from '../../utils/dimension';
import { useNavigation, useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import { useSelector } from 'react-redux';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import PictureModal from '../modals/PictureModal';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import Video from 'react-native-video';
import ChatEditModal from '../modals/ChatEditModal';

const ChatContainer = ({ item, index, pressAction }) => {
    const user = useSelector(state => state?.userData?.user)

    const { colors, images } = useTheme();
    const styles = UseStyles(colors);
    const navigation = useNavigation()

    const [showPic, setShowPic] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)

    const isMine = item?.user?._id == user?._id
    const alignSelf = isMine ? "flex-end" : "flex-start"
    const createdAt = moment.unix(item?.createdAt?.seconds);

    if (item?.status == 0) {//item is deleted
        return null
    }
    return (
        <View style={{ marginBottom: 16 }}>
            <PictureModal vis={showPic} onOutsidePress={() => setShowPic(false)} fromchat={true} img={item?.media} />
            <ChatEditModal vis={deleteModal} onOutsidePress={() => setDeleteModal(false)}
                pressAction={(type) => {
                    pressAction(type)
                }}
                type={item?.type}
            />
            <Pressable style={[{ alignSelf }]}
                onPress={() => {
                    if (item?.type == "image") {
                        setShowPic(true)
                    } else if (item?.type == "video") {
                        navigation.navigate(AppRoutes.VideoPlayer, { media: item?.media })
                    }
                }}
                onLongPress={() => {
                    isMine && setDeleteModal(true)
                }}
            >
                {
                    item?.type == "image" ?
                        <ImageComponent item={item} />
                        :
                        item?.type == "video" ?
                            <VideoComponent item={item} />
                            :
                            <TextComponent item={item} isMine={isMine} />

                }
            </Pressable>
            <View style={[{ flexDirection: "row", alignItems: "center", marginTop: 8 }, isMine && { alignSelf }]}>
                <Text style={[styles.timeFont]}>{moment(createdAt).format("hh:mm a")}</Text>
                {isMine && <Image source={images.check2} style={{ height: 10, width: 16, marginRight: 8 }} resizeMode='contain' tintColor={item?.read == 0 ? colors.grey : colors.primary} />}
            </View>
        </View>
    );
}

export default ChatContainer

const UseStyles = (colors) => StyleSheet.create({
    chatfont: {
        fontFamily: AppFonts.Regular,
        fontSize: 12,
        color: colors.black,
    },
    chatItem: {
        padding: 14,
        borderRadius: 10,
        maxWidth: "90%",
        minWidth: 60,
        backgroundColor: "#FE6F270D",
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center"
    },
    timeFont: {
        fontFamily: AppFonts.MediumIta,
        fontSize: 10,
        color: colors.black,
        marginHorizontal: 4,
        marginLeft: 8
    },
})

const TextComponent = ({ item, isMine }) => {
    const { colors, images } = useTheme();
    const styles = UseStyles(colors, images);
    const borderStyle = isMine ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
    const alignSelf = isMine ? "flex-end" : "flex-start"
    return (
        <View style={[styles.chatItem, isMine && { backgroundColor: "rgba(254,111,39,0.2)", alignSelf }, borderStyle]}>
            <Text style={styles.chatfont}>{item?.text}</Text>
        </View>
    )
}

const ImageComponent = ({ item }) => {
    return (
        <View style={[{ marginHorizontal: 4 }]}>
            <FastImage source={{ uri: item?.media }} style={{ height: wp(46), width: wp(50), borderRadius: 10 }} />
        </View>
    )
}

const VideoComponent = ({ item }) => {
    const videoRef = useRef(null)
    const { colors, images } = useTheme();

    useEffect(() => {
        if (videoRef?.current) {
            videoRef?.current?.seek(2)
        }
    }, [])

    return (
        <View style={[{ marginHorizontal: 4, backgroundColor: colors.text, height: wp(46), width: wp(50), justifyContent: "center", alignItems: "center", borderRadius: 10 }]}>
            <FastImage source={images.play} style={{ height: 60, width: 60, borderRadius: 10, position: "absolute", zIndex: 10 }} />
            <Video
                ref={videoRef}
                paused={true}
                muted={true}
                resizeMode={"cover"}
                source={{ uri: item?.media }}
                style={{ width: '100%', height: '100%', borderRadius: 10 }}
            />
        </View>
    )
}