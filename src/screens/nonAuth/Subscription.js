import { ActivityIndicator, Alert, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import { hp, wp } from '../../utils/dimension';
import AppFonts from '../../constants/fonts';
import CustomBtn from '../components/CustomBtn';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import SolidView from '../components/SolidView';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/Reducers/userData';
import { requestPurchase, requestSubscription, useIAP } from 'react-native-iap';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import moment from 'moment';
import { setLoading } from '../../redux/Reducers/load';
import AppUtils from '../../utils/appUtils';
import { storeData } from '../../utils/asyncStore';
import Carousel from 'react-native-snap-carousel';
import { getSubFeatures, setSubPlans } from '../../redux/Reducers/subcriptions';
import SubscribeModal from '../modals/SubscribeModal';
import IncorrectSubModal from '../modals/IncorrectSubModal';
import * as RNIap from 'react-native-iap';
import userAnalytics, { USEREVENTS } from '../../utils/userAnalytics';

const Subscription = ({ navigation, route }) => {
  const params = route?.params?.signup
  const dispatch = useDispatch()
  const { localization } = useContext(LocalizationContext);
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const crouselRef = useRef();
  const { currentPurchase } = useIAP();

  const subscriptions = useSelector(state => state?.subcriptions?.subPlans)
  const user = useSelector(state => state.userData.user)

  let iapUpdatedListener, iapErrorListener

  const [subscribedModal, setSubscribedModal] = useState(false)
  const [invalidSubModal, setInvalidSubModal] = useState(false)
  const [purchaseItem, setPurchaseItem] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const isFetchingSubscriptions = useRef(false);

  useEffect(() => {
    Init(["monthly_trial", "monthly_plan", "yearly_plan"])
    return () => {
      iapUpdatedListener?.remove();
      iapErrorListener?.remove();
    };
  }, []);
  // useEffect(() => {
  //   getSubscriptions({ skus: ["monthly", "yearly"] })
  // }, [])
  // useEffect(() => {
  //   if (user?.isSubscribed) {
  //     let subDate = moment(user?.subscribeDate)
  //     if (user?.subType == subTypes.monthly) {
  //       setRenewDate(subDate?.add(30, "day"))
  //     } else {
  //       setRenewDate(subDate?.add(1, "year"))
  //     }
  //   } else {
  //     setRenewDate(null)
  //   }
  // }, [user])
  // useEffect(() => {
  //   if (currentPurchaseError) {
  //     dispatch(setLoading(false));
  //     AppUtils.showLog(currentPurchaseError);
  //   }
  // }, [currentPurchaseError]);
  // useEffect(() => {
  //   console.log(currentPurchase, "--->current purchase");
  //   if (currentPurchase?.productId) {
  //     if (purchaseItem == null) {
  //       checkSub(currentPurchase)
  //     } else {
  //       acknowledegePurchase(currentPurchase)
  //     }
  //     // hitSubScribed(true, currentPurchase?.transactionDate, false, currentPurchase?.productId)
  //   }
  // }, [currentPurchase]);
  useEffect(() => {
    console.log(currentPurchase, "--->current purchase");
    if (currentPurchase?.productId) {
      if (purchaseItem == null) {
        checkPurchaseSub(currentPurchase)
      }
    }
  }, [currentPurchase]);

  const Init = async (sub_ids) => {
    RNIap.initConnection().then(async () => {
      clearFailedTransactions()
      try {
        if (subscriptions?.length == 0) {
          getAllSubs(sub_ids)
        }

        //Listners for successful & Fail Transactions
        addListners()

      } catch (err) {
        console.log(err);
      }
    });
  };
  const addListners = () => {
    iapUpdatedListener = RNIap.purchaseUpdatedListener(async purchase => {
      console.log("purchaseeeeeeeee", purchase);
      if (purchase.transactionReceipt) {
        acknowledgePurchase(Platform.OS == "ios" ? { purchase, isConsumable: true, } : { purchase: purchase, });
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
  const getAllSubs = async (sub_ids) => {
    if (isFetchingSubscriptions.current) {
      return
    }
    isFetchingSubscriptions.current = true
    let subPlans = await RNIap.getSubscriptions({ skus: sub_ids });
    const sortedSubscriptionPlans =
      Platform.OS == "ios"
        ? subPlans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        : subPlans.sort(
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
    dispatch(setSubPlans(sortedSubscriptionPlans))
    isFetchingSubscriptions.current = false
  }
  const clearFailedTransactions = async () => {
    if (Platform.OS == 'android') {
      await RNIap?.flushFailedPurchasesCachedAsPendingAndroid();
    }
    else {
      await RNIap?.clearTransactionIOS();
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
      }
    } catch (err) {
      console.log(err, 'ERRRRR');
    }
  };
  const requestPurchase = async (pkgID, offerToken) => {
    try {
      await RNIap.requestSubscription(Platform.OS == 'ios' ? { sku: pkgID } : { sku: pkgID, subscriptionOffers: [{ sku: pkgID, offerToken: offerToken }], },);
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
  const acknowledegePurchase = async (data) => {
    const transaction_date = (Platform.OS == "ios" ? (data?.originalTransactionDateIOS ?? data?.transactionDate) : (data?.transactionDate ?? moment().unix() * 1000))
    const iosID = data?.originalTransactionIdentifierIOS ?? (data?.transactionId ?? "")
    let nextPaymentDate
    if (data?.productId == "monthly_plan") {
      nextPaymentDate = moment().add(1, "month").unix() * 1000
    } else if (data?.productId == "yearly_plan") {
      nextPaymentDate = moment().add(1, "year").unix() * 1000
    } else if (data?.productId == "monthly_trial") {
      nextPaymentDate = moment().add(1, "month").add(3, "days").unix() * 1000
    }
    let body = {
      subType: data?.productId,
      originalTransactionIdForIOS: iosID,
      purchaseTokenForAndroid: (data?.purchaseToken ?? ""),
      orderIdForAndroid: (data?.orderId ?? ""),
      subscribeDate: transaction_date,
      subPlatform: Platform?.OS,
      nextPaymentDate
    }
    try {
      let res = await hit(endpoints.updateSubscription, "post", body)
      console.log(body, "resssssss", res);
      if (!res?.err) {
        userAnalytics(USEREVENTS.subscription, { ...body, userId: user?._id })
        dispatch(setUser(res?.data?.data))
        dispatch(getSubFeatures(res?.data?.data))
        dispatch(setLoading(false))
        // if (purchaseItem != null) {
        AppUtils.showToast(res?.data?.message)
        setTimeout(() => {
          setSubscribedModal(true)
        }, 300);
        // }
      } else {
        dispatch(setLoading(false))
        AppUtils.showToast(res?.data?.message ?? "Something went wrong. Failed to purchase subscription.")
      }
    } catch (e) {
      AppUtils.showLog(e)
    } finally {
      dispatch(setLoading(false))
      setPurchaseItem(null)
    }
  }
  const termsPress = (key) => {
    navigation.replace(AppRoutes.NonAuthStack, { screen: AppRoutes.PrivacyPolicy, params: { from: key, goTo: params == "signup" ? "bottombar" : "" } })
  }

  return (
    <SolidView
      back={true}
      onPressLeft={() => {
        if (params == "signup") {
          navigation.replace(AppRoutes.NonAuthStack)
          return
        }
        navigation?.goBack()
      }}
      title={localization?.appkeys?.Subscription}
      // hideHeader={params == "signup" && true}
      view={
        <ScrollView showsVerticalScrollIndicator={false}>
          <IncorrectSubModal
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
           {/* <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 18, marginTop: 16, color: colors?.text, textAlign: "center" }}>{activeIndex == 0 ? `Limited access` : `Unlock unlimited access \n to the listed Features ${activeIndex == 1 ? `for a month` : `for a year`}`}</Text> 
           <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 18, marginTop: 16, color: colors?.text, textAlign: "center" }}>{`Unlock unlimited access \n to the listed Features ${activeIndex == 0 ? `for a month` : `for a year`}`}</Text>  */}
          <View>
            {subscriptions?.length > 0 ? <Carousel
              // data={["free"]?.concat(subscriptions)}
              data={subscriptions?.filter(x => x?.productId != "monthly_trial")}
              sliderWidth={wp(100)}
              itemWidth={wp(76)}
              renderItem={({ item, index }) => {
                return (
                  <RenderSubs item={item} index={index}
                    currentPurchase={currentPurchase?.productId || null}
                    onPressFree={() => {
                      navigation.replace(AppRoutes.NonAuthStack)
                    }}
                    iosPurchase={productId => {
                      setPurchaseItem(item)
                      setTimeout(() => {
                        dispatch(setLoading(true));
                        requestPurchase(productId,"")
                      }, 100);
                    }}
                    androidPurchase={(productId, offerToken) => {
                      setPurchaseItem(item)
                      // const subscriptionRequest = {
                      //   subscriptionOffers: [
                      //     {
                      //       sku: productId,
                      //       offerToken,
                      //     },
                      //   ],
                      // };
                      setTimeout(() => {
                        dispatch(setLoading(true));
                        requestPurchase(productId, offerToken)
                      }, 100);
                    }}
                  />
                )
              }}
              ref={crouselRef}
              onSnapToItem={(slideIndex) => {
                setActiveIndex(slideIndex)
              }}
            />
              :
              <View style={{ height: hp(50), justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size={"large"} color={colors.primary} />
                <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 16, color: colors?.text, textAlign: "center" }}>Loading subscriptions please wait.</Text>
              </View>
            }
          </View>
          <View style={{ padding: 16, marginTop: 16 }}>
            {/* <Text style={{ lineHeight: 16 }}>
              <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>Subscribers will automatically be charged the monthly fee upon completion of their free trial period.{"\n"}</Text>
              {subscriptions?.length > 0 && <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 10, color: colors?.text }}>The Monthly Pass ({Platform?.OS == "ios" ? subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.description : subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}) and the Annual Pass ({Platform?.OS == "ios" ? subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.description : subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}) automatically renew at the end of each term.{"\n"}</Text>}
              <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>Payment will be charged to the payment method on file. Cancellations must be made at least 24 hours prior to the end of the current paid period. Cancellations can be made in settings in the SZS app.</Text>
            </Text> */}
            <Text style={{ lineHeight: 16 }}>
              <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>
                Subscribers will automatically be charged the monthly fee upon completion of their free trial period.{"\n"}
              </Text>
              {subscriptions?.length > 0 && (
                <Text style={{ fontFamily: AppFonts?.SemiBold, fontSize: 10, color: colors?.text }}>
                  The Monthly Pass
                  ({Platform?.OS === "ios"
                    ? subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.localizedPrice
                    : subscriptions?.find(x => x?.productId?.includes("monthly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice
                  })
                  and the Annual Pass
                  ({Platform?.OS === "ios"
                    ? subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.localizedPrice
                    : subscriptions?.find(x => x?.productId?.includes("yearly_plan"))?.subscriptionOfferDetails[0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice
                  })
                  automatically renew at the end of each term.{"\n"}
                </Text>
              )}
              <Text style={{ fontFamily: AppFonts?.Regular, fontSize: 10, color: colors?.text }}>
                Payment will be charged to the payment method on file. Cancellations must be made at least 24 hours prior to the end of the current paid period. Cancellations can be made in settings in the SZS app.
              </Text>
            </Text>

          </View>
        </ScrollView>
      }
    />
  )
}

export default Subscription


const ShowSubs = ({ currentPurchase, subscriptions, open, setOpen, iosPurchase, androidPurchase }) => {
  const { colors } = useTheme()
  return <Modal
    visible={open}
    transparent
    animationType="slide"
    onDismiss={() => {
      setOpen(false)
    }}
  >
    <Pressable onPress={() => {
      setOpen(false)
    }} style={{ flex: 1, backgroundColor: "#0005", justifyContent: "flex-end" }}>
      <Pressable style={{ padding: 10 }}>
        {subscriptions?.map((x, u) => {
          return (
            <Pressable key={u?.toString()} onPress={() => {
              if (currentPurchase?.productId == x?.productId) {
                return
              }
              if (Platform.OS == "ios") {
                iosPurchase(x?.productId)
              } else {
                androidPurchase(x?.productId, x?.subscriptionOfferDetails[0]?.offerToken)
              }

            }} style={{ backgroundColor: colors.primary, minHeight: 45, padding: 20, paddingVertical: 15, marginBottom: 10, borderRadius: 10 }}>
              <Text style={{ color: "white", fontFamily: AppFonts.Bold, fontSize: 20 }}>{Platform.OS == "android" ? x?.name : x?.title}</Text>
              <Text style={{ color: "white", fontFamily: AppFonts.Regular, fontSize: 12 }}>{x?.description}</Text>
              {currentPurchase?.productId == x?.productId && <Text style={{ color: "white", fontFamily: AppFonts.Bold, position: "absolute", right: 20, top: 30 }}>Active</Text>}
            </Pressable>
          )
        })}
      </Pressable>
    </Pressable>

  </Modal>
}

const useStyles = (colors) => StyleSheet.create({
  Features: {
    width: wp(8),
    height: 14,
    marginVertical: 10,
  },
  Logo: {
    width: wp(30),
    height: wp(30),
  },
  PriceText: {
    fontFamily: AppFonts?.SemiBold,
    color: colors?.lightblack,
    fontSize: 20,
  },
  MonthlyText: {
    fontFamily: AppFonts?.SemiBold,
    color: colors?.lightblack,
    fontSize: 24, marginBottom: 5
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  }
})

const RenderSubs = ({ item, index, onPressFree, iosPurchase, androidPurchase, currentPurchase }) => {
  console.log("item77777", item)
  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const [featureList, setFeatureList] = useState([])
  const [isPurchased, setIsPurchased] = useState(false)
  const subscriptions = useSelector(state => state?.subcriptions?.allFeatures)

  useEffect(() => {
    if (featureList?.length == 0) {
      if (item == "free") {
        if (subscriptions?.free?.length > 0) {
          setFeatureList(subscriptions?.free)
        } else {
          getFeatures("0")
        }
      } else {
        if (subscriptions?.free?.length > 0) {
          setFeatureList(subscriptions?.paid)
        } else {
          getFeatures("1")
        }
      }
    }
  }, [item, featureList])
  useEffect(() => {
    if (currentPurchase == item?.productId) {
      setIsPurchased(true)
    } else {
      setIsPurchased(false)
    }
  }, [currentPurchase, item])

  const getFeatures = async (t) => {
    try {
      let res = await hit(endpoints?.subFeatures, "post", { type: t?.toString() })
      if (!res?.err) {
        setFeatureList(res?.data)
      }
    } catch (e) {
      AppUtils?.showLog(e, "subbbb")
    }
  }
  return (
    <View style={[{ backgroundColor: colors.white, width: wp(76), borderRadius: 10, marginLeft: wp(2.5), marginRight: wp(2.5), marginVertical: 20, paddingBottom: 20 }, styles?.shadow]}>
      <ImageBackground source={images?.subbg} style={{ width: wp(76), height: hp(18), justifyContent: "center", alignItems: "center" }} imageStyle={{ resizeMode: "stretch", borderRadius: 10, tintColor: (isPurchased && item != "free") ? colors.green : null }}>
        <View style={{ flexDirection: "row" }}>
          {
            item == "free" ?
              <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>Free</Text>
              :
              Platform?.OS == "ios" ?
                <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.localizedPrice ? item?.localizedPrice : item?.price ? `$ ${item?.price}` : "Free"}</Text>
                // <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.price ? `$${item?.price}` : "Free"}</Text>
                :
                <Text style={{ fontFamily: AppFonts?.Bold, fontSize: 28, color: colors?.white, textAlign: "center" }}>{item?.subscriptionOfferDetails[item?.subscriptionOfferDetails?.length > 0 ? (item.subscriptionOfferDetails?.length - 1) : 0]?.pricingPhases?.pricingPhaseList[0]?.formattedPrice}</Text>
          }
          {item?.productId == "yearly_plan" &&
            <View style={{ backgroundColor: "#FFD3BD", marginTop: 5, marginLeft: 10, borderRadius: 5, paddingHorizontal: 5, height: 25, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontFamily: AppFonts.SemiBold }}>Best Value!</Text>
            </View>
          }
        </View>
        {item?.productId != "monthly_trial" ?
          <Text style={{ fontFamily: AppFonts?.Medium, fontSize: 16, color: colors?.white, textAlign: "center" }}>{item?.productId == "monthly_plan" ? "Monthly" : "Annually"}</Text>
          :
          <Text style={{ fontFamily: AppFonts?.Medium, fontSize: 12, color: colors?.white, textAlign: "center" }}>Free first 3 days,{"\n"} then monthly plan will be activated.</Text>
        }
        <View style={{ height: hp(4) }} />
      </ImageBackground>
      {featureList?.length == 0 ?
        <ActivityIndicator size={"large"} color={colors.primary} />
        :
        <View style={{ marginLeft: 8, marginTop: 16 }}>
          {featureList?.map((i, j) => {
            if (item == "free") {
              return <Text key={j?.toString()} style={{ fontFamily: i?.featureName?.includes("No ") ? AppFonts.MediumIta : AppFonts?.SemiBoldIta, fontSize: 12, lineHeight: 22, color: i?.featureName?.includes("No ") ? colors?.grey : colors?.text }}>{i?.featureName}</Text>
            }
            if (item != "free" && i?.isAvailable) {
              return <Text key={j?.toString()} style={{ fontFamily: !i?.isAvailable ? AppFonts.MediumIta : AppFonts?.SemiBoldIta, fontSize: 12, lineHeight: 22, color: i?.isAvailable ? colors?.text : colors?.grey }}>{i?.featureName}</Text>
            }
          })}
        </View>}
      <CustomBtn
        titleTxt={(isPurchased && item != "free") ? "Active Plan" : (currentPurchase && !isPurchased && item != "free") ? "Upgrade" : "Continue"}
        onPress={() => {
          if (item == "free") {
            onPressFree()
          } else {
            if (Platform.OS == "ios") {
              iosPurchase(item?.productId)
            } else {
              androidPurchase(item?.productId, item?.subscriptionOfferDetails[0]?.offerToken)
            }
          }
        }}
        btnStyle={[{ height: 46, width: "70%", padding: 0 }, (isPurchased && item != "free") && { backgroundColor: colors.green }]}
      />
    </View>
  )
}