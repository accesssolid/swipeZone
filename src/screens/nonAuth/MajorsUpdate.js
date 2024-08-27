import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTheme } from '@react-navigation/native';
import { LocalizationContext } from '../../localization/localization';
import SolidView from '../components/SolidView';
import InterestBlock from '../components/RenderItem';
import { useDispatch, useSelector } from 'react-redux';
import CustomBtn from '../components/CustomBtn';
import { setLoading } from '../../redux/Reducers/load';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import { setUser } from '../../redux/Reducers/userData';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import AppFonts from '../../constants/fonts';
import CheckBoxBlock from '../components/CheckBoxBlock';

const MajorsUpdate = ({ navigation }) => {
    const dispatch = useDispatch()
    const user = useSelector(state => state?.userData?.user)
    const majors = useSelector(state => state?.droplist?.majors)

    const inputRef = useRef(null)
    const { colors, images } = useTheme();
    const { localization } = useContext(LocalizationContext);
    const styles = useStyles(colors);
    const appkeys = localization?.appkeys

    const [Data, setData] = useState([])
    const [planMajors, setPlanMajors] = useState([])
    const [major, setMajor] = useState("")

    useEffect(() => {
        if (user?.planMajors) {
            setPlanMajors(user?.planMajors)
            // let temp = user?.planMajors ?? []
            // let main = [...Data]
            // let moreItem = temp.filter(x => !main.includes(x)) ?? []
            // if (moreItem?.length) {
            //     moreItem?.forEach(e => {
            //         main.splice(0, 0, e)
            //     });
            //     main.sort()
            // }
            // setData(main)
        }
    }, [user, Data])
    useEffect(() => {
        if (majors) {
            setData(majors)
        }
    }, [majors])

    const submit = async () => {
        try {
            dispatch(setLoading(true))
            let res = await hit(endpoints.updateself, "patch", { planMajors })
            if (!res?.err) {
                AppUtils.showToast("Majors updated")
                dispatch(setUser(res?.data))
                navigation.navigate(AppRoutes.BottomTab)
            } else {
                AppUtils.showToast(res?.msg)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const addMajor = () => {
        if (major.trim() == "") {
            return
        }
        if (Data?.includes(major)) {
            let temp = [...planMajors]
            let ind = temp.indexOf(major)
            if (ind == -1) {
                if (temp?.length < 3) {
                    temp.push(major)
                } else {
                    AppUtils.showToast("You can only select 3 majors.")
                }
            } else {
                temp.splice(ind, 1)
            }
            setPlanMajors(temp)
        } else {
            let temp = [...Data]
            temp.splice(0, 0, major.trim())
            temp.sort()
            setData(temp)
            let x = [...planMajors]
            if (x?.length < 3) {
                x.push(major)
                setPlanMajors(x)
            }
        }
        setMajor("")
    }
    const undecidedHandler = (item) => {
        let temp = [...planMajors]
        let ind = temp.indexOf(item)
        if (ind == -1) {
            if (!(temp.length < 3)) {
                AppUtils.showToast("Maximum number reached.")
                return
            }
            temp?.push(item)
        } else {
            temp.splice(ind, 1)
        }
        setPlanMajors(temp)
    }
    return (
        <SolidView
            back={true}
            title={appkeys.Planned_Majors}
            onPressLeft={() => {
                navigation.goBack()
            }}
            view={
                <>
                    <View style={{ marginHorizontal: 10, marginTop: 10, marginBottom: 4 }}>
                        <Text style={{ fontFamily: AppFonts.Medium, fontSize: 14, color: colors.text }}>(Select up to 3)</Text>
                        {/* <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", marginTop: 8, }}>
                            <TextInput
                                ref={inputRef}
                                placeholder='Type your majors'
                                value={major}
                                onChangeText={(t) => { setMajor(t) }}
                                style={{ height: 52, width: "80%", paddingLeft: 6, borderColor: colors.primary, borderWidth: 2, borderRadius: 4, fontFamily: AppFonts.Medium, fontSize: 14, color: colors.text }}
                                onSubmitEditing={() => {
                                    addMajor()
                                }}
                            />
                            <Pressable
                                style={{ backgroundColor: major?.length == 0 ? "transparent" : colors.primary, borderWidth: 2, borderColor: colors.primary, height: 52, width: "16%", justifyContent: "center", alignItems: "center", flexDirection: "row", alignItems: "center", borderRadius: 4 }}
                                onPress={() => addMajor()}
                            >
                                <Text style={{ fontFamily: AppFonts.Medium, fontSize: 16, color: major?.length == 0 ? colors.primary : colors.white }}>{appkeys?.Add}</Text>
                            </Pressable>
                        </View> */}
                    </View>
                    <CheckBoxBlock styleMain={{ marginBottom: 0 }} txt={localization?.appkeys?.Undecided} arr={planMajors} onPress={(data) => undecidedHandler(data)} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FlatList
                            data={Data}
                            numColumns={2}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ marginHorizontal: 8, marginTop: 10, paddingBottom: 46 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <InterestBlock item={item} index={index} arr={planMajors}
                                        onPress={() => {
                                            if (item == "Other") {
                                                inputRef?.current?.focus()
                                                return
                                            }
                                            let temp = [...planMajors]
                                            let ind = temp.indexOf(item)
                                            if (ind == -1) {
                                                if (temp?.length < 3) {
                                                    temp.push(item)
                                                } else {
                                                    AppUtils.showToast("You can only select 3 majors.")
                                                }
                                            } else {
                                                temp.splice(ind, 1)
                                            }
                                            setPlanMajors(temp)
                                        }}
                                    />
                                )
                            }}
                            ListFooterComponent={() => {
                                return (
                                    <>
                                        <CheckBoxBlock arr={planMajors} txt={localization?.appkeys?.notlisted} onPress={(data) => undecidedHandler(data)} />
                                        <CustomBtn
                                            titleTxt={appkeys.Update}
                                            onPress={() => {
                                                navigation?.navigate(AppRoutes.EditProfile, { planMajors })
                                            }}
                                        />
                                    </>
                                )
                            }}
                        />
                    </ScrollView>
                </>
            }
        />
    )
}

export default MajorsUpdate

const useStyles = (colors) => StyleSheet.create({

})