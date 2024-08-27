import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import AppFonts from '../../constants/fonts';
import FastImage from 'react-native-fast-image';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/Reducers/load';
import { wp } from '../../utils/dimension';

const Faq = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors, images } = useTheme();
    const styles = useStyles(colors);
    const { localization } = useContext(LocalizationContext);

    const [faqlist, setFaqlist] = useState([])

    useEffect(() => {
        setTimeout(() => {
            getAllFaqs()
        }, 200);
    }, [])

    const getAllFaqs = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints?.faqs, "get")
            if (!res?.err) {
                setFaqlist(res?.data)
            }
        } catch (e) {
            AppUtils.showLog("Faqs", e)
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SolidView
            back={true}
            onPressLeft={() => { navigation.goBack() }}
            title={localization.appkeys.faq}
            backbtnstyle={{ width: 26, height: 20 }}
            view={
                <FlatList
                    data={faqlist}
                    contentContainerStyle={{ flex: 1, paddingBottom: 10 }}
                    renderItem={({ item, index }) => {
                        return <RenderBlock index={index} item={item} />
                    }}
                />
            }
        />
    )
}

export default Faq

const useStyles = (colors) => StyleSheet.create({
    qn: {
        fontFamily: AppFonts.Medium, fontSize: 16, color: colors.text, maxWidth: wp(70)
    },
    ans: {
        fontFamily: AppFonts.Regular, fontSize: 14, color: colors.text
    }
})

const RenderBlock = ({ item, index }) => {
    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    const [vis, setVis] = useState(false)

    return (
        <>
            <Pressable
                style={{ backgroundColor: colors.white, paddingLeft: 16, padding: 2, flexDirection: "row", alignItems: 'center', marginHorizontal: 16, justifyContent: "space-between", borderRadius: 6, marginTop: 16 }}
                onPress={() => setVis(!vis)}
            >
                <Text style={styles.qn}>{item?.qn}</Text>
                <View style={{ height: 46, width: 46, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", borderRadius: 6 }}>
                    <Image source={images.down} style={{ transform: [{ rotate: vis ? "180deg" : "0deg", }], height: 24, width: 24, resizeMode: "contain", tintColor: colors.white }} />
                </View>
            </Pressable>
            {vis && <View style={{ backgroundColor: colors.white, marginHorizontal: 16, marginTop: 4, borderRadius: 4, padding: 16 }}>
                <Text style={styles.ans}>{item?.ans}</Text>
            </View>}
        </>
    )
}