import { Modal, Pressable, StyleSheet, Text } from 'react-native'
import React, { useContext } from 'react'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import CustomBtn from '../components/CustomBtn';
import { hp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import FastImage from 'react-native-fast-image';

const LocModal = (props) => {
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
                <Pressable style={styles.modalContanier}>
                    <FastImage source={images.map} style={{ height: 120, width: 120, alignSelf: 'center' }} />
                    <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: AppFonts.Bold, fontSize: 16, color: colors.text }}>{appkeys?.AllowLoc}</Text>
                    <CustomBtn btnStyle={{ backgroundColor: colors.primary, width: "90%" }}
                        titleTxt={appkeys?.Ok}
                        onPress={props.onPressOk}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default LocModal

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
        padding: 20,
        paddingVertical: hp(4),
        borderRadius: 10
    },
})