import { View, Text, Modal, TouchableOpacity, Image, StyleSheet, Pressable, ImageBackground } from 'react-native'
import React, { useContext } from 'react'
import FastImage from 'react-native-fast-image'
import { LocalizationContext } from '../../localization/localization'
import { useTheme } from '@react-navigation/native'
import AppFonts from '../../constants/fonts'
import { wp } from '../../utils/dimension'


const CameraModal = ({ vis, onPress, onPressCamera, onPressGallery, title }) => {
    const { colors, images } = useTheme();
    const style = useStyles(colors);
    const { localization } = useContext(LocalizationContext);
    return (
        <Modal
            visible={vis}
            transparent={true}
        >
            <View style={{ backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <View style={{ backgroundColor: colors.white, minHeight: 140, paddingVertical: 20, width: "86%", borderRadius: 10 }}>
                    <Text style={[style.heading, { textAlign: "center" }]}>{!title ? localization?.appkeys?.UploadPicture : `Add ${title}`}</Text>
                    <Pressable
                        style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 16, top: 16, zIndex: 10 }}
                        onPress={onPress}
                    >
                        <FastImage resizeMode='contain' source={images.cancel} style={{ height: 26, width: 26, tintColor: colors.primary, }} />
                    </Pressable>
                    <View style={{ flexDirection: 'row', justifyContent: "center", marginTop: 24 }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', marginRight: wp(20) }}
                            onPress={onPressCamera}
                        >
                            <ImageBackground source={images?.backgroundcamera}
                                style={style.imgBg}>
                                <Image source={images.camera} style={style.icons} resizeMode='contain' />
                            </ImageBackground>
                            <Text style={style.txt}>{localization?.appkeys?.Camera}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={onPressGallery}
                        >
                            <ImageBackground source={images?.backgroundcamera}
                                style={style.imgBg}>
                                <Image source={images.gallery} style={style.icons} resizeMode='contain' />
                            </ImageBackground>
                            <Text style={style.txt}>{localization?.appkeys?.Gallery}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal >
    )
}
export default CameraModal
const useStyles = (colors) => StyleSheet.create({
    imgBg: {
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 22,
        color: colors.text,
    },
    icons: {
        height: "40%", width: "60%",
    },
    txt: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 12,
        color: colors.lightblack,
        marginTop: 6
    }
})