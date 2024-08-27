import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { wp } from '../../utils/dimension';
import { LocalizationContext } from '../../localization/localization';
import AppFonts from '../../constants/fonts';
import CustomDrop from '../components/CustomDrop';
import { useSelector } from 'react-redux';
import CustomBtn from '../components/CustomBtn';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { getPositionSports } from '../../api/Services/services';
import AppUtils from '../../utils/appUtils';
import MultichoiceQn from '../components/MultichoiceQn';
import moment from 'moment';

const FilterModal = (props) => {
    const sportList = useSelector(state => state?.droplist?.sports)
    const user = useSelector(state => state?.userData)?.user
    const majors = useSelector(state => state?.droplist?.majors)

    const { localization } = useContext(LocalizationContext);
    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    const years = getYears()

    const [positionList, setPositionList] = useState([])
    const [selectedPosition, setSelectedPosition] = useState("")
    const [selectedMajor, setSelectedMajor] = useState("")
    const [multiSliderValue, setMultiSliderValue] = useState([2.0, 4.0]);
    const [ts, setTs] = useState("")
    const [gradYear, setGradYear] = useState("")

    useEffect(() => {
        if (user && sportList && positionList?.length == 0) {
            let sportsId = sportList?.filter(x => x?.name == user?.sports?.[0])?.[0]?._id
            if (sportsId) {
                getPosSports(sportsId)
            }
            // return
            // let uniSport = user?.sports[0]
            // if (uniSport) {
            //     let positions = sportList?.filter(x => x?.name == uniSport)
            //     setPositionList(positions[0]?.data)
            // }
        }
    }, [sportList, user, positionList])

    function getYears(params) {
        let arr = []
        for (let i = 1990; i <= moment().format("YYYY"); i++) {
            arr.push({ name: i })
        }
        return arr
    }
    const getPosSports = async (id) => {
        try {
            let res = await getPositionSports(id)
            // console.log(res, "filterPostions");
            if (!res?.err) {
                setPositionList(res?.data)
            }
        } catch (e) {
            AppUtils.showLog(e, "filters poisiton")
        }
    }
    const multiSliderValuesChange = (values) => {
        setMultiSliderValue(values)
    };
    const applyFilters = () => {
        let temp = {
            minGPA: (multiSliderValue[0] != 0 || multiSliderValue[1] != 10) ? multiSliderValue[0] : null,
            maxGPA: (multiSliderValue[0] != 0 || multiSliderValue[1] != 10) ? multiSliderValue[1] : null,
            position: selectedPosition != "" ? selectedPosition : null,
            planMajors: selectedMajor != "" ? selectedMajor : null,
            gradYear: gradYear ? gradYear : null,
            collegeTransferringFrom: ts ? ts : null
        }
        props?.visOff()
        props?.appliedFilters(temp)
    }
    const clearFilter = () => {
        setMultiSliderValue([2.0, 4.0])
        setSelectedPosition("")
        setSelectedMajor("")
        setGradYear("")
        setTs("")
        props?.visOff()
        props?.appliedFilters({ minGPA: null, maxGPA: null, position: null, planMajors: null, gradYear: null, collegeTransferringFrom: null })
    }
    return (
        <Modal
            visible={props?.vis}
            transparent={true}
            animationType="slide"
        >
            <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
                <Pressable style={{ backgroundColor: colors.background, flex: 1, minHeight: wp(40), borderTopRightRadius: 60, borderTopLeftRadius: 60, paddingTop: 18, paddingBottom: 80 }}>
                    <Pressable style={{ padding: 4, position: "absolute", right: wp(10), top: 24, zIndex: 10 }}
                        onPress={() => {
                            clearFilter();
                        }}
                    >
                        <Text style={{ fontSize: 12, fontFamily: AppFonts.Regular, color: colors.text }}>{localization?.appkeys?.clearall}</Text>
                    </Pressable>
                    <Text style={styles.boldTxt}>{localization?.appkeys?.filter}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.placeTxt}>{localization?.appkeys?.GPA}</Text>
                        <Text style={styles.placeTxt} onPress={() => { setMultiSliderValue([2.0, 4.0]) }}>{localization?.appkeys?.cleargpa}</Text>
                    </View>
                    <View style={{ marginHorizontal: 20 }}>
                        <MultiSlider
                            sliderLength={wp(90)}
                            min={2.0}
                            max={4.0}
                            step={0.1}
                            values={multiSliderValue}
                            showSteps={true} showStepLabels={true}
                            snapped={true}
                            onValuesChange={multiSliderValuesChange}
                            selectedStyle={{
                                backgroundColor: colors.primary,
                            }}
                            customMarker={() => {
                                return (
                                    <View style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: colors.primary }} />
                                )
                            }}
                        // customLabel={(dir) => {
                        //     console.log(dir);
                        //     return (
                        //         <View style={{ backgroundColor: colors.primary }}>
                        //             <Text>{dir?.oneMarkerValue}</Text>
                        //         </View>
                        //     )
                        // }}
                        // enableLabel={false}
                        />
                        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                            <Text style={[styles.boldTxt, { fontSize: 14 }]}>{multiSliderValue[0]?.toFixed(1)}</Text>
                            <Text style={[styles.boldTxt, { fontSize: 14 }]}>{multiSliderValue[1] == 4 ? "4.0+" : multiSliderValue[1]?.toFixed(1)}</Text>
                        </View>
                    </View>
                    <MultichoiceQn
                        list={[{ label: "High School Athlete", value: "high" }, { label: "Transfer Athlete", value: "transfer" }]}
                        value={ts}
                        onChange={(t) => { setTs(t) }}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.placeTxt}>{localization?.appkeys?.Position}</Text>
                        <Text style={styles.placeTxt} onPress={() => { setSelectedPosition("") }}>{localization?.appkeys?.clearposition}</Text>
                    </View>
                    <CustomDrop
                        list={positionList}
                        val={selectedPosition}
                        setVal={(v) => { setSelectedPosition(v) }}
                    />
                    <Text style={styles.placeTxt}>{localization?.appkeys?.GraduationYear}</Text>
                    <CustomDrop
                        mainStyle={{ marginBottom: 80 }}
                        list={years}
                        val={gradYear}
                        setVal={(v) => { setGradYear(v) }}
                    />
                    <CustomBtn
                        titleTxt={localization?.appkeys?.apply}
                        onPress={() => {
                            applyFilters()
                        }}
                    />
                </Pressable>
            </SafeAreaView>
        </Modal >
    )
}

export default FilterModal

const useStyles = (colors) => StyleSheet.create({
    boldTxt: {
        fontSize: 20,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        textAlign: "center",
    },
    placeTxt: {
        margin: 18,
        marginBottom: 4,
        fontSize: 12,
        fontFamily: AppFonts.SemiBold,
        color: colors.text,
        marginLeft: 22
    },
})