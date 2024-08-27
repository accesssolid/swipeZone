import { ActivityIndicator, Alert, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import SolidView from '../components/SolidView'
import { LocalizationContext } from '../../localization/localization';
import AppFonts from '../../constants/fonts';
import { useTheme } from '@react-navigation/native';
import CustomBtn from '../components/CustomBtn';
import * as RNIap from 'react-native-iap';
import { hp, wp } from '../../utils/dimension';
import Carousel from 'react-native-snap-carousel';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPlans } from '../../redux/Reducers/subcriptions';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { setLoading } from '../../redux/Reducers/load';
import { endpoints } from '../../api/Services/endpoints';
import AppUtils from '../../utils/appUtils';
import SubscribeModal from '../modals/SubscribeModal';
import hit from '../../api/Manager/manager';
import SwipeFinishedModal from '../modals/SwipeFinishedModal';
import BetterTakeSubscription from '../modals/BetterTakeSubscription';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';

const MoreSwipes = ({ navigation }) => {
  const { localization } = useContext(LocalizationContext);
  const { colors, images } = useTheme();
  const dispatch = useDispatch();
  const crouselRef = useRef();

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
    // let nextPaymentDate
    // if (data?.productId == "monthly_plan") {
    //   nextPaymentDate = moment().add(1, "month").unix() * 1000
    // } else if (data?.productId == "yearly_plan") {
    //   nextPaymentDate = moment().add(1, "year").unix() * 1000
    // } else if (data?.productId == "monthly_trial") {
    //   nextPaymentDate = moment().add(1, "month").add(3, "days").unix() * 1000
    // }
    // let body = {
    //   subType: data?.productId,
    //   originalTransactionIdForIOS: iosID,
    //   purchaseTokenForAndroid: (data?.purchaseToken ?? ""),
    //   orderIdForAndroid: (data?.orderId ?? ""),
    //   subscribeDate: transaction_date,
    //   subPlatform: Platform?.OS,
    //   nextPaymentDate
    // }
    try {
      let res = await hit(endpoints.purchaseProduct, "post", body)
      console.log(body, "resssssss", res);
      if (!res?.err) {
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
      AppUtils.showLog(e)
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

  return (
    <SolidView
      back={true}
      onPressLeft={() => {
        navigation?.goBack()
      }}
      title={'More Swipes'}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          <SubscribeModal
            visible={subscribedModal}
            title={'Congratulations! You Got 10 More Swipes!'}
            onPressOk={() => {
              setSubscribedModal(false)
              setTimeout(() => {
                navigation.replace(AppRoutes.NonAuthStack)
              }, 200);
            }}
          />
          <BetterTakeSubscription
            visible={fivePurchase}
            closeModal={() => {
              setFivePurchase(false)
              setTimeout(() => {
                navigation.replace(AppRoutes.NonAuthStack)
              }, 200);
            }}
            goToSub={() => {
              setTimeout(() => {
                navigation?.navigate(AppRoutes.Subscription)
              }, 1000);
            }}
          />
          <View>
            {productList?.length > 0 ? <Carousel
              data={productList}
              sliderWidth={wp(100)}
              itemWidth={wp(76)}
              renderItem={({ item, index }) => {
                return (
                  <RenderProducts item={item} index={index}
                    // currentPurchase={currentPurchase?.productId || null}
                    onPressFree={() => {
                      navigation.replace(AppRoutes.NonAuthStack)
                    }}
                    iosPurchase={productId => {
                      setPurchaseItem(item)
                      dispatch(setLoading(true));
                      setTimeout(() => {
                        requestPurchase(productId,"")
                      }, 1000);
                    }}
                    androidPurchase={(productId, offerToken) => {
                      setPurchaseItem(item)
                      dispatch(setLoading(true));
                      setTimeout(() => {
                        requestPurchase(productId, offerToken)
                      }, 2000);
                    }}
                  />
                )
              }}
              ref={crouselRef}
              onSnapToItem={(slideIndex) => {
                // setActiveIndex(slideIndex)
              }}
            />
              :
              <View style={{ height: hp(50), justifyContent: "center", alignItems: "center" }}>
                {/* <ActivityIndicator size={"large"} color={colors.primary} /> */}
                <Image source={images.wait} style={{ height: 120, width: 120, resizeMode: "contain", alignSelf: "center" }} />
                <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 16, color: colors?.text, textAlign: "center" }}>Loading products. Please wait.</Text>
              </View>
            }
          </View>

          {/* <IncorrectSubModal
              visible={invalidSubModal}
              onPressOk={() => {
                setInvalidSubModal(false)
                setTimeout(() => {
                  navigation.replace(AppRoutes.NonAuthStack)
                }, 200);
              }}
            />
            <SubscribeModal
              visible={subscribedModal}
              onPressOk={() => {
                setSubscribedModal(false)
                setTimeout(() => {
                  navigation.replace(AppRoutes.NonAuthStack)
                }, 200);
              }}
            />
            <View style={{ padding: 16, marginTop: 16 }}>
              <Text style={{ lineHeight: 16 }}>
                <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>Subscribers will automatically be charged the monthly fee upon completion of their free trial period.{"\n"}</Text>
                {subscriptions?.length > 0 && <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 10, color: colors?.text }}>The Monthly Pass ({Platform?.OS == "ios" ? subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.description : subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}) and the Annual Pass ({Platform?.OS == "ios" ? subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.description : subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}) automatically renew at the end of each term.{"\n"}</Text>}
                <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>Payment will be charged to the payment method on file. Cancellations must be made at least 24 hours prior to the end of the current paid period. Cancellations can be made in settings in the SZS app.</Text>
              </Text>
              <Text onPress={() => termsPress("terms")} style={{ fontFamily: AppFonts?.Bold, fontSize: 12, color: colors?.text, textAlign: "center", alignSelf: "center" }}>{localization?.appkeys.Termsofservice} | <Text onPress={() => termsPress("privacy")}>{localization?.appkeys.PrivacyPolicy}</Text></Text>
            </View> */}
        </ScrollView>
      }
    />
  )
}

export default MoreSwipes

const useStyles = (colors) => StyleSheet.create({

})

const RenderProducts = ({ item, index, onPressFree, iosPurchase, androidPurchase, currentPurchase }) => {
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const [featureList, setFeatureList] = useState([{ featureName: 'Get 10 More Swipes' }])
  const [isPurchased, setIsPurchased] = useState(false)
  // const subscriptions = useSelector(state => state?.subcriptions?.allFeatures)

  // useEffect(() => {
  //   if (featureList?.length == 0) {
  //     if (item == "free") {
  //       if (subscriptions?.free?.length > 0) {
  //         setFeatureList(subscriptions?.free)
  //       } else {
  //         getFeatures("0")
  //       }
  //     } else {
  //       if (subscriptions?.free?.length > 0) {
  //         setFeatureList(subscriptions?.paid)
  //       } else {
  //         getFeatures("1")
  //       }
  //     }
  //   }
  // }, [item, featureList])
  // useEffect(() => {
  //   if (currentPurchase == item?.productId) {
  //     setIsPurchased(true)
  //   } else {
  //     setIsPurchased(false)
  //   }
  // }, [currentPurchase, item])

  // const getFeatures = async (t) => {
  //   try {
  //     let res = await hit(endpoints?.subFeatures, "post", { type: t?.toString() })
  //     if (!res?.err) {
  //       setFeatureList(res?.data)
  //     }
  //   } catch (e) {
  //     AppUtils?.showLog(e, "subbbb")
  //   }
  // }
  return (
    <View style={[{ backgroundColor: colors.white, width: wp(76), borderRadius: 10, marginLeft: wp(2.5), marginRight: wp(2.5), marginVertical: 20, paddingBottom: 20 }, styles?.shadow]}>
      <ImageBackground source={images?.subbg} style={{ width: wp(76), height: hp(18), justifyContent: "center", alignItems: "center" }} imageStyle={{ resizeMode: "stretch", borderRadius: 10 }}>
        <View style={{ flexDirection: "row" }}>
          {
            Platform?.OS == "ios" ?
              <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.price ? `$${item?.price}` : "Free"}</Text>
              :
              // <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.subscriptionOfferDetails[item?.subscriptionOfferDetails?.length > 0 ? (item.subscriptionOfferDetails?.length - 1) : 0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}</Text>
              <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.price ? `${item?.price}` : "Free"}</Text>
          }
        </View>
        <Text style={{ fontFamily: AppFonts?.Medium, fontSize: 12, color: colors?.white, textAlign: "center" }}>10 More Swipes</Text>
        <View style={{ height: hp(4) }} />
      </ImageBackground>
      {/* {featureList?.length == 0 ?
        <ActivityIndicator size={"large"} color={colors.primary} />
        :
        <View style={{ marginLeft: 8, marginTop: 16 }}>
          {featureList?.map((i, j) => {
            return <Text key={j?.toString()} style={{ fontFamily: AppFonts?.SemiBoldIta, fontSize: 12, lineHeight: 22, color: colors?.text }}>{i?.featureName}</Text>
          })}
        </View>} */}
      <CustomBtn
        titleTxt={"Continue"}
        onPress={() => {
          if (item == "free") {
            onPressFree()
          } else {
            if (Platform.OS == "ios") {
              iosPurchase(item?.productId)
            } else {
              androidPurchase(item?.productId, item?.subscriptionOfferDetails?.[0]?.offerToken ?? '')
            }
          }
        }}
        btnStyle={[{ height: 46, width: "70%", padding: 0 }, (isPurchased && item != "free") && { backgroundColor: colors.green }]}
      />
    </View>
  )
}