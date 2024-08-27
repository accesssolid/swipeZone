import { Image, Modal, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native';
import CustomBtn from '../components/CustomBtn';
import AppFonts from '../../constants/fonts';

const CompleteProfileModal = ({ vis, onSkip, onPress, onPressCamera, onPressGallery, title }) => {
    const { colors, images } = useTheme();
    const style = useStyles(colors);

    return (
        <Modal
            visible={vis}
            transparent={true}
        >
            <View style={{ backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <View style={{ backgroundColor: colors.white, minHeight: 140, paddingVertical: 20, width: "86%", borderRadius: 10 }}>
                    <Image source={images.sademoji} style={{ height: 120, width: 120, alignSelf: "center", marginBottom: 16, resizeMode: "contain" }} />
                    <Text style={[style.heading,]}>{`Complete Your Profile`}</Text>
                    <Text style={[style.txt]}>{`Coaches cannot view your profile until these fields are complete`}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20 }}>
                        <CustomBtn
                            titleTxt={'Skip'}
                            btnStyle={{ width: "46%", minHeight: 46, padding: 6, borderRadius: 6 }}
                            txtStyle={{ fontSize: 14 }}
                            onPress={onSkip}
                        />
                        <CustomBtn
                            titleTxt={'Complete Now'}
                            btnStyle={{ width: "46%", minHeight: 46, padding: 6, borderRadius: 6 }}
                            txtStyle={{ fontSize: 14, textAlign: "center" }}
                            onPress={onPress}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CompleteProfileModal

const useStyles = (colors) => StyleSheet.create({
    heading: {
        fontFamily: AppFonts.Bold,
        fontSize: 22,
        color: colors.text,
        textAlign: "center",
        maxWidth: "90%",
        alignSelf: "center",
    },
    txt: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors.lightblack,
        marginTop: 6,
        textAlign: "center",
        maxWidth: "90%",
        alignSelf: "center"
    }
})