import { useTheme } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, ImageBackground, SafeAreaView, Pressable } from "react-native";
import { LocalizationContext } from "../../localization/localization";
import AppRoutes from "../../routes/RouteKeys/appRoutes";
import { hp, wp } from "../../utils/dimension";
import Carousel from 'react-native-snap-carousel';
import FastImage from "react-native-fast-image";
import AppFonts from "../../constants/fonts";

function Intro({ navigation }) {
    const crouselRef = useRef()
    const { colors, images } = useTheme();
    const style = useStyles(colors);

    const [slides, setSlides] = useState([
        { img: images.intro1, title: "Get Connected!\nSign Up Now!", desc: "SZS is the FIRST AND ONLY collegiate sports recruiting app that MATCHES players and coaches… with just a SWIPE!" },
        { img: images.intro2, title: "Get Matched!", desc: "Set Your Criteria…\nEnter Your Details…\nThen, GET MATCHED with schools/athletes, with the same goals!" }
    ])
    const [activeIndex, setActiveIndex] = useState(0)

    const renderPagination = useCallback(() => {
        return (
            <View style={{ flexDirection: 'row' }}>
                {slides.map((i, j) => {
                    return (
                        <View style={{ height: 10, width: activeIndex == j ? 26 : 10, opacity: activeIndex == j ? 1 : 0.6, borderRadius: 10, backgroundColor: colors.primary, marginRight: 4 }} key={j.toString()} />
                    )
                })}
            </View>
        )
    }, [slides, activeIndex])

    return (
        <SafeAreaView style={style.parent}>
            <ImageBackground style={style.parent} source={images.orangegrad}>
                <View style={{ marginTop: hp(2) }}>
                    <Carousel
                        data={slides}
                        sliderWidth={wp(100)}
                        itemWidth={wp(92)}
                        renderItem={_renderItem}
                        ref={crouselRef}
                        onBeforeSnapToItem={(slideIndex) => {
                            setActiveIndex(slideIndex)
                        }}
                    />
                </View>
                <View style={{ marginHorizontal: 18, marginVertical: hp(1), marginTop: hp(3) }}>
                    <Text style={style.title} maxFontSizeMultiplier={1.3}>{slides[activeIndex]?.title}</Text>
                    <Text style={style.desc} maxFontSizeMultiplier={1.3}>{slides[activeIndex]?.desc}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18 }}>
                    {renderPagination()}
                    <NextBtn
                        onPress={() => {
                            if (activeIndex != 1) {
                                crouselRef?.current?.snapToNext()
                                return
                            }
                            navigation?.navigate(AppRoutes.Welcome)
                        }}
                    />
                </View>
                {/* <Text style={[style.desc, { color: colors.primary, textAlign: "right", marginHorizontal: 26, marginTop: hp(4) }]} maxFontSizeMultiplier={1.3}
                    onPress={() => { navigation?.navigate(AppRoutes.Login) }}
                >
                    Skip
                </Text> */}
            </ImageBackground>
        </SafeAreaView>
    );
}

const useStyles = (colors) => StyleSheet.create({
    parent: {
        flex: 1,
    },
    title: {
        fontFamily: AppFonts.SemiBold,
        fontSize: 22,
        color: colors.text,
        textAlign: "center"
    },
    desc: {
        fontFamily: AppFonts.Medium,
        fontSize: 14,
        color: colors.text,
        marginTop: 8
    }
});

const _renderItem = ({ item, index }) => {
    return (
        <View>
            <FastImage source={item?.img} style={{ height: hp(54), width: wp(92), borderRadius: 10 }} />
        </View>
    );
}

export const NextBtn = ({ onPress, styleNextBtn }) => {
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    return (
        <Pressable
            style={[{ backgroundColor: colors.primary, minHeight: 52, width: wp(30), justifyContent: "center", alignItems: "center", flexDirection: "row", alignItems: "center", borderRadius: 40 }, styleNextBtn]}
            onPress={onPress}
        >
            <Text style={{ fontFamily: AppFonts.Medium, fontSize: 16, color: colors.white }}>{localization?.appkeys?.Next}</Text>
            <FastImage source={images.right} style={{ height: 16, width: 20, marginLeft: 4 }} />
        </Pressable>
    )
}

export default Intro;
