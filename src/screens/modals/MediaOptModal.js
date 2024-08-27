import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import { wp } from '../../utils/dimension';
import FastImage from 'react-native-fast-image';

const MediaOptModal = (props) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors);
    return (
        <Modal
            visible={props.visible}
            animationType="fade"
            transparent={true}
            {...props}>
            <Pressable onPress={props.pressHandler} style={styles.modalScreen}>
                <Pressable style={styles.modalContanier}>
                    <Text style={styles.chooseMedia}>Select Media Type</Text>
                    <View style={styles.optionsContanier}>
                        <TouchableOpacity onPress={() => { props.mediaSelected("photo"); props.pressHandler() }} style={[{ alignItems: "center" }]}>
                            <View style={[styles.btn,]}>
                                <FastImage source={images.camera} style={styles.icons} resizeMode='contain' />
                            </View>
                            <Text style={styles.txt}>Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { props.mediaSelected("video"); props.pressHandler() }} style={[{ alignItems: "center" }]}>
                            <View style={[styles.btn,]}>
                                <FastImage source={images.videoon} style={styles.icons} tintColor={colors.primary} resizeMode='contain' />
                            </View>
                            <Text style={styles.txt}>Video</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default MediaOptModal

const useStyles = (colors) => StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContanier: {
        backgroundColor: colors.white,
        minHeight: 140,
        paddingVertical: 20,
        width: "86%",
        borderRadius: 10
    },
    chooseMedia: {
        fontSize: 18,
        textAlign: "center",
        color: colors.text,
        fontFamily: AppFonts.SemiBold
    },
    optionsContanier: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-evenly",
        marginTop: 24,
    },
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        height: wp(14), width: wp(14), borderRadius: wp(14)
    },
    icons: {
        height: "50%", width: "60%",
    },
    txt: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 12,
        color: colors.text,
        marginTop: 6,
        fontFamily: AppFonts.Medium
    }
})