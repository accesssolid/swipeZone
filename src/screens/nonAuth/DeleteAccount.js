import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import { hp, wp } from '../../utils/dimension';
import SettingSubview from '../components/SettingSubview';
import AppFonts from '../../constants/fonts';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import BlockUserModal from '../modals/BlockUserModal';
import UnblockUserModal from '../modals/UnblockUserModal';
import DeleteaccountModal from '../modals/DeleteaccountModal';
import Commonstyles from '../../utils/commonstyles';
import AppUtils from '../../utils/appUtils';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/Reducers/load';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { logoutThunk } from '../../redux/Reducers/userData';
import { clearSignupdata } from '../../redux/Reducers/signup';

const DeleteAccount = ({ navigation }) => {
  const dispatch = useDispatch()

  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);
  const text = localization?.appkeys?.LeaveTxt

  const [Deleteusermodal, setDeleteusermodal] = useState(false)
  const [message, setMessage] = useState("")

  const submit = async () => {
    try {
      dispatch(clearSignupdata())
      dispatch(setLoading(true))
      let res = await hit(endpoints?.deleteSelf, "post", { reason: message })
      setTimeout(() => {
        dispatch(setLoading(false))
        if (!res?.err) {
          dispatch(logoutThunk())
          AppUtils.showToast("Deleted Sucessfully.")
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
      title={localization.appkeys.Deleteaccount}
      backbtnstyle={{ width: 26, height: 20 }}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.TitleText}>{text}</Text>
          <Text style={styles.TitleText}>This action is irreversible and cannot be undone. Any associated data will be lost.</Text>
          <CustomInput
            styleMain={{ marginTop: 0 }}
            placespecific={'I am deleting this account because…'}
            textInputProps={{
              multiline: true,
              style: { ...Commonstyles.multipleinput, height: 140, marginTop: 10 },
              textAlignVertical: "top"
            }}
            value={message}
            onChangeText={t => setMessage(t)}
          />
          <CustomBtn
            btnStyle={{ marginTop: hp(10) }}
            titleTxt={localization?.appkeys?.DeleteAccount}
            onPress={() => {
              if (message?.trim() == "") {
                AppUtils?.showToast("Please enter the delete reason.")
                return
              }
              setTimeout(() => {
                setDeleteusermodal(true)
              }, 200);
            }}
          />
          <DeleteaccountModal vis={Deleteusermodal}
            onOutsidePress={() => setDeleteusermodal(false)}
            onPressOk={() => {
              setDeleteusermodal(false)
              setTimeout(() => {
                submit()
              }, 1000);
            }}
          />
        </ScrollView>
      }
    />
  )
}

export default DeleteAccount;

const useStyles = (colors) => StyleSheet.create({
  TitleText: {
    fontFamily: AppFonts?.SemiBold,
    fontSize: 12,
    color: colors?.text,
    marginHorizontal: 22,
    marginTop: 24,
    lineHeight: 18,
  },
})