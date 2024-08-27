import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import AppFonts from '../../constants/fonts';
import { useDispatch } from 'react-redux';
import hit from '../../api/Manager/manager';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import { endpoints } from '../../api/Services/endpoints';
import RenderHTML from 'react-native-render-html';
import { wp } from '../../utils/dimension';
import FastImage from 'react-native-fast-image';
import getEnvVars from '../../../env';
import AppRoutes from '../../routes/RouteKeys/appRoutes';

const PrivacyPolicy = ({ navigation, route }) => {
  const { from } = route?.params || "terms"
  const goTo = route?.params?.goTo ?? ""

  const dispatch = useDispatch()
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);

  const [content, setContent] = useState(null)
  const [recMedia, setRecMedia] = useState("")
  const { width } = useWindowDimensions();
  const source = {
    html: content
  };

  useEffect(() => {
    getAllData()
  }, [])

  const getAllData = async () => {
    try {
      dispatch(setLoading(true))
      let res = await hit(endpoints?.allTerms, "get")
      // console.log(res);
      if (!res?.err) {
        let data = res?.data
        if (from == "terms") {
          setContent(data?.terms)
        } else if (from == "recuriting") {
          setContent(data?.recruting_tips)
          setRecMedia(data?.recruting_media)
        } else {
          setContent(data?.policy)
        }
      }
    } catch (e) {
      AppUtils.showLog(e, "Privacy policy")
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => {
        if (goTo == "bottombar") {
          navigation.navigate(AppRoutes.Subscription)
          return
        }
        navigation.goBack()
      }}
      title={from == "terms" ? localization.appkeys.Termsofservice : from == "recuriting" ? localization.appkeys.recuritingTips : localization.appkeys.PrivacyPolicy}
      backbtnstyle={{ width: 26, height: 20 }}
      view={
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {(from == "recuriting" && recMedia) && <FastImage source={{ uri: getEnvVars().fileUrl + recMedia }} style={{ height: wp(20), width: wp(20), margin: 16, marginBottom: 0 }} />}
          <View style={{ width: wp(90), alignSelf: "center", marginTop: 20 }}>
            <RenderHTML
              contentWidth={wp(90)}
              source={source}
            />
          </View>
        </ScrollView>
      }
    >
    </SolidView>
  )
}

export default PrivacyPolicy

const useStyles = (colors) => StyleSheet.create({
  subText: {
    fontFamily: AppFonts?.Regular,
    fontSize: 12,
    color: colors?.text,
    marginHorizontal: 22,
    marginTop: 18
  }
})