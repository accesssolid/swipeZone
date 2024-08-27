import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import Home from '../../screens/nonAuth/Home'
import AppRoutes from '../RouteKeys/appRoutes'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from '@react-navigation/native'
import { wp } from '../../utils/dimension'
import FastImage from 'react-native-fast-image'
import Matches from '../../screens/nonAuth/Matches'
import Profile from '../../screens/nonAuth/Profile'
import Chat from '../../screens/nonAuth/Chat'
import { useSelector } from 'react-redux'
import AppFonts from '../../constants/fonts'

const BottomTab = () => {
    const Tab = createBottomTabNavigator();

    const unreadCount = useSelector(state => state?.message?.totalUnreadCount)
    const noInteractions = useSelector(state => state?.matches?.noInteractionMatches)

    const { colors, images } = useTheme();
    const styles = useStyles(colors);

    const Custom = ({ route }) => {
        return ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                height: Platform?.OS == "ios" ? 90 : 66,
                backgroundColor: colors.background,
                shadowColor: colors.primary,
                shadowOffset: {
                    width: 0,
                    height: -3
                },
                shadowRadius: 4,
                shadowOpacity: 0.2,

                elevation: 10,
            },
            tabBarIcon: (({ focused, color, size }) => {
                switch (route.name) {
                    case AppRoutes.Home: {
                        return (
                            <View style={[styles.tab, focused && styles.selectedTab]}>
                                <FastImage source={images.deck} style={styles.tabIcons} resizeMode="contain" />
                            </View>
                        )
                    }
                    case AppRoutes.Matches: {
                        return (
                            <View>
                                {noInteractions > 0 && <View style={{ position: "absolute", zIndex: 10, right: 18, top: 6, backgroundColor: colors.red, minHeight: 16, minWidth: 16, maxHeight: 20, maxWidth: 26, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                                    <Text style={{ color: colors.white, fontFamily: AppFonts.Medium, fontSize: 12 }}>{noInteractions?.toString()}</Text>
                                </View>}
                                <View style={[styles.tab, focused && styles.selectedTab]}>
                                    <FastImage source={images.match} style={styles.tabIcons} resizeMode="contain" />
                                </View>
                            </View>
                        )
                    }
                    case AppRoutes.Chat: {
                        return (
                            <View>
                                {unreadCount > 0 && <View style={{ position: "absolute", zIndex: 10, right: 18, top: 6, backgroundColor: colors.red, minHeight: 16, minWidth: 16, maxHeight: 20, maxWidth: 26, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                                    <Text style={{ color: colors.white, fontFamily: AppFonts.Medium, fontSize: 12 }}>{unreadCount?.toString()}</Text>
                                </View>}
                                <View style={[styles.tab, focused && styles.selectedTab]}>
                                    <FastImage source={images.chat} style={styles.tabIcons} resizeMode="contain" />
                                </View>
                            </View>
                        )
                    }
                    case AppRoutes.Profile: {
                        return (
                            <View style={[styles.tab, focused && styles.selectedTab]}>
                                <FastImage source={images.avatar} style={styles.tabIcons} resizeMode="contain" />
                            </View>
                        )
                    }
                }
            })
        })
    }
    return (
        <Tab.Navigator
            screenOptions={Custom}
            initialRouteName={AppRoutes.Home}
        >
            <Tab.Screen name={AppRoutes.Home} component={Home} />
            <Tab.Screen name={AppRoutes.Matches} component={Matches} />
            <Tab.Screen name={AppRoutes.Chat} component={Chat} />
            <Tab.Screen name={AppRoutes.Profile} component={Profile} />
        </Tab.Navigator>
    )
}

export default BottomTab

const useStyles = (colors) => StyleSheet.create({
    tabIcons: {
        height: 24,
        width: 24,
    },
    img: {
        height: 20, width: 20, resizeMode: "contain", marginTop: 4
    },
    tab: {
        justifyContent: "center", alignItems: "center",
        height: "100%", width: wp(20),
        borderTopWidth: 2.6,
        borderColor: "transparent",
        opacity: 0.4
    },
    selectedTab: {
        borderColor: colors.primary, opacity: 1
    }
})