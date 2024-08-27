import { ScrollView, StyleSheet, Text } from 'react-native'
import React, { useContext, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import DeactivateaccountModal from '../modals/DeactivateaccountModal';
import Commonstyles from '../../utils/commonstyles';
import { useDispatch } from 'react-redux';
import hit from '../../api/Manager/manager';
import { setLoading } from '../../redux/Reducers/load';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import AppUtils from '../../utils/appUtils';
import { endpoints } from '../../api/Services/endpoints';
import { logoutThunk } from '../../redux/Reducers/userData';
import { clearSignupdata } from '../../redux/Reducers/signup';

const DeactivateAccount = ({ navigation }) => {
  const dispatch = useDispatch()

  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);
  const text = localization?.appkeys?.LeaveTxt

  const [Deactivateusermodal, setDeactivateusermodal] = useState(false)
  const [message, setMessage] = useState("")

  const submit = async () => {
    try {
      dispatch(clearSignupdata())
      dispatch(setLoading(true))
      let res = await hit(endpoints?.deactivateacc, "patch")
      setTimeout(() => {
        dispatch(setLoading(false))
        if (!res?.err) {
          dispatch(logoutThunk())
          AppUtils.showToast("Deactivated Sucessfully.")
          setTimeout(() => {
            navigation.replace(AppRoutes.AuthStack, { screen: AppRoutes.Login })
          }, 10);
        } else {
          AppUtils.showToast(res?.msg)
        }
      }, 1000);
    } catch (e) {
      AppUtils.showLog(e, "deleteAccount")
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => { navigation.goBack() }}
      title={localization.appkeys.DeactivateAccount}
      backbtnstyle={{ width: 26, height: 20 }}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.TitleText}>{text}</Text>
          <Text style={styles.TitleText}>Your account will be hidden until you reactivate.</Text>
          <CustomInput
            styleMain={{ marginTop: 0 }}
            placespecific={'I am deactivating this account because…'}
            textInputProps={{
              multiline: true,
              style: { ...Commonstyles.multipleinput, height: 140, marginTop: 10, colors: colors.text },
              textAlignVertical: "top"
            }}
            value={message}
            onChangeText={t => setMessage(t)}
          />
          <CustomBtn btnStyle={{ marginTop: hp(10) }}
            titleTxt={localization?.appkeys?.DeactivateAccount}
            onPress={() => {
              if (message?.trim() == "") {
                AppUtils?.showToast("Please enter the reason.")
                return
              }
              setTimeout(() => {
                setDeactivateusermodal(true)
              }, 200);
            }}
          />
          <DeactivateaccountModal vis={Deactivateusermodal}
            onOutsidePress={() => setDeactivateusermodal(false)}
            onPressOk={() => {
              setDeactivateusermodal(false)
              setTimeout(() => {
                submit()
              }, 1000);
            }}
          />
        </ScrollView>
      }
    >
    </SolidView>
  )
}

export default DeactivateAccount

const useStyles = (colors) => StyleSheet.create({
  TitleText: {
    fontFamily: AppFonts?.SemiBold,
    fontSize: 12,
    color: colors?.text,
    marginHorizontal: 22,
    marginTop: 24,
    lineHeight: 18
  },
})