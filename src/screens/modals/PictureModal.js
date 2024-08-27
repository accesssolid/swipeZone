import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { mediaurl } from '../../utils/mediarender'
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from '../../utils/dimension';
import { Image } from 'react-native';

const PictureModal = (props) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    return (
        <Modal
            visible={props.vis}
            animationType="fade"
            transparent={true}
            {...props}>
            <Pressable onPress={props.onOutsidePress} style={styles.modalScreen}>
                <Pressable onPress={props.onOutsidePress} style={{ alignSelf: "flex-end", backgroundColor: "black", padding: 8, borderRadius: 100, margin: 18, marginRight: 36 }}><Image source={images.close} style={{ tintColor: "white", height: 20, width: 20, resizeMode: "contain" }} /></Pressable>
                <Pressable
                // style={{ backgroundColor: "black" }}
                >
                    <FastImage source={{ uri: props?.fromchat ? props.img : mediaurl(props.img) }} style={{ height: hp(50), width: wp(80), alignSelf: "center" }} resizeMode='contain' />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default PictureModal

const useStyles = (colors) => StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})