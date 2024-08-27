import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';

const BlockUserModal = (props) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const appkeys = localization?.appkeys
    const styles = useStyles(colors);
    const isBlocked = props?.blocked == true ? true : false
    return (
        <Modal
            visible={props.vis}
            animationType="fade"
            transparent={true}
            {...props}>
            <Pressable onPress={props.onOutsidePress} style={styles.modalScreen}>
                <Pressable style={styles.modalContanier}>
                    {!isBlocked && <Pressable style={{ position: "absolute", right: 10, top: 10 }} onPress={props.onOutsidePress} >
                        <FastImage source={images.cancel} style={{ height: 26, width: 26 }} />
                    </Pressable>}
                    <FastImage source={images.stopsign} style={{ height: 120, width: 120, alignSelf: 'center' }} />
                    <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: AppFonts.Bold, fontSize: 20, color: colors.text }}>{isBlocked ? appkeys.UserBlocked : appkeys.BlockUser}</Text>
                    <Text style={{ textAlign: 'center', marginTop: 12, fontFamily: AppFonts.Regular, fontSize: 14, color: colors.text }}>{isBlocked ? appkeys.userblocked : appkeys.Youwanttoblockthisuser}</Text>
                    <CustomBtn btnStyle={{ backgroundColor: isBlocked ? colors.primary : colors.red, width: "90%", marginBottom: 16 }}
                        titleTxt={isBlocked ? appkeys.Continue : appkeys?.Ok}
                        onPress={props.onPressOk}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default BlockUserModal

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