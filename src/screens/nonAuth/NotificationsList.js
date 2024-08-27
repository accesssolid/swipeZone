import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import SolidView from '../components/SolidView';
import AppFonts from '../../constants/fonts';
import FastImage from 'react-native-fast-image';
import { LocalizationContext } from '../../localization/localization';
import { useDispatch, useSelector } from 'react-redux';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { getAllNotifications } from '../../redux/Reducers/notification';
import moment from 'moment';
import { mediaurl } from '../../utils/mediarender';
import AppUtils from '../../utils/appUtils';
import CustomBtn from '../components/CustomBtn';
import { setLoading } from '../../redux/Reducers/load';

const NotificationsList = ({ navigation }) => {
    const allNotifications = useSelector(state => state?.notification?.list)

    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const styles = useStyles(colors)
    const { localization } = useContext(LocalizationContext);

    const [notiList, setNotiList] = useState([]);
    const [dltArr, setDltArr] = useState([])
    const [selectionMode, setSelectionMode] = useState(false)

    useEffect(() => {
        markAsRead()
    }, [])
    useEffect(() => {
        if (allNotifications) {
            const currentWeekStart = moment().startOf('week')
            const currentWeekEnd = moment().endOf('week')

            const finalArr = allNotifications.reduce((result, item) => {
                const createdAt = moment(item?.createdAt).toDate();
                // const diff = moment().diff(createdAt, 'days');

                let dateGroup;
                if (moment(item?.createdAt).format("YYYYMMDD") == moment().format("YYYYMMDD")) {
                    dateGroup = "Today";
                } else if (createdAt >= currentWeekStart && createdAt <= currentWeekEnd) {
                    dateGroup = "This Week";
                } else {
                    dateGroup = "Others";
                }

                if (!result[dateGroup]) {
                    result[dateGroup] = [];
                }
                result[dateGroup].push(item);

                return result;
            }, {})
            const sections = Object.keys(finalArr).map((dateGroup) => ({
                title: dateGroup,
                data: finalArr[dateGroup],
            }));
            setNotiList(sections)
        }
    }, [allNotifications])
    useEffect(() => {
        if (dltArr?.length === 0) {
            setSelectionMode(false)
        }
    }, [dltArr])

    const markAsRead = async () => {
        try {
            let res = await hit(endpoints?.notifications?.noti, "patch")
            if (!res?.err) {
                dispatch(getAllNotifications())
            }
        } catch (e) {
        } finally {
        }
    }
    const pressAction = (item) => {
        let temp = [...dltArr]
        let ind = temp.indexOf(item?._id)
        if (ind == -1) {
            temp.push(item?._id)
        } else {
            temp.splice(ind, 1)
        }
        setDltArr(temp)
    }
    const deleteNotifications = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints?.notifications?.delete, "post", { list: dltArr })
            if (!res?.err) {
                setDltArr([])
                dispatch(getAllNotifications())
            } else {
                AppUtils.showToast(res?.msg || localization?.appkeys?.Sthw)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SolidView
            back={true}
            onPressLeft={() => navigation.goBack()}
            title={localization?.appkeys?.Notifications}
            view={
                <>
                    <SectionList
                        sections={notiList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
                        keyExtractor={(item, index) => item + index}
                        renderSectionHeader={({ section: { title } }) => (<Text style={styles.tittle}>{title}</Text>)}
                        renderItem={({ item, index }) => {
                            return (
                                <NotificationBlock
                                    item={item} index={index}
                                    arr={dltArr}
                                    onLongPress={() => {
                                        setSelectionMode(true)
                                        pressAction(item)
                                    }}
                                    onPress={() => {
                                        if (selectionMode) {
                                            pressAction(item)
                                        }
                                    }}
                                />
                            )
                        }}
                    />
                    {selectionMode && <CustomBtn
                        btnStyle={{ position: "absolute", bottom: 50 }}
                        titleTxt={localization?.appkeys?.Delete}
                        onPress={() => {
                            deleteNotifications(dltArr)
                        }}
                    />}
                </>
            }
        />
    )
}

export default NotificationsList

const useStyles = (colors) => StyleSheet.create({
    mainView: {
        paddingVertical: 8,
        backgroundColor: colors.background,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,

        elevation: 4,
    },
    time: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 10,
        color: colors.text,
        marginTop: 4
    },
    icon: {
        height: 60,
        width: 60,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: colors.primary
    },
    tittle: {
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        fontSize: 18,
    },
    text: {
        fontFamily: AppFonts.Regular,
        color: colors.text,
        fontSize: 12,
    },
})

const NotificationBlock = ({ item, index, onPress, onLongPress, arr = [] }) => {
    const user = useSelector(state => state?.userData)?.user

    const { colors, images } = useTheme();
    const styles = useStyles(colors);
    const otherUserData = user?._id == item?.user?._id ? item?.refUsers[0] : item?.user;
    const [inDltArr, setInDltArr] = useState(false)

    useEffect(() => {
        if (arr.includes(item?._id)) {
            setInDltArr(true)
        } else {
            setInDltArr(false)
        }
    }, [arr, item])

    return (
        <Pressable style={[styles.mainView, inDltArr == true && { opacity: 0.4 }]} onPress={onPress} onLongPress={onLongPress}>
            <FastImage source={{ uri: mediaurl(otherUserData?.profilePic) }} style={styles.icon} />
            <View style={{ width: "80%", marginLeft: 10 }}>
                {item?.notiType == 3 && <Text style={[styles.text, { fontFamily: AppFonts.Bold, fontSize: 14 }]} >{item?.title}</Text>}
                <Text maxFontSizeMultiplier={1} style={styles.text}>
                    {item?.body}
                </Text>
                <Text style={styles.time}>{moment(item?.createdAt).format("hh:mm a")}</Text>
            </View>
        </Pressable>
    )
}