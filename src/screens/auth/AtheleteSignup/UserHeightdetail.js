import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../../localization/localization';
import AuthContainer from '../../components/AuthContainer';
import AppRoutes from '../../../routes/RouteKeys/appRoutes';
import CustomInput from '../../components/CustomInput';
import { hp, wp } from '../../../utils/dimension';
import AppFonts from '../../../constants/fonts';
import CustomDrop from '../../components/CustomDrop';
import { useDispatch, useSelector } from 'react-redux';
import { setSignupdata } from '../../../redux/Reducers/signup';
import AppUtils from '../../../utils/appUtils';
import { generateHeightsArray, generateWeightNumbers } from '../../../utils/heightunit';
import RequiredTxt from '../../components/RequiredTxt';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import HorizontalPicker from '@vseslav/react-native-horizontal-picker';
import { formatPhoneNumber, parsePhoneNumber } from '../../../utils/phonenumberformatter';

const UserHeightdetail = ({ navigation }) => {
    const dispatch = useDispatch()
    const alldata = useSelector(state => state?.signup?.signupdata)

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);
    const heightList = generateHeightsArray(5, 8)
    const weightList = generateWeightNumbers()
    const [weightIni, setWeightIni] = useState(0)
    const [heightIni, setHeightIni] = useState(0)
    const [currentWeight, setCurrentWeight] = useState(0)

    const writeSignupdata = useCallback((key, value) => {
        dispatch(setSignupdata({ ...alldata, [key]: value }))
    }, [alldata])
    const onPressNext = () => {
        if (!alldata?.heightString) {
            AppUtils.showToast("Height is required.")
            return
        }
        if (!alldata?.weight) {
            AppUtils.showToast("Weight is required.")
            return
        }
        if (!alldata?.gradYear) {
            AppUtils.showToast("Graduation year is required.")
            return
        }
        if (alldata?.weight > 999 || alldata?.weight < 100) {
            AppUtils.showToast("Correct weight required.")
            return
        }
        writeSignupdata("weightUnit", "pound")
        navigation.navigate(AppRoutes.AddMedia)
    }

    return (
        <AuthContainer
            signupfooter
            progress={"40%"}
            onPressBack={() => {
                navigation.goBack()
            }}
            onPressNext={() => {
                onPressNext()
            }}
            children={
                <View>
                    <Text style={[styles.semibTxt, { margin: 18, marginBottom: 8 }]}>{appkeys.YourHeight}</Text>
                    {/* <Text style={[styles.medTxt, { margin: 18, marginTop: 0 }]}>{appkeys.Canchangelater}</Text> */}
                    {/* <Text style={{ marginHorizontal: 18, marginBottom: 4, fontFamily: AppFonts.SemiBold, color: colors.text, fontSize: 12, marginLeft: 22 }}>{appkeys.Enteryourheight}</Text> */}
                    {/* <CustomDrop
                        list={heightList}
                        val={alldata?.height}
                        setVal={(v) => {
                            writeSignupdata("height", v)
                        }}
                    /> */}
                    <RequiredTxt txt={appkeys.height} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginHorizontal: 18, marginTop: 10 }} />
                    <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            activeItemTextStyle={{ fontFamily: AppFonts.Bold, color: colors.primary, fontSize: 18 }}
                            dataSource={heightList}
                            selectedIndex={heightIni}
                            onValueChange={(data) => {
                                writeSignupdata("heightString", data)
                            }}
                        />
                    </View>
                    {/* <CustomInput
                        place={appkeys.height}
                        textInputProps={{
                            keyboardType: "numeric",
                        }}
                        value={alldata?.height}
                        onChangeText={(v) => {
                            writeSignupdata("height", v)
                        }}
                    /> */}
                    {/* <Text style={{ marginHorizontal: 18, marginTop: 4, fontFamily: AppFonts.SemiBold, color: colors.text, fontSize: 10, marginLeft: 22 }}>(feet).</Text> */}
                    <CustomInput
                        place={appkeys.weight}
                        isRequiredTxt={true}
                        txt={"lbs"}
                        textInputProps={{
                            keyboardType: "number-pad",
                            maxLength: 3
                        }}
                        value={alldata?.weight?.toString()}
                        onChangeText={(v) => {
                            writeSignupdata("weight", parsePhoneNumber(v))
                        }}
                    />
                    {/* <RequiredTxt txt={appkeys.weight + " (lbs)"} txtStyle={[styles.placeTxt, { margin: 0 }]} styleMain={{ marginHorizontal: 18, marginTop: 16 }} /> */}
                    {/* <HorizontalPicker
                        data={weightList}
                        renderItem={(item) => {
                            return (
                                <View style={[{ width: wp(12), minHeight: 40, justifyContent: "center" }]}>
                                    <Text style={[styles.itemText, currentWeight == item && { fontFamily: AppFonts.Medium, color: colors.primary }]}>
                                        {item}
                                    </Text>
                                </View>
                            )
                        }}
                        onChange={(data) => {
                            writeSignupdata("weight", data)
                            setCurrentWeight(data)
                        }}
                        defaultIndex={weightIni}
                        animatedScrollToDefaultIndex={true}
                        itemWidth={wp(12)}
                        snapTimeout={1000}
                    /> */}
                    {/* <View style={{ width: '90%', alignSelf: "center", minHeight: hp(10) }}>
                        <ScrollPicker
                            dataSource={weightList}
                            selectedIndex={weightIni}
                            onValueChange={(data) => {
                                writeSignupdata("weight", data)
                            }}
                        />
                    </View> */}
                    <CustomInput
                        isRequiredTxt={true}
                        place={appkeys.GraduationYear}
                        value={alldata?.gradYear}
                        onChangeText={(v) => {
                            writeSignupdata("gradYear", parsePhoneNumber(v))
                        }}
                        textInputProps={{
                            keyboardType: "number-pad",
                            maxLength: 4
                        }}
                    />
                    <View style={{ height: hp(10) }} />
                </View>
            }
        />
    )
}

export default UserHeightdetail

const useStyles = (colors) => StyleSheet.create({
    medTxt: {
        color: colors.text,
        fontSize: 16,
        fontFamily: AppFonts.Medium,
    },
    semibTxt: {
        color: colors.text,
        fontSize: 20,
        fontFamily: AppFonts.SemiBold,
    },
    placeTxt: {
        color: colors.text,
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
    },
    itemText: {
        fontSize: 14, fontFamily: AppFonts.Regular, color: colors.text, textAlign: "right"
    }
})