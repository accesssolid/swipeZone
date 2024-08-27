import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import SolidView from '../components/SolidView';
import AppFonts from '../../constants/fonts';
import SettingSubview from '../components/SettingSubview';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useDispatch, useSelector } from 'react-redux';
import Logoutbtn from '../components/Logoutbtn';
import { logoutThunk } from '../../redux/Reducers/userData';
import { clearSignupdata } from '../../redux/Reducers/signup';
import checkIsSubScribedStill from '../../utils/checkIsSubScribedStill';
import { szsResources } from '../../utils/SubscriptionCheck';
import CustomBtn from '../components/CustomBtn';
import { setIsDisplayed } from '../../redux/Reducers/completeProfile';
import GetSwipe from '../components/GetSwipe';

const Settings = ({ navigation }) => {
  const dispatch = useDispatch()
  const isAthlete = useSelector(state => state?.userData?.isAthlete)
  const user = useSelector(state => state?.userData?.user)

  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);
  const [showGetMoreSwipes, setShowGetMoreSwipes] = useState(false)

  const Accountsetting = [
    {
      title: localization?.appkeys?.BlockedAccounts,
      navi: AppRoutes?.BlockedAccounts,
      img: images?.arrowforward
    },
    {
      title: localization?.appkeys?.Notifications,
      navi: AppRoutes?.Notifications,
      img: images?.arrowforward
    },
    {
      title: localization?.appkeys?.DeleteAccount,
      navi: AppRoutes?.DeleteAccount,
      img: images?.arrowforward
    },
    {
      title: localization?.appkeys?.DeactivateAccount,
      navi: AppRoutes?.DeactivateAccount,
      img: images?.arrowforward
    },
  ]
  const Appsetting = [
    {
      title: localization?.appkeys?.PrivacyPolicy,
      img: images?.arrowforward,
      onPress: () => {
        navigation.navigate(AppRoutes?.PrivacyPolicy, { from: "privacy" })
      },
    },
    {
      title: localization?.appkeys?.HelpSupport,
      navi: AppRoutes?.HelpSupport,
      img: images?.arrowforward
    },
    {
      title: localization?.appkeys?.faq,
      navi: AppRoutes?.Faq,
      img: images?.arrowforward
    },
    isAthlete ? {
      title: localization?.appkeys?.recuritingTips,
      onPress: () => {
        navigation.navigate(AppRoutes?.PrivacyPolicy, { from: "recuriting" })
      },
      img: images?.arrowforward,
      recruit: true
    } : null,
  ]
  const logout = () => {
    dispatch(setIsDisplayed(false))
    dispatch(logoutThunk())
    dispatch(clearSignupdata())
    setTimeout(() => {
      navigation.replace(AppRoutes.AuthStack, { screen: AppRoutes.Login })
    }, 0);
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => { navigation.goBack() }}
      title={localization.appkeys.Settings}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          {isAthlete && <SettingSubview logo={true}
            onPress={() => {
              navigation?.navigate(AppRoutes?.Subscription, { signup: "setting" })
            }}
            arrow={images?.arrowforward}
            logotitle={!checkIsSubScribedStill() ? "Monthly Passes & More" : "Purchase Bonus Swipes Here"}
          />}
          {/* {isAthlete && <SettingSubview logo={true}
            onPress={() => {
              setShowGetMoreSwipes(true)
              return
              navigation?.navigate(AppRoutes?.MoreSwipes)
            }}
            arrow={images?.arrowforward}
            logotitle={'10 More Swipes'}
          />} */}

          <GetSwipe
            isButton={true}
            closeModal={() => { setShowGetMoreSwipes(false) }}
            onClickNo={() => {
              // getAllData() 
            }}
          />
          {user?.currentStep != 2 &&
            <CustomBtn
              titleTxt={'Complete Profile'}
              onPress={() => {
                navigation.navigate(AppRoutes.AboutUser)
              }}
            />
          }
          <Text style={styles.TitleText}>{localization?.appkeys?.AccountSettings}</Text>
          <View style={{ marginTop: 6 }}>
            {Accountsetting.map((item, index) => {
              return (
                <SettingSubview
                  key={index.toString()}
                  title={item?.title}
                  arrow={item?.img}
                  onPress={() => {
                    navigation?.navigate(item?.navi)
                  }} />
              )
            })}
          </View>
          <Text style={styles.TitleText}>{localization?.appkeys?.AppSettings}</Text>
          <View style={{ marginTop: 6 }}>
            {Appsetting.map((item, index) => {
              if (item) {
                return (
                  <SettingSubview
                    key={index.toString()}
                    title={item?.title}
                    arrow={item?.img}
                    onPress={() => {
                      // if (item?.recruit && !szsResources()) {
                      //   navigation?.navigate(AppRoutes.Subscription)
                      //   return
                      // }
                      if (item?.navi) {
                        navigation?.navigate(item?.navi)
                      } else {
                        item?.onPress()
                      }
                    }} />
                )
              }
            })}
          </View>
          <Logoutbtn
            btnStyle={{
              alignSelf: "center",
              marginTop: 60,
              marginBottom: 80
            }}
            onPress={() => {
              Alert.alert("Logout", "Are you sure?", [{ text: "Yes", onPress: () => logout() }, { text: "No" }])
            }}
            titleTxt={localization?.appkeys?.Logout}
          />
        </ScrollView>
      }
    />
  )
}

export default Settings

const useStyles = (colors) => StyleSheet.create({
  TitleText: {
    fontFamily: AppFonts?.SemiBold,
    fontSize: 16,
    color: colors?.text,
    marginHorizontal: 18,
    marginTop: 12
  },
})