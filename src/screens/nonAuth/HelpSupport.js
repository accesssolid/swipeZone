import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import Commonstyles from '../../utils/commonstyles';
import { useDispatch, useSelector } from 'react-redux';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';

const HelpSupport = ({ navigation }) => {
  const user = useSelector(state => state?.userData?.user)
  const isAthlete = useSelector(state => state?.userData?.isAthlete)

  const dispatch = useDispatch()
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);

  const [message, setMessage] = useState("")

  const submit = async () => {
    if (message?.trim() == "") {
      AppUtils?.showToast("Type a message.")
      return
    }
    let body = { message, name: isAthlete ? `${user?.fname} ${user?.lname}` : user?.name, email: user?.email }
    try {
      dispatch(setLoading(true))
      let res = await hit(endpoints?.contactus, "post", body)
      if (!res?.err) {
        AppUtils.showToast("A SZS representative will respond within 24-48 hours.")
        navigation.goBack()
      } else {
        AppUtils.showToast(res?.msg || localization?.appkeys?.Sthw)
      }
    } catch (e) {
      AppUtils.showLog(e, "help and support")
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => { navigation.goBack() }}
      title={localization.appkeys.HelpSupport}
      backbtnstyle={{ width: 26, height: 20 }}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.TitleText}>{localization?.appkeys?.NeedHelp}</Text>
            <CustomInput
              img={images?.avatar} styleMain={{ marginTop: wp(6) }} place={localization?.appkeys?.Name}
              value={isAthlete ? `${user?.fname} ${user?.lname}` : user?.name}
              textInputProps={{
                editable: false
              }}
            />
            <CustomInput img={images?.mail} styleMain={{ marginTop: wp(6) }} place={localization?.appkeys?.Email}
              value={user?.email}
              textInputProps={{
                editable: false
              }}
            />
            <CustomInput styleMain={{ marginTop: wp(6) }}
              place={localization?.appkeys?.Message}
              textInputProps={{
                multiline: true,
                style: { height: 120, ...Commonstyles.multipleinput },
                textAlignVertical: "top"
              }}
              value={message}
              onChangeText={t => setMessage(t)}
            />
          </View>
          <CustomBtn
            btnStyle={{ marginTop: hp(10) }}
            titleTxt={localization?.appkeys?.SendMessage}
            onPress={() => { submit() }}
          />
        </ScrollView>
      }
    />
  )
}

export default HelpSupport

const useStyles = (colors) => StyleSheet.create({
  TitleText: {
    fontFamily: AppFonts.Medium,
    fontSize: 14,
    color: colors.text,
    marginHorizontal: 22,
    marginTop: 20
  },
})