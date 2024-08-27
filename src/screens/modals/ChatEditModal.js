import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import FastImage from 'react-native-fast-image';
import { hp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';

const ChatEditModal = (props) => {
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
                    <Pressable
                        style={styles.crossBtn}
                        onPress={props.onOutsidePress}
                    >
                        <FastImage resizeMode='contain' source={images.cancel} style={{ height: 26, width: 26, tintColor: colors.primary, }} />
                    </Pressable>
                    <Text style={{ fontSize: 18, textAlign: "center", color: colors.text, fontFamily: AppFonts.SemiBold }}>{"Action" + (props?.type == "text" ? "s" : "")}</Text>
                    <View style={{ flexDirection: "row", justifyContent: props?.type == "text" ? "space-between" : "center", width: "100%" }}>
                        {props?.type == "text" && <CustomBtn btnStyle={{ width: "45%", backgroundColor: 'rgba(254, 111, 39, 0.2)', borderWidth: 2, borderColor: colors.primary, padding: 14 }}
                            titleTxt={appkeys.Edit} txtStyle={{ color: colors.text }}
                            onPress={() => {
                                props.pressAction("edit")
                                props.onOutsidePress()
                            }}
                        />}
                        <CustomBtn btnStyle={{ backgroundColor: colors?.primary, width: props?.type != "text" ? "60%" : "45%", borderWidth: 2, borderColor: colors.primary, padding: 14 }}
                            titleTxt={appkeys.Delete}
                            onPress={() => {
                                props.pressAction("delete")
                                props.onOutsidePress()
                            }}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default ChatEditModal

const useStyles = (colors) => StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContanier: {
        backgroundColor: colors.background,
        minHeight: hp(8),
        width: '90%',
        alignSelf: 'center',
        padding: 26,
        paddingVertical: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    crossBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 10,
    },
})