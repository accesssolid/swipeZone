import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { hp, wp } from '../../utils/dimension';
import SolidView from '../components/SolidView';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import AppFonts from '../../constants/fonts';
import AppUtils from '../../utils/appUtils';
import hit from '../../api/Manager/manager';
import { setLoading } from '../../redux/Reducers/load';
import { endpoints } from '../../api/Services/endpoints';
import { setUser } from '../../redux/Reducers/userData';

const Notifications = ({ navigation }) => {
  const user = useSelector(state => state?.userData?.user)

  const dispatch = useDispatch()
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);

  const [Notisettings, setNotisettings] = useState([{ title: localization?.appkeys?.NewMatches, type: 1 }, { title: localization?.appkeys?.Newmessage, type: 3 }])
  const [userNotifications, setUserNotifications] = useState([])

  useEffect(() => {
    if (user?.noti) {
      setUserNotifications(user?.noti)
    }
  }, [user])

  const changeNotiStatus = async (arr) => {
    try {
      dispatch(setLoading(true))
      let res = await hit(endpoints?.updateself, "patch", { noti: arr })
      dispatch(setUser(res?.data))
    } catch (e) {
      AppUtils.showLog(e, "notifications setting")
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => { navigation.goBack() }}
      title={localization.appkeys.Notifications}
      backbtnstyle={{ width: 26, height: 20 }}
      view={
        <FlatList
          data={Notisettings}
          contentContainerStyle={{ marginVertical: 8 }}
          bounces={false}
          renderItem={({ item, index }) => {
            return (
              <NotiBlock
                item={item}
                index={index}
                arr={userNotifications}
                notiAction={() => {
                  let temp = [...userNotifications]
                  let ind = userNotifications?.indexOf(item?.type)
                  if (ind == -1) {
                    temp.push(item?.type)
                  } else {
                    temp.splice(ind, 1)
                  }
                  // setUserNotifications(temp)
                  changeNotiStatus(temp)
                }}
              />
            )
          }}
        />
      }
    />
  )
}

export default Notifications

const useStyles = (colors) => StyleSheet.create({
  main: {
    width: wp(92),
    minHeight: 48,
    backgroundColor: colors.white,
    marginVertical: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 9,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  title: {
    fontFamily: AppFonts.Medium,
    fontSize: 14,
    color: colors.text,
    textTransform: "capitalize"
  },
  backlcon: {
    width: 24,
    height: 18,
  },
})

const NotiBlock = ({ item, index, arr, notiAction }) => {
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    if (arr) {
      if (arr?.includes(item?.type)) {
        setIsEnabled(true)
      } else {
        setIsEnabled(false)
      }
    }
  }, [arr, item])

  return (
    <Pressable style={styles.main}
      onPress={() => {
        setIsEnabled(!isEnabled)
        notiAction()
      }}
    >
      <Text style={styles.title}>{item?.title}</Text>
      <FastImage source={isEnabled ? images.Onbtn : images.Offbtn} style={[styles.backlcon]} resizeMode='contain' />
    </Pressable>
  )
}