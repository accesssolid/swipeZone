import React, { useContext, useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppRoutes from "../RouteKeys/appRoutes";
import AuthStack from "../auth/AuthStack";
import NonAuthStack from "../NoAuth/NonAuthStack";
import { LocalizationContext } from "../../localization/localization";
import { strings } from "../../constants/variables";
import Subscription from "../../screens/nonAuth/Subscription";
import * as RNIap from 'react-native-iap';
import { useDispatch } from "react-redux";
import { setSubPlans, updateFeatureList } from "../../redux/Reducers/subcriptions";
import { Platform } from "react-native";
import { endpoints } from "../../api/Services/endpoints";
import AppUtils from "../../utils/appUtils";
import hit from "../../api/Manager/manager";

export default function MainStack() {
  const dispatch = useDispatch();
  const Stack = createNativeStackNavigator();
  const { initializeAppLanguage, setAppLanguage } = useContext(LocalizationContext);
  const [paid, setPaid] = useState([])
  const [free, setFree] = useState([])

  useEffect(() => {
    setAppLanguage(strings.english);
    initializeAppLanguage();
    getAllSubPlans();
    getFeatures("0")
    getFeatures("1")
  }, []);
  useEffect(() => {
    if (free?.length > 0 && paid?.length > 0) {
      let temp = { free: [...free], paid: [...paid] }
      dispatch(updateFeatureList(temp))
    }
  }, [free, paid])

  const getAllSubPlans = async () => {
    try {
      let subPlans = await RNIap.getSubscriptions({ skus: ["monthly_trial", "monthly_plan", "yearly_plan"] });
      const sortedSubscriptionPlans =
        Platform.OS == "ios" ?
          subPlans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          :
          subPlans.sort((a, b) => parseFloat(a?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.priceAmountMicros ?? 0) - parseFloat(b?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.priceAmountMicros ?? 0));
      dispatch(setSubPlans(sortedSubscriptionPlans))
    } catch (err) {
      console.error(err)
    } finally {
    }
  }
  const getFeatures = async (t) => {
    try {
      let res = await hit(endpoints?.subFeatures, "post", { type: t?.toString() })
      if (!res?.err) {
        if (t == "0") {
          setFree(res?.data)
        } else {
          setPaid(res?.data)
        }
      }
    } catch (e) {
      AppUtils?.showLog(e, "subbbb")
    }
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name={AppRoutes.AuthStack} component={AuthStack} />
      <Stack.Screen name={AppRoutes.Subscription} component={Subscription} options={{ gestureEnabled: false }} />
      <Stack.Screen name={AppRoutes.NonAuthStack} component={NonAuthStack} />
    </Stack.Navigator>
  );
}
