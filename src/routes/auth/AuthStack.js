import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../../screens/auth/Splash";
import Welcome from "../../screens/auth/Welcome";
import Interest from "../../screens/auth/AtheleteSignup/Interest";
import AppRoutes from "../RouteKeys/appRoutes";
import Login from "../../screens/auth/Login";
import Intro from "../../screens/auth/Intro";
import SignUpOpt from "../../screens/auth/SignUpOpt";
import SignUp from "../../screens/auth/SignUp";
import ForgotPassword from "../../screens/auth/ForgotPassword";
import Verification from "../../screens/auth/Verification";
import NewPassword from "../../screens/auth/NewPassword";
import AboutUser from "../../screens/auth/AtheleteSignup/AboutUser";
import UserHeightdetail from "../../screens/auth/AtheleteSignup/UserHeightdetail";
import AboutUniversity from "../../screens/auth/AboutUniversity";
import AddMedia from "../../screens/auth/AtheleteSignup/AddMedia";
import PrivacyPolicy from "../../screens/nonAuth/PrivacyPolicy";
import VideoPlayer from "../../screens/nonAuth/VideoPlayer";

export default function AuthStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }} >
      <Stack.Screen name={AppRoutes.Splash} component={Splash} />
      <Stack.Screen name={AppRoutes.Intro} component={Intro} />
      <Stack.Screen name={AppRoutes.Welcome} component={Welcome} />
      <Stack.Screen name={AppRoutes.Login} component={Login} />
      <Stack.Screen name={AppRoutes.SignUp} component={SignUp} />
      <Stack.Screen name={AppRoutes.SignUpOpt} component={SignUpOpt} />
      <Stack.Screen name={AppRoutes.ForgotPassword} component={ForgotPassword} />
      <Stack.Screen name={AppRoutes.Verification} component={Verification} />
      <Stack.Screen name={AppRoutes.NewPassword} component={NewPassword} />
      <Stack.Screen name={AppRoutes.Interest} component={Interest} />
      <Stack.Screen name={AppRoutes.AboutUser} component={AboutUser} />
      <Stack.Screen name={AppRoutes.UserHeightdetail} component={UserHeightdetail} />
      <Stack.Screen name={AppRoutes.AboutUniversity} component={AboutUniversity} />
      <Stack.Screen name={AppRoutes.AddMedia} component={AddMedia} />
      <Stack.Screen name={AppRoutes.PrivacyPolicy} component={PrivacyPolicy} />
      <Stack.Screen name={AppRoutes.VideoPlayer} component={VideoPlayer} />
    </Stack.Navigator>
  );
}
