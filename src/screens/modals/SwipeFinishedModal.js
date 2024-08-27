import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation, useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';

const SwipeFinishedModal = (props) => {
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
                    {/* <Pressable style={{ alignSelf: "flex-end" }}
                        onPress={() => {
                            props?.closeModal()
                        }}
                    >
                        <Image source={images.cancel} style={{ height: 26, width: 26 }} />
                    </Pressable> */}
                    <Image source={props?.showIAP ? images.iap : images.needSub} style={{ height: 120, width: 120 }} resizeMode='contain' />
                    <Text style={{ textAlign: "center", fontFamily: AppFonts.SemiBold, fontSize: 16, maxWidth: "90%", marginTop: 16 }}>{props?.showIAP ? `10 More Swipes $.99` : `No more swipes available.\nSUBSCRIBE & GET UNLIMITED SWIPES NOW.`}</Text>
                    {props?.showIAP ?
                        <>
                            <CustomBtn
                                titleTxt={"Buy Now"}
                                btnStyle={{ marginTop: 30 }}
                                onPress={() => {
                                    props?.closeModal()
                                    setTimeout(() => {
                                        navigation?.navigate(AppRoutes.MoreSwipes)
                                    }, 100);
                                }}
                            />
                            <Text style={{ fontFamily: AppFonts.Bold, color: colors.text, fontSize: 13, marginVertical: 16 }} onPress={() => { props?.onClickNo(); props?.closeModal() }}>No Thanks</Text>
                        </>
                        :
                        <>
                            <CustomBtn
                                titleTxt={"Subscribe"}
                                btnStyle={{ marginBottom: 10 }}
                                onPress={() => {
                                    props?.closeModal()
                                    setTimeout(() => {
                                        navigation?.navigate(AppRoutes.Subscription)
                                    }, 100);
                                }}
                            />
                            <Text style={{ fontFamily: AppFonts.Bold, color: colors.text, fontSize: 13, marginVertical: 16 }} onPress={() => { props?.onClickNo(); props?.closeModal() }}>No Thanks</Text>
                        </>
                    }
                </View>
            </View>
        </Modal>
    )
}

export default SwipeFinishedModal

const styles = StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})