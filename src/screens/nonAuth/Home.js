import { useFocusEffect, useIsFocused, useTheme } from "@react-navigation/native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Platform, Alert } from "react-native";
import SolidView from "../components/SolidView";
import Swiper from "react-native-deck-swiper";
import { hp, wp } from "../../utils/dimension";
import FastImage from "react-native-fast-image";
import AppRoutes from "../../routes/RouteKeys/appRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/Reducers/load";
import hit from "../../api/Manager/manager";
import { endpoints } from "../../api/Services/endpoints";
import AppUtils from "../../utils/appUtils";
import { LocalizationContext } from "../../localization/localization";
import CardBlock from "../components/CardBlock";
import { getFavListThunk } from "../../redux/Reducers/favs";
import AppFonts from "../../constants/fonts";
import { getChatUnreadCount } from "../../redux/Reducers/messages";
import FilterModal from "../modals/FilterModal";
import firestore from '@react-native-firebase/firestore';
import moment from "moment";
import checkIsSubScribedStill from "../../utils/checkIsSubScribedStill";
import SwipeFinishedModal from "../modals/SwipeFinishedModal";
import { swipingEnabled } from "../../utils/SubscriptionCheck";
import { config } from "../../../config";
import CompleteProfileModal from "../modals/CompleteProfileModal";
import { setIsDisplayed } from "../../redux/Reducers/completeProfile";
import { getUserDetailThunk } from "../../redux/Reducers/userData";
import { setSwipes } from "../../redux/Reducers/swipes";
import GetSwipe from "../components/GetSwipe";

const Home = ({ navigation }) => {
  const isfocused = useIsFocused()
  const isAthlete = useSelector(state => state?.userData?.isAthlete)
  const user = useSelector(state => state?.userData?.user)
  const subFeatures = useSelector(state => state?.subcriptions?.features)
  const loading = useSelector(state => state?.load?.isLoading);
  const isDisplayed = useSelector(state => state?.completeProfile?.isDisplayed);
  const swipes = useSelector(state => state?.swipes?.swipes);
  // console.log("user7777",user);
  const dispatch = useDispatch()
  const { colors, images } = useTheme();
  const styles = useStyles(colors)
  const { localization } = useContext(LocalizationContext);

  const [atheleteList, setAtheleteList] = useState([])
  const [swipedAll, setSwipedAll] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    minGPA: null,
    maxGPA: null,
    position: null,
    planMajors: null,
    gradYear: null,
    collegeTransferringFrom: null
  })
  const [loaderState, setLoaderState] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 16
  const swiperRef = useRef(null)
  const [todayCount, setTodayCount] = useState(0)
  const [freeSwipeCounts, setFreeSwipeCounts] = useState(0)
  const [swipeUsed, setSwipeUsed] = useState(false)
  const [showCompletePopup, setShowCompletePopup] = useState(false)
  const [showGetMoreSwipes, setShowGetMoreSwipes] = useState(false)
  const [disableSwipe, setDisableSwipe] = useState(true) //Opposite action to the name

  useEffect(() => {
  
    getFcm();
  
  }, []);

  const getFcm = async () => {
    let fcm = await AppUtils.getToken();
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          await getAllData(1);
        } catch (error) {
        }
      };

      const timeoutId = setTimeout(fetchData, 200);
      dispatch(getUserDetailThunk())
      return () => {
        clearTimeout(timeoutId);
      };
    }, [filters])
  );
  useEffect(() => {
    dispatch(getChatUnreadCount(user?._id))
  }, [user])
  useEffect(() => {
    if (!isDisplayed) {
      if (user?.role == 'athelete' && !loading) {
        if (user?.currentStep != 2) {
          let timeout = setTimeout(() => {
            setShowCompletePopup(true)
          }, 1000);
          return () => {
            clearTimeout(timeout)
          }
        }
      }
    }
  }, [user, loading, isDisplayed])
  useEffect(() => {
    if (!user?.isSubscribed) {
      if (swipes?.freeSwipes == 0 && !swipes?.hasPurchased) {
        setDisableSwipe(false)
      } else if (swipes?.freeSwipes == 0 && swipes?.hasPurchased && swipes?.paidSwipes == 0) {
        setDisableSwipe(false)
      } else {
        setDisableSwipe(true)
      }
    } else {
      setDisableSwipe(true)
    }
  }, [swipes?.freeSwipes, swipes?.paidSwipes, user])

  //check swipecount for freeaccounts
  // useEffect(() => {
  //   if (isAthlete && isfocused && !user?.isFreeSubscription) {
  //     if (!checkIsSubScribedStill() && atheleteList?.length > 0 && !loaderState && todayCount >= 2) {
  //       setSwipeUsed(true)
  //     }
  //   }
  // }, [user, todayCount, atheleteList, loaderState, isfocused, isAthlete])
  // getting count
  // useEffect(() => {
  //   let unsub = firestore().collection("swipes").doc(user?._id + "_" + moment().format("YYYY-MM-DD")).onSnapshot(d => {
  //     let data = d.data() ?? { count: 0 }
  //     console.log(data);
  //     setTodayCount(data.count)
  //   })
  //   return () => {
  //     unsub()
  //   }
  // }, [])
  //free swipes count
  // useEffect(() => {
  //   let unsub = firestore().collection("freeswipes").doc(user?._id).onSnapshot(d => {
  //     let data = d.data() ?? { freeSwipecount: 0 }
  //     console.log(data);
  //     setFreeSwipeCounts(data.freeSwipecount)
  //   })
  //   return () => {
  //     unsub()
  //   }
  // }, [])

  // increase count
  // const increaseCount = () => {
  //   const documentRef = firestore().collection("swipes").doc(user?._id + "_" + moment().format("YYYY-MM-DD"));

  //   firestore().runTransaction(async (transaction) => {
  //     const doc = await transaction.get(documentRef);
  //     let newCount = 1; // Initial value if the document doesn't exist

  //     if (doc.exists) {
  //       const currentCount = doc.data().count || 0; // Get the current count (default to 0 if undefined)
  //       newCount = currentCount + 1; // Increment the count
  //     }

  //     transaction.set(documentRef, { count: newCount }); // Set the updated count
  //   })
  //     .then(() => {
  //       console.log("Count incremented successfully");
  //     })
  //     .catch((error) => {
  //       console.error("Error incrementing count: ", error);
  //     });
  // }
  // const increaseCountFree = () => {
  //   const documentRef = firestore().collection("freeswipes").doc(user?._id);
  //   firestore().runTransaction(async (transaction) => {
  //     const doc = await transaction.get(documentRef);
  //     let newCount = 1; // Initial value if the document doesn't exist

  //     if (doc.exists) {
  //       const currentCount = doc.data().freeSwipecount || 0; // Get the current count (default to 0 if undefined)
  //       newCount = currentCount + 1; // Increment the count
  //     }

  //     transaction.set(documentRef, { freeSwipecount: newCount }); // Set the updated count
  //   }).then(() => {
  //     console.log("freee swipe recorded");
  //   })
  // }

  const getAllData = async (page) => {
    try {
      dispatch(setLoading(true))
      let addFilter = addQuery(filters)
      const queryString = addFilter.length > 0 ? addFilter.join('&') : '';
      console.log(queryString);
      let res = await hit(`${isAthlete ? endpoints.getUnis : endpoints?.getAth}?page=${page}&limit=${limit}&${queryString}`, "get")
      if (res?.err) {
        AppUtils.showToast(res?.msg ?? localization?.appkeys?.Sthw)
        setSwipedAll(true);
      } else {
        if (res?.data) {
          setPage(res?.data[0]?.page)
          setTotalPages(res?.data[0]?.totalPages)
          if (res?.data[0]?.totalResults != 0) {
            setSwipedAll(false);
            setAtheleteList([])
            setAtheleteList(res?.data[0]?.results)
          } else {
            setSwipedAll(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        dispatch(setLoading(false))
        if (showGetMoreSwipes)
          setShowGetMoreSwipes(false)
        if (showCompletePopup)
          setShowCompletePopup(false)
      }, 500);
    }
  }
  const addQuery = (filters) => {
    const queryParams = [];
    if (filters?.minGPA !== null) {
      queryParams.push(`minGPA=${filters.minGPA}`);
    }

    if (filters?.maxGPA !== null) {
      queryParams.push(`maxGPA=${filters.maxGPA}`);
    }

    if (filters?.position !== null) {
      queryParams.push(`position=${filters.position}`);
    }

    if (filters?.planMajors !== null) {
      queryParams.push(`planMajors=${filters.planMajors}`);
    }

    if (filters?.gradYear !== null) {
      queryParams.push(`gradYear=${filters.gradYear}`);
    }

    if (filters?.collegeTransferringFrom !== null) {
      queryParams.push(`collegeTransferringFrom=${filters.collegeTransferringFrom}`);
    }

    return queryParams
  }
  const favActions = async (type, id) => {
    if (type[0] == "remove") {
      if (!type[1]?._id) {
        return
      }
      try {
        dispatch(setLoading(true))
        let res = await hit(`${endpoints.fav}/${type[1]?._id}`, "delete")
        if (!res?.err) {
          dispatch(getFavListThunk())
        } else {
          AppUtils.showToast(res?.msg)
        }
      } catch (error) {
      } finally {
        dispatch(setLoading(false))
      }
    } else {
      try {
        dispatch(setLoading(true))
        let res = await hit(endpoints.fav, "post", { item: id })
        if (!res?.err) {
          dispatch(getFavListThunk())
        } else {
          AppUtils.showToast(res?.msg)
        }
      } catch (error) {
      } finally {
        dispatch(setLoading(false))
      }
    }
  }
  const loadMore = async () => {
    // if ((totalResults == limit) && (page <= totalPages)) {
    if (page < totalPages) {
      getAllData(page + 1)
    }
    else {
      setSwipedAll(true);
    }
  }
  const swipeAction = async (actionType, index) => {
    let temp = [...atheleteList];
    let uId = temp[index]?._id;
    try {
      let res = await hit(actionType == "right" ? endpoints?.swipes?.right : endpoints?.swipes?.left, "post", { user: uId })
      console.log(res, 'SwipeResponse');
      if (!res?.err) {
        countingUpdate(res?.data?.count)
        let count = res?.data?.count
        if (actionType == "right") {
          if (res?.data?.swipe?.rightSwipeStatus == 1) {
            setTimeout(() => {
              navigation.navigate(AppRoutes.Recruited, { data: res?.data })
            }, 200);
          } else {
            if (!user?.isSubscribed) {
              if (count?.freeCount == 0 && !count?.isInAppPurchase) {
                setShowGetMoreSwipes(true)
                return false
              }
              if (count?.freeCount == 0 && count?.isInAppPurchase && count?.inPurchaseCount == 0) {
                setSwipeUsed(true)
                return false
              }
            }
          }
        } else {
          if (!user?.isSubscribed) {
            if (count?.freeCount == 0 && !count?.isInAppPurchase) {
              setShowGetMoreSwipes(true)
              return false
            }
            if (count?.freeCount == 0 && count?.isInAppPurchase && count?.inPurchaseCount == 0) {
              setSwipeUsed(true)
              return false
            }
          }
        }
      } else {
        AppUtils.showToast(res?.msg ?? localization?.appkeys?.Sthw)
        swiperRef.current?.swipeBack()
      }
    } catch (e) {
      console.error(e);
    } finally {

    }
  }
  const isSwipeable = () => {
    if (isAthlete) {
      // if (!checkIsSubScribedStill()) {
      //   if (todayCount >= 2) {
      //     navigation.navigate(AppRoutes.Subscription)
      //     return false
      //   }
      // } 
      if (user?.isFreeSubscription) {
        return true
      }
      if (!swipingEnabled(subFeatures)) {
        navigation.navigate(AppRoutes.Subscription)
        return false
      }
      // if (user?.sports?.length == 0) {
      //   AppUtils.showToast('Complete you profile')
      //   return false
      // }
      if (user?.isSubscribed == true) {
        return true
        // if (todayCount >= 4) {
        //   Alert.alert("Swipe Limit Reached", "You have reached your daily swipe quota. No more swiping is possible.");
        //   getAllData(1);
        //   return false
        // }
      } else {
        // if (freeSwipeCounts >= 10) {
        //   navigation.navigate(AppRoutes.Subscription)
        //   return false
        // }
        if (swipes?.freeSwipes == 0 && !swipes?.hasPurchased) {
          swiperRef.current?.swipeBack()
          setShowGetMoreSwipes(true)
          return false
        }
        if (swipes?.freeSwipes == 0 && swipes?.hasPurchased && swipes?.paidSwipes == 0) {
          swiperRef.current?.swipeBack()
          setSwipeUsed(true)
          return false
        }
      }
    }
    return true
  }
  const countingUpdate = (count) => {
    let swipes = { freeSwipes: count?.freeCount ?? 0, paidSwipes: count?.inPurchaseCount ?? 0, hasPurchased: count?.isInAppPurchase ?? false }
    dispatch(setSwipes(swipes))
    // if (config.subscriptionsMode == "BETA") {
    //   AppUtils.showLog("this is beta mode");
    // }
    // else if (user?.isFreeSubscription) {
    //   AppUtils.showLog("this is free mode");
    // }
    // else {
    //   if (isAthlete) {
    //     if (user?.isSubscribed) {
    //       increaseCount()
    //     } else {
    //       increaseCountFree()
    //     }
    //   }
    // }
  }

  return (
    <SolidView
      threeicon={true}
      logo={true}
      onPresssetting={() => {
        navigation?.navigate(AppRoutes?.Settings)
      }}
      onPressFilter={() => {
        setShowFilterModal(true)
      }}
      view={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: "center" }}>
          <SwipeFinishedModal
            visible={swipeUsed}
            closeModal={() => { setSwipeUsed(false) }}
            onClickNo={() => {
              setTimeout(() => {
                setShowGetMoreSwipes(true)
              }, 1000);
            }}
          />
          {showGetMoreSwipes && <GetSwipe
            closeModal={() => { setShowGetMoreSwipes(false) }}
            onClickNo={() => {
              // getAllData() 
            }}
          />}
          {/* <SwipeFinishedModal
            showIAP={true}
            visible={showGetMoreSwipes}
            closeModal={() => { setShowGetMoreSwipes(false) }}
            onClickNo={() => {
              // getAllData() 
            }}
          /> */}
          <CompleteProfileModal
            vis={showCompletePopup}
            onSkip={() => {
              setShowCompletePopup(false)
              dispatch(setIsDisplayed(true))
              setShowGetMoreSwipes(false)
              setSwipeUsed(false)
            }}
            onPress={() => {
              setShowCompletePopup(false)
              setShowGetMoreSwipes(false)
              setSwipeUsed(false)
              dispatch(setIsDisplayed(true))
              setTimeout(() => {
                navigation.navigate(AppRoutes.AboutUser)
              }, 40);
            }}
          />
          {!isAthlete && <FilterModal
            vis={showFilterModal}
            visOff={() => { setShowFilterModal(false) }}
            appliedFilters={(filters) => {
              setFilters(filters)
            }}
          />}
          {(!swipedAll && atheleteList?.length > 0) && < Swiper
            ref={swiperRef}
            showSecondCard={true}
            horizontalThreshold={disableSwipe ? 100 : 1800}
            stackSize={3}
            stackSeparation={0}
            cards={atheleteList}
            key={atheleteList.length}
            cardVerticalMargin={hp(2)}
            renderCard={(card) => {
              return (
                <CardBlock card={card}
                  heartPressed={(type) => {
                    favActions(type, card?._id)
                  }}
                />
              );
            }}
            onSwipedLeft={(index) => {
              if (!isSwipeable()) {
                return
              }
              swipeAction("left", index)
            }}
            onSwipedRight={(index) => {
              if (!isSwipeable()) {
                return
              }
              swipeAction("right", index)
            }}
            onSwiping={(x, y) => {
              if (user?.isSubscribed) {
                return
              }
              if (x > 0 || x < 0) {
                if (swipes?.freeSwipes == 0 && !swipes?.hasPurchased) {
                  swiperRef.current?.swipeBack()
                  setShowGetMoreSwipes(true)
                }
                if (swipes?.freeSwipes == 0 && swipes?.hasPurchased && swipes?.paidSwipes == 0) {
                  swiperRef.current?.swipeBack()
                  setSwipeUsed(true)
                }
              }
            }}
            backgroundColor={"transparent"}
            overlayOpacityHorizontalThreshold={20}
            overlayOpacityVerticalThreshold={10}
            verticalSwipe={false}
            overlayLabels={{
              left: {
                element: (
                  <View style={[styles.overlaymain, { backgroundColor: 'rgba(255, 74, 74, 0.7)' }]}>
                    <View style={styles.bgoverlayimg}>
                      <FastImage source={images.cross} style={styles.overlayimg} resizeMode="contain" />
                    </View>
                  </View>
                ),
              },
              right: {
                element: (
                  <View style={[styles.overlaymain, { backgroundColor: 'rgba(19, 180, 120, 0.7)' }]}>
                    <View style={styles.bgoverlayimg}>
                      <FastImage source={images.tick} style={styles.overlayimg} resizeMode="contain" />
                    </View>
                  </View>
                ),
              },
            }}
            onSwipedAll={() => {
              loadMore()
            }}
          />}
          {swipedAll && <View>
            <FastImage source={images.noswipe} style={{ height: hp(11), width: wp(50), alignSelf: "center" }} resizeMode="contain" />
            <Text style={{ textAlign: 'center', fontSize: 16, fontFamily: AppFonts.Medium, marginTop: 16 }} onPress={() => { user?.currentStep != 2 && navigation.navigate(AppRoutes.AboutUser) }}>{user?.currentStep == 2 ? `No swipe available right now.\nPlease try again after some time.` : `Complete your Profile.`}</Text>
          </View>
          }
        </View >
      }
    />
  );
}

const useStyles = (colors) => StyleSheet.create({
  bgoverlayimg: {
    justifyContent: "center",
    alignItems: "center",
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
  },
  overlayimg: {
    height: "60%",
    width: "60%",
  },
  overlaymain: {
    borderWidth: 4,
    borderColor: colors.white,
    height: Platform?.OS == "ios" ? hp(72) : hp(78),
    width: wp(92),
    borderRadius: 10,
    justifyContent: "center", alignItems: "center",
    alignSelf: "center",
    overflow: "hidden"
  },
  row: {
    flexDirection: 'row',
    alignItems: "center",
  },
  parent: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 20,
    alignSelf: "center",
    textAlign: "center",
    lineHeight: 25,
  },
});

export default Home;