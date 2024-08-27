import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import SolidView from '../components/SolidView'
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import { useTheme } from '@react-navigation/native';
import CustomBtn from '../components/CustomBtn';
import BlockUserModal from '../modals/BlockUserModal';
import AppRoutes from '../../routes/RouteKeys/appRoutes';

const UniversityProfile = ({ navigation }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [userBlockedModal, setUserBlockedModal] = useState(false)
    return (
        <SolidView
            back={true}
            title={appkeys.UniversityProfile}
            onPressLeft={() => {
                navigation.goBack()
            }}
            view={
                <ScrollView showsVerticalScrollIndicator={false}>
                    <BlockUserModal vis={showBlockModal}
                        onOutsidePress={() => setShowBlockModal(false)}
                        onPressOk={() => {
                            setShowBlockModal(false)
                            setTimeout(() => {
                                setUserBlockedModal(true)
                            }, 200);
                        }}
                    />
                    <BlockUserModal
                        blocked={true}
                        vis={userBlockedModal}
                        onOutsidePress={() => setUserBlockedModal(false)}
                        onPressOk={() => {
                            setUserBlockedModal(false)
                            setTimeout(() => {
                                navigation.navigate(AppRoutes.BlockedAccounts)
                            }, 200);
                        }}
                    />
                    <FastImage source={require("../../assets/m.png")} style={{ height: hp(30), width: "92%", alignSelf: "center", borderRadius: 8, marginVertical: 16 }} />
                    <Text style={[styles.semibTxt, { margin: 18, marginVertical: 8 }]}>University name here</Text>
                    <Text style={[{ margin: 18, marginVertical: 0 }, styles.regTxt]}>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
                    <Text style={[styles.medTxt, { margin: 18 }]}>{appkeys.Website}: <Text style={{ color: colors.primary }}>www.swiperightsports.com</Text></Text>
                    <Text style={[styles.medTxt, { fontSize: 18, marginHorizontal: 18 }]}>Chicago, IL United States</Text>
                    <View style={[{ backgroundColor: colors.white, margin: 18, padding: 12, borderRadius: 6 }, styles.shadow]}>
                        <Text style={[styles.medTxt, { marginBottom: 10 }]}>Baseball</Text>
                        <Text style={[styles.regTxt]}>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
                    </View>
                    <CustomBtn btnStyle={{ backgroundColor: colors.red }}
                        titleTxt={appkeys.BlockUser}
                        onPress={() => {
                            setShowBlockModal(true)
                        }}
                    />
                    <CustomBtn
                        titleTxt={appkeys.ReportUser}
                        onPress={() => {
                            navigation?.navigate(AppRoutes.ReportUser)
                        }}
                    />
                    <View style={{ height: hp(4) }} />
                </ScrollView>
            }
        />
    )
}

export default UniversityProfile

const useStyles = (colors) => StyleSheet.create({
    medTxt: {
        color: colors.text,
        fontSize: 14,
        fontFamily: AppFonts.Medium,
    },
    regTxt: {
        fontSize: 12,
        fontFamily: AppFonts.Regular,
        color: colors.text,
    },
    semibTxt: {
        color: colors.text,
        fontFamily: AppFonts.SemiBold,
        fontSize: 24,
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
})