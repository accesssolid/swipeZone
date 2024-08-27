import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import { hp } from '../../utils/dimension';
import FastImage from 'react-native-fast-image';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';

const PasswordResetModal = (props) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);
    return (
        <Modal
            visible={props.vis}
            animationType="fade"
            transparent={true}
            {...props}>
            <Pressable onPress={props.onOutsidePress} style={styles.modalScreen}>
                <View style={styles.modalContanier}>
                    <FastImage source={images.resetdone} style={{ height: 140, width: 140, alignSelf: "center", marginVertical: 20 }} />
                    <Text style={[styles.tac, styles.boldTxt]}>{appkeys.ResetSuccessfully}</Text>
                    <Text style={[styles.tac, styles.medTxt, { width: "80%", alignSelf: "center", marginTop: 16 }]}>{appkeys.UseNewPass}</Text>
                    <CustomBtn
                        onPress={props.onDone}
                        titleTxt={appkeys.Login}
                        btnStyle={{ marginBottom: 16, marginTop: 36 }}
                    />
                </View>
            </Pressable>
        </Modal>
    )
}

export default PasswordResetModal

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
        padding: 10,
        borderRadius: 10
    },
    tac: {
        textAlign: "center"
    },
    medTxt: {
        color: colors.text,
        fontSize: 16,
        fontFamily: AppFonts.Medium,
    },
    boldTxt: {
        color: colors.text,
        fontSize: 20,
        fontFamily: AppFonts.Bold,
    },
})