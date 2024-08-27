import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import CustomBtn from './CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { hp, wp } from '../../utils/dimension';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPlans } from '../../redux/Reducers/subcriptions';
import * as RNIap from 'react-native-iap';
import AppUtils from '../../utils/appUtils';
import { setLoading } from '../../redux/Reducers/load';
import SubscribeModal from '../modals/SubscribeModal';
import BetterTakeSubscription from '../modals/BetterTakeSubscription';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';
import { getUserDetailThunk } from '../../redux/Reducers/userData';
import SettingSubview from './SettingSubview';

const GetSwipe = (props) => {
    const { colors, images } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const plans = useSelector(state => state?.subcriptions?.iapProducts)
    const user = useSelector(state => state?.userData?.user)

    let iapUpdatedListener, iapErrorListener

    const [productList, setProductList] = useState([])
    const [purchaseItem, setPurchaseItem] = useState(null)
    const [subscribedModal, setSubscribedModal] = useState(false)
    const [fivePurchase, setFivePurchase] = useState(false)

    useEffect(() => {
        if (plans?.length == 0) {
            dispatch(getAllPlans())
        } else {
            Init(plans?.map(p => p?.packageId))
        }
    }, [plans])
    useEffect(() => {
        return () => {
            iapUpdatedListener?.remove();
            iapErrorListener?.remove();
        };
    }, []);

    const Init = async (sub_ids) => {
        RNIap.initConnection().then(async () => {
            clearFailedTransactions()
            try {
                if (productList?.length == 0) {
                    getAllSubs(sub_ids)
                }

                //Listners for successful & Fail Transactions
                addListners()

            } catch (err) {
                console.log(err);
            }
        });
    };
    const clearFailedTransactions = async () => {
        if (Platform.OS == 'android') {
            await RNIap?.flushFailedPurchasesCachedAsPendingAndroid();
        }
        else {
            await RNIap?.clearTransactionIOS();
        }
    }
    const getAllSubs = async (sub_ids) => {
        let products = await RNIap.getProducts({ skus: sub_ids });
        const sortedProductList =
            Platform.OS == "ios"
                ? products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                : products.sort(
                    (a, b) =>
                        parseFloat(
                            a?.subscriptionOfferDetails[0]?.pricingPhases
                                ?.pricingPhaseList[0]?.priceAmountMicros ?? 0
                        ) -
                        parseFloat(
                            b?.subscriptionOfferDetails[0]?.pricingPhases
                                ?.pricingPhaseList[0]?.priceAmountMicros ?? 0
                        )
                );
        setProductList(sortedProductList)
    }
    const addListners = () => {
        iapUpdatedListener = RNIap.purchaseUpdatedListener(async purchase => {
            // console.log("purchaseeeeeeeee", purchase);
            if (purchase.transactionReceipt) {
                acknowledgePurchase(Platform.OS == "ios" ? { purchase, isConsumable: true, } : { purchase: purchase, isConsumable: true, });
            } else {
                Alert.alert("Purchase done but transactionReceipt not received")
            }
        });
        iapErrorListener = RNIap.purchaseErrorListener(async err => {
            dispatch(setLoading(false))
            if (err.code == 'E_ALREADY_OWNED') {
                checkSub()
            }
            else {
                Alert.alert(err?.message ?? "")
            }
        });
    }
    const requestPurchase = async (pkgID, offerToken) => {
        try {
            await RNIap.requestPurchase(Platform.OS == 'ios' ? { sku: pkgID } : { skus: [pkgID] })
            // await RNIap.requestSubscription(Platform.OS == 'ios' ? { sku: pkgID } : { sku: pkgID, subscriptionOffers: [{ sku: pkgID }], },);
        } catch (err) {
            Alert.alert("Error", err?.message ?? "Something went wrong")
            dispatch(setLoading(false))
        }
    }
    const checkPurchaseSub = async (data) => {
        let body = {
            "originalTransactionIdForIOS": data?.originalTransactionIdentifierIOS ?? (data?.transactionId ?? ""),
            "purchaseTokenForAndroid": data?.purchaseToken ?? ""
        }
        try {
            let res = await hit(endpoints.checkSubscription, "post", body)
            console.log(body, "resss>>>>>checking purchase", res);
            if (res?.err) {
                AppUtils.showToast(res?.msg || "Something went wrong.")
                if (purchaseItem == null) {
                    setInvalidSubModal(true)
                }
            }
        } catch (e) {
            AppUtils.showLog(e, "checking sub")
        }
    }
    const acknowledgePurchase = async (data) => {
        try {
            await RNIap.finishTransaction(data);
            let purchaseData = data?.purchase

            //Save Data on Server
            acknowledegePurchase(purchaseData)
            //originalTransactionIdentifierIOS - For iOS
            //purchaseToken,orderId/transactionId - For Android
            //productId - For Both
        } catch (error) {
            Alert.alert("Error", error?.message ?? "Error in acknowledgement")
            dispatch(setLoading(false))
        }
    };
    const acknowledegePurchase = async (data) => {
        const transaction_date = (Platform.OS == "ios" ? (data?.originalTransactionDateIOS ?? data?.transactionDate) : (data?.transactionDate ?? moment().unix() * 1000))
        const iosID = data?.originalTransactionIdentifierIOS ?? (data?.transactionId ?? "")
        let iosInfo = Platform?.OS == "ios" ? { transactionDate: transaction_date, transactionId: iosID, productId: data?.productId } : {}
        let androidInfo = Platform?.OS == "ios" ? {} : { ...data }

        let body = {
            "price": purchaseItem?.price ?? Number(plans?.filter(x => x?.packageId == data?.productId)?.[0]?.amount),
            "currency": purchaseItem?.currency ?? plans?.filter(x => x?.packageId == data?.productId)?.[0]?.currency,
            "packageId": data?.productId,
            "purchaseInfoAndroid": androidInfo,
            "purchaseInfoIos": iosInfo
        }
        try {
            let res = await hit(endpoints.purchaseProduct, "post", body)
            console.log(body, "resssssss", res);
            if (!res?.err) {
                dispatch(getUserDetailThunk())
                userAnalytics(USEREVENTS.iap, { ...body, userId: user?._id })
                setTimeout(() => {
                    if (res?.data?.userPurchases > 5) {
                        setFivePurchase(true)
                    } else {
                        setSubscribedModal(true)
                    }
                }, 300);
            } else {
                dispatch(setLoading(false))
                AppUtils.showToast(res?.msg ?? "Something went wrong. Failed to purchase subscription.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
            setPurchaseItem(null)
        }
    }
    const checkSub = async () => {
        try {
            const purchases = await RNIap.getAvailablePurchases();
            if (purchases && purchases.length > 0) {
                let data = purchases.sort((a, b) =>
                    b?.transactionDate > a?.transactionDate ? 1 : -1,
                );
                let latestEntry = data[0];
                console.log("latestEntrylatestEntry", latestEntry);
                // Check if you have any available purchase  , update it on server
                // acknowledgePurchase(latestEntry)
            }
        } catch (err) {
            console.log(err, 'ERRRRR');
        }
    };
    const getSwipes = async () => {
        if (productList?.length == 0) {
            AppUtils.showToast('Something went wrong. Try again later')
            return
        }
        const [item] = productList
        const { productId } = item
        if (Platform?.OS == "ios") {
            setPurchaseItem(item)
            dispatch(setLoading(true));
            setTimeout(() => {
                requestPurchase(productId,"")
            }, 1000);
        } else {
            setPurchaseItem(item)
            dispatch(setLoading(true));
            setTimeout(() => {
                requestPurchase(productId, "")
            }, 2000);
        }
    }

    if (props?.isButton) {
        return (
            <>
                <SettingSubview logo={true}
                    onPress={() => {
                        getSwipes()
                    }}
                    arrow={images?.arrowforward}
                    logotitle={productList?.length > 0 ? 'Get More Swipes' : "Loading Products"}
                />
                <SubscribeModal
                    visible={subscribedModal}
                    title={'Congratulations! You Got 10 More Swipes!'}
                    onPressOk={() => {
                        setSubscribedModal(false)
                        navigation.navigate(AppRoutes.BottomTab)
                        // setTimeout(() => {
                        //     props?.closeModal()
                        // }, 200);
                    }}
                />
                <BetterTakeSubscription
                    visible={fivePurchase}
                    closeModal={() => {
                        setFivePurchase(false);
                        // setTimeout(() => {
                        //     props?.closeModal()
                        // }, 200);
                    }}
                    goToSub={() => {
                        setTimeout(() => {
                            navigation?.navigate(AppRoutes.Subscription)
                        }, 1000);
                    }}
                />
            </>
        )
    }
    return (
        <View style={styles.modalScreen}>
            <View style={{ backgroundColor: colors?.background, minHeight: 200, padding: 20, width: "90%", borderRadius: 6, justifyContent: "center", alignItems: "center" }}>
                <SubscribeModal
                    visible={subscribedModal}
                    title={'Congratulations! You Got 10 More Swipes!'}
                    onPressOk={() => {
                        setSubscribedModal(false)
                        setTimeout(() => {
                            props?.closeModal()
                        }, 200);
                    }}
                />
                <BetterTakeSubscription
                    visible={fivePurchase}
                    closeModal={() => {
                        setFivePurchase(false);
                        setTimeout(() => {
                            props?.closeModal()
                        }, 200);
                    }}
                    goToSub={() => {
                        setTimeout(() => {
                            navigation?.navigate(AppRoutes.Subscription)
                        }, 1000);
                    }}
                />
                <Image source={images.iap} style={{ height: 120, width: 120 }} resizeMode='contain' />
                <Text style={{ textAlign: "center", fontFamily: AppFonts.SemiBold, fontSize: 16, maxWidth: "90%", marginTop: 16 }}>{`10 More Swipes $.99`}</Text>
                {productList?.length > 0 ?
                    <>
                        <CustomBtn
                            titleTxt={"Buy Now"}
                            btnStyle={{ marginTop: 30 }}
                            onPress={() => {
                                getSwipes()
                                // props?.closeModal()
                                // setTimeout(() => {
                                //     navigation?.navigate(AppRoutes.MoreSwipes)
                                // }, 100);
                            }}
                        />
                    </>
                    :
                    <>
                        {/* <Image source={images.wait} style={{ height: 120, width: 120, resizeMode: "contain", alignSelf: "center" }} /> */}
                        {/* <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 16, color: colors?.text, textAlign: "center" }}>Loading products. Please wait.</Text> */}
                        <ActivityIndicator size={"large"} color={colors.primary} />
                    </>
                }
                <Text style={{ fontFamily: AppFonts.Bold, color: colors.text, fontSize: 13, marginVertical: 16 }} onPress={() => { props?.onClickNo(); props?.closeModal() }}>No Thanks</Text>
            </View>
        </View>
    )
}

export default GetSwipe

const styles = StyleSheet.create({
    modalScreen: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: hp(120),
        width: wp(100),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        zIndex: 100
    }
})