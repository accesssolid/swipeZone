import React, { useEffect, useState } from "react"
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import AppFonts from "../../constants/fonts"
import { useTheme } from "@react-navigation/native";

const CustomDrop = ({ list, val, setVal, search = false, styleBody, place, styleOptions, disable = false, mainStyle, allData, selectedData }) => {
    const { colors, images } = useTheme();
    const [showList, setShowList] = useState([])
    const [show, setShow] = useState(false)
    const [value, setValue] = useState(val)
    const [searchKey, setSearchKey] = useState("")
    useEffect(() => {
        setVal(value)
    }, [value])
    useEffect(() => {
        setValue(val)
    }, [val])
    useEffect(() => {
        if (list?.length > 0) {
            setShowList(list)
        }
    }, [list])
    useEffect(() => {
        if (search && list?.length > 0 && searchKey?.trim() != "") {
            let temp = list?.filter(x => x?.name?.toLowerCase()?.includes(searchKey?.toLowerCase()))
            setShowList(temp)
        }
        if (searchKey?.trim() == "") {
            setShowList(list)
        }
    }, [search, list, searchKey])

    return (
        <View style={mainStyle}>
            <View style={[{ ...style.shadow, backgroundColor: "white", marginHorizontal: 18, borderRadius: 10, marginTop: 6, }, styleBody]}>
                <Pressable
                    style={{ backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 4, height: 54, flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}
                    onPress={() => {
                        !disable && setShow(!show)
                    }}
                >
                    <Text style={{ color: colors.text, fontSize: 14, fontFamily: AppFonts.Regular }} maxFontSizeMultiplier={1.4}>{value != "" ? value : place}</Text>
                    <Image source={images.down} style={{ height: 16, width: 16, resizeMode: "contain", tintColor: colors.primary, transform: [{ rotate: show ? "180deg" : "0deg" }] }} />
                </Pressable>
            </View>
            <View style={[{ backgroundColor: colors.white, width: "92%", alignSelf: "center", marginTop: 2, borderRadius: 10, maxHeight: 260 }, style.shadow, styleOptions]}>
                {(search && show) &&
                    <TextInput
                        value={searchKey}
                        onChangeText={t => setSearchKey(t)}
                        placeholder="Search..."
                        placeholderTextColor={colors.text}
                        style={{ height: 10, height: 40, padding: 4, borderWidth: 1, borderColor: colors.primary, color: colors.text, fontFamily: AppFonts.Medium }}
                    />
                }
                <ScrollView nestedScrollEnabled={true}>
                    {show && showList?.map((i, j) => {
                        return (
                            <Pressable
                                key={j}
                                style={{
                                    backgroundColor: value == i?.name ? colors?.fade : colors.white,
                                    borderRadius: 5, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 1
                                }}
                                onPress={() => {
                                    allData && selectedData(i)
                                    setValue(i?.name); setShow(false);
                                    setSearchKey("")
                                }}
                            >
                                <Text style={{ color: colors.text, fontSize: 14, fontFamily: AppFonts.Regular }} maxFontSizeMultiplier={1.4}>{i?.name}</Text>
                            </Pressable>
                        )
                    })}
                </ScrollView>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,

        elevation: 2,
    },
})

export default CustomDrop;