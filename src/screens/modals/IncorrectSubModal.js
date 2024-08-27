import { Modal, Pressable, StyleSheet, Text } from 'react-native'
import React, { useContext } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import { hp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';

const IncorrectSubModal = (props) => {
    const { visible, onPressOk } = props;

    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys;
    const styles = useStyles(colors);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            {...props}>
            <Pressable style={styles.modalScreen} >
                <Pressable style={styles.modalContanier}>
                    <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: AppFonts.Bold, fontSize: 18, color: colors.text }}>The email is already linked with other user.</Text>
                    <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: AppFonts.Medium, fontSize: 14, color: colors.text }}>Change email to proceed further.</Text>
                    <CustomBtn
                        btnStyle={{ backgroundColor: colors.primary, width: "90%", marginBottom: 16 }}
                        titleTxt={appkeys.Ok}
                        onPress={onPressOk}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default IncorrectSubModal

const useStyles = (colors) => StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContanier: {
        backgroundColor: colors.background,
        minHeight: hp(20),
        width: '90%',
        alignSelf: 'center',
        padding: 18,
        borderRadius: 10
    },
})