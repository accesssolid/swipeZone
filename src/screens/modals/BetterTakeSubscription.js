import { Image, Modal, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation, useTheme } from '@react-navigation/native';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import CustomBtn from '../components/CustomBtn';
import AppFonts from '../../constants/fonts';

const BetterTakeSubscription = (props) => {
    const { colors, images } = useTheme();
    const navigation = useNavigation();
    return (
        <Modal
            visible={props?.visible}
            animationType="fade"
            transparent={true}
            {...props}
        >
            <View style={styles.modalScreen}>
                <View style={{ backgroundColor: colors?.background, minHeight: 200, padding: 20, width: "90%", borderRadius: 6, justifyContent: "center", alignItems: "center" }}>
                    {/* <Image source={images.stopsign} style={{ height: 100, width: 100 }} /> */}
                    <Image source={images.needSub} style={{ height: 100, width: 100, resizeMode: "contain" }} />
                    <Text style={{ textAlign: "center", fontFamily: AppFonts.SemiBold, fontSize: 14, maxWidth: "80%", marginTop: 10 }}>{`YOU COULD BE SAVING MONEY!  GET UNLIMITED SWIPES NOW!`}</Text>
                    <CustomBtn
                        titleTxt={"Subscribe"}
                        btnStyle={{ marginBottom: 10 }}
                        onPress={() => {
                            props?.closeModal()
                            props?.goToSub()
                        }}
                    />
                    <Text style={{ fontFamily: AppFonts.Bold, color: colors.text, fontSize: 13, marginVertical: 16 }} onPress={() => { props?.closeModal() }}>No Thanks</Text>
                </View>
            </View>
        </Modal>
    )
}

export default BetterTakeSubscription

const styles = StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})