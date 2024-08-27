import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import SolidView from '../components/SolidView'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import CustomInput from '../components/CustomInput';
import CustomBtn from '../components/CustomBtn';
import { hp } from '../../utils/dimension';
import ReportedModal from '../modals/ReportedModal';

const ReportUser = ({ navigation }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const [showReportModal, setShowReportModal] = useState(false)
    return (
        <SolidView
            back={true}
            onPressLeft={() => { navigation.goBack() }}
            title={appkeys.ReportUser}
            view={
                <View>
                    <ReportedModal vis={showReportModal}
                        onOutsidePress={() => {
                            setShowReportModal(false)
                        }}
                        onPressOk={() => {
                            setShowReportModal(false)
                        }}
                    />
                    <CustomInput
                        place={appkeys.Reason}
                    />
                    <CustomInput
                        place={appkeys.Description}
                        textInputProps={{
                            multiline: true,
                            textAlignVertical: "top",
                            style: { height: 100, padding: 10, width: "100%" }
                        }}
                    />
                    <CustomBtn
                        titleTxt={appkeys.Report}
                        btnStyle={{ marginTop: hp(10) }}
                        onPress={() => {
                            setShowReportModal(true)
                        }}
                    />
                </View>
            }
        />
    )
}

export default ReportUser

const styles = StyleSheet.create({})