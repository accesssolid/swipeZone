// import { FlatList, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
// import React, { useCallback, useEffect, useState } from 'react'
// import { useFocusEffect, useTheme } from '@react-navigation/native';
// import AppFonts from '../../constants/fonts';
// import { hp } from '../../utils/dimension';
// import ChatInput from '../components/ChatInput';
// import ChatHeader from '../components/ChatHeader';
// import AppRoutes from '../../routes/RouteKeys/appRoutes';
// import ChatContainer from '../components/ChatContainer';
// import { useDispatch, useSelector } from 'react-redux';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
// import CustomImagePickerModal from '../modals/CustomImagePickerModal';
// import AppUtils from '../../utils/appUtils';
// import hit from '../../api/Manager/manager';
// import { endpoints } from '../../api/Services/endpoints';
// import { updateOtherUserData } from '../../redux/Reducers/call';
// import { conversationStarted } from '../../api/Services/services';
// import { getNoInteractionMatches } from '../../redux/Reducers/matches';
// import checkIsSubScribedStill from '../../utils/checkIsSubScribedStill';
// import { audioCallEnabled, chattingEnabled, videoCallEnabled } from '../../utils/SubscriptionCheck';

// const InnerChat = ({ navigation, route }) => {
//   // const { otherUserData } = route?.params;
//   const user = useSelector(state => state?.userData?.user)
//   const isAthlete = useSelector(state => state?.userData?.isAthlete)
//   const subFeatures = useSelector(state => state?.subcriptions?.features)

//   const dispatch = useDispatch()
//   const { colors, images } = useTheme();
//   const styles = UseStyles(colors);

//   const [allMessages, setAllMessages] = useState([])
//   const [message, setMessage] = useState("")
//   const [otherUser, setOtherUser] = useState(route?.params?.otherUserData ?? null)
//   const [roomId, setRoomId] = useState([user?._id, otherUser?._id].sort().join("_"))
//   const [pickType, setPickType] = useState("photo")
//   const [pickerModal, setPickerModal] = useState(false)
//   const [editingId, setEditingId] = useState("")
//   const [athelteFirstMsgSent, setAthelteFirstMsgSent] = useState(false)
//   // console.log("user?._id",user?._id)

//   const getChatRef = (room) => {
//     return firestore().collection("chats").doc(room)
//   }

//   useFocusEffect(useCallback(() => {
//     if (roomId && otherUser && user && allMessages) {
//       clearUnReadCount(roomId)
//     }
//     return () => {
//       clearUnReadCount(roomId)
//     }
//   }, [roomId, otherUser, user, allMessages]))
//   useEffect(() => {
//     if (route?.params?.otherUserData) {
//       setOtherUser(route?.params?.otherUserData)
//     }
//   }, [route?.params?.otherUserData])
//   //getting room id
//   useEffect(() => {
//     if (user?._id && otherUser?._id) {
//       setRoomId([user?._id, otherUser?._id].sort().join("_"))
//     }
//   }, [otherUser, user])
//   // get Message if have room key
//   useEffect(() => {
//     if (route?.params?.key) {
//       setRoomId(route?.params?.key);
//       getChatRef(route?.params?.key).onSnapshot(querySnapshot => {
//         let users = []
//         users = querySnapshot?._data?.users
//         let otherUser = users?.filter(x => x?._id != user?._id)
//         setOtherUser(...otherUser)
//       })
//     }
//   }, [route?.params?.key])
//   // get Message after combining roomId
//   useEffect(() => {
//     let unsub = getChatRef(roomId).collection("messages").orderBy("_id", "desc").onSnapshot((querySnapshot) => {
//       const temp = querySnapshot.docs.map((doc) => doc.data()) || [];
//       setAllMessages(temp);
//       let athMsgSent = temp?.some(msg => msg?.user?._id == user?._id)
//       if (athMsgSent) {
//         setAthelteFirstMsgSent(true)
//       } else {
//         setAthelteFirstMsgSent(false)
//       }
//     },
//       (error) => console.error(error, "getting messages"),
//     )
//     return () => {
//       unsub()
//       setAllMessages([])
//     }
//   }, [roomId])
//   const [blockedObj, setBlockedObj] = useState({
//     isBlocked: false,
//     blockedBy: ""
//   })
//   //for block functionality
//   useEffect(() => {
//     let unsub = getChatRef(roomId).onSnapshot(querySnapshot => {
//       if (querySnapshot?.exists) {
//         let data = querySnapshot?.data()
//         if (data?.isBlocked) {
//           let bObj = { isBlocked: data?.isBlocked, blockedBy: data?.blockedBy }
//           setBlockedObj(bObj)
//         } else {
//           setBlockedObj({ isBlocked: false, blockedBy: "" })
//         }
//       } else {
//         setBlockedObj({ isBlocked: false, blockedBy: "" })
//       }
//     })
//     return () => {
//       unsub()
//     }
//   }, [roomId])


//   // send message
//   const onSend = useCallback((messages = []) => {
//     const message = {
//       _id: allMessages.length,
//       text: messages[0].text,
//       type: messages[0].type ?? "text",
//       media: messages[0].media ?? "",
//       createdAt: firestore.Timestamp.now(),
//       read: 0,
//       user: {
//         _id: user?._id,
//         name: isAthlete ? user?.name : user?.fname,
//         profilePic: user?.profilePic
//       }
//     }
//     const roomData = {
//       users: [
//         { _id: user?._id, name: (!isAthlete ? user?.name : user?.fname), profilePic: user?.profilePic },
//         { _id: otherUser?._id, name: (!isAthlete ? (otherUser?.name || otherUser?.fname) : otherUser?.name), profilePic: otherUser?.profilePic },
//         //  otherUser
//       ],
//       unreadCount: {
//         [`${user?._id}`]: 0,
//         [`${otherUser?._id}`]: firestore.FieldValue.increment(1),
//       },
//       userIds: [otherUser?._id, user?._id],
//       lastMessage: message,
//     }
//     if (isAthlete && otherUser?.coaches) {
//       roomData.coaches = otherUser.coaches;
//     } else if (!isAthlete && user?.coaches) {
//       roomData.coaches = user.coaches;
//     }
//     if (!isAthlete && otherUser?.gradYear) {
//       roomData.gradYear = otherUser.gradYear;
//     } else if (isAthlete && user?.gradYear) {
//       roomData.gradYear = user.gradYear;
//     }
//     getChatRef(roomId).collection("messages").add(message)
//     getChatRef(roomId).set(roomData, { merge: true })
//     setTimeout(() => {
//       sendNotification({ userIds: [otherUser?._id], title: !isAthlete ? user?.name : user?.fname, body: messages[0].type == "image" ? "Image" : messages[0].type == "video" ? "Video" : messages[0].text.toString(), chat_id: roomId, notiType: "3" })
//     }, 200);
//     if (allMessages?.length < 2) {
//       conversationAction()
//     }
//   }, [roomId, otherUser, user, allMessages])
//   const conversationAction = async () => {
//     try {
//       let body = { userId: otherUser?._id, isConversationStarted: true }
//       let res = await conversationStarted(body)
//       if (!res?.err) {
//         dispatch(getNoInteractionMatches())
//       }
//     } catch (e) {
//       AppUtils.showLog(e, "conversation Action")
//     }
//   }
//   const uploadImage = async image => {
//     try {
//       let filename = image.path.split('/').pop();
//       const uploadUri = image.path;
//       let type = "image"
//       if (image?.mime?.split('/')[0] == "video") {
//         type = "video"
//       }
//       onSend([{ text: type == "image" ? "Image" : "Video", type, media: uploadUri }])
//       await storage().ref(filename).putFile(uploadUri);
//       const url = await storage().ref(filename).getDownloadURL();
//       updateImageURL(uploadUri, url)
//     } catch (error) {
//       AppUtils.showLog(error)
//       alert('Something went wrong while sending your image!');
//     }
//   };
//   const updateImageURL = async (path, url) => {
//     let datas = await getChatRef(roomId).collection("messages").where('media', "==", path).get()
//     datas.docs.map(doc => { getChatRef(roomId).collection("messages").doc(doc.id).update({ media: url }) })
//   }
//   const clearUnReadCount = async (roomIds) => {
//     getChatRef(roomIds).get().then(doc => {
//       let prevData = doc.data()
//       if (prevData?.unreadCount) {
//         getChatRef(roomIds).update({
//           unreadCount: {
//             [`${user?._id}`]: 0,
//             [`${otherUser?._id}`]: prevData?.unreadCount[`${otherUser?._id}`],
//           }
//         })
//       }
//     }).catch(err => {
//       AppUtils.showLog(err, "clearing unread count")
//     })

//     let querySnapshot = await getChatRef(roomIds).collection("messages").where('read', '==', 0).get()
//     let allData = querySnapshot._docs
//     let otherUserData = allData?.filter(x => x?._data?.user?._id != user?._id)
//     const batch = firestore().batch();
//     otherUserData.forEach((doc) => {
//       const documentRef = getChatRef(roomIds).collection("messages").doc(doc.id);
//       batch.update(documentRef, { read: 1 });
//     });
//     await batch.commit();
//   }
//   const sendNotification = async (body) => {
//     console.log("sendNotification", JSON.stringify(body))
//     try {
//       let res = await hit(endpoints?.notifications?.noti, "post", body)
//       console.log("sendNotification res", res)
//     } catch (e) {
//       AppUtils.showLog(e, "notification chat")
//     }
//   }
//   const findId = (type, item) => {
//     getChatRef(roomId).collection("messages").where("_id", "==", item?._id).get().then((reqData) => {
//       let temp = reqData?._docs
//       if (type == "delete" && temp.length > 0) {
//         deleteAction(temp[0]?.id)
//       }
//       if (type == "edit") {
//         setEditingId(temp[0]?.id)
//         setMessage(item?.text)
//       }
//     }).catch(err => AppUtils.showLog(err, "delete message"))
//   }
//   const deleteAction = async (id) => {
//     getChatRef(roomId).collection("messages").doc(id).set({
//       status: 0,
//       updatedAt: firestore.Timestamp.now()
//     }, { merge: true })
//   }
//   const editAction = async (txt, id) => {
//     setEditingId("")
//     setMessage("")
//     getChatRef(roomId).collection("messages").doc(id).set({
//       text: txt,
//       updatedAt: firestore.Timestamp.now()
//     }, { merge: true }).catch(err => AppUtils.showLog(err, "edit message"))
//   }

//   const renderItem = ({ item, index }) => {
//     return <ChatContainer item={item} index={index}
//       pressAction={(type) => {
//         findId(type, item)
//       }}
//     />
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <CustomImagePickerModal
//         visible={pickerModal}
//         mediaType={pickType}
//         pressHandler={() => { setPickerModal(false) }}
//         attachments={(img) => {
//           uploadImage(img)
//         }}
//       />
//       <ChatHeader
//         onBackPress={() => navigation.navigate(AppRoutes.BottomTab, { screen: AppRoutes.Chat })}
//         userdata={otherUser}
//         onVideoCallPress={() => {
//           // if (isAthlete && !checkIsSubScribedStill()) {
//           //   navigation.navigate(AppRoutes.Subscription)
//           //   return
//           // }
//           if (isAthlete && !videoCallEnabled(subFeatures)) {
//             navigation.navigate(AppRoutes.Subscription)
//             return
//           }
//           dispatch(updateOtherUserData(otherUser))
//           setTimeout(() => {
//             navigation.navigate(AppRoutes.VideoCall)
//           }, 200);
//         }}
//         roomId={roomId}
//         onVoiceCallPress={() => {
//           // if (isAthlete && !checkIsSubScribedStill()) {
//           //   navigation.navigate(AppRoutes.Subscription)
//           //   return
//           // }
//           if (isAthlete && !audioCallEnabled(subFeatures)) {
//             navigation.navigate(AppRoutes.Subscription)
//             return
//           }
//           dispatch(updateOtherUserData(otherUser))
//           setTimeout(() => {
//             navigation.navigate(AppRoutes.Call, { otherUserData: otherUser })
//           }, 200);
//         }}
//       />
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform?.OS == "ios" ? "padding" : null}>
//         <ImageBackground source={images.orangegrad} style={{ flex: 1 }}>
//           <FlatList
//             data={allMessages}
//             keyExtractor={(item) => item?._id?.toString()}
//             renderItem={renderItem}
//             inverted={true}
//             showsVerticalScrollIndicator={false}
//           />
//         </ImageBackground>
//         {isAthlete && !blockedObj?.isBlocked && (!athelteFirstMsgSent &&
//           <View style={{ marginBottom: 10 }}>
//             <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
//               <TouchableOpacity onPress={() => {
//                 if (isAthlete && !chattingEnabled(subFeatures)) {
//                   AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
//                   navigation.navigate(AppRoutes.Subscription)
//                   return
//                 }
//                 // if (isAthlete && !checkIsSubScribedStill()) {
//                 //   navigation.navigate(AppRoutes.Subscription)
//                 //   return
//                 // }
//                 onSend([{ text: "Hi Coach" }])
//               }} style={{ height: 30, marginRight: 10, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 }}>
//                 <Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Hi <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
//               <TouchableOpacity onPress={() => {
//                 if (isAthlete && !chattingEnabled(subFeatures)) {
//                   AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
//                   navigation.navigate(AppRoutes.Subscription)
//                   return
//                 }
//                 // if (isAthlete && !checkIsSubScribedStill()) {
//                 //   navigation.navigate(AppRoutes.Subscription)
//                 //   return
//                 // }
//                 onSend([{ text: "Thanks for the match coach" }])
//               }} style={{ height: 30, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center", flex: 1 }}><Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Thanks for the match <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
//             </View>
//             <TouchableOpacity onPress={() => {
//               // if (isAthlete && !checkIsSubScribedStill()) {
//               //   navigation.navigate(AppRoutes.Subscription)
//               //   return
//               // }
//               if (isAthlete && !chattingEnabled(subFeatures)) {
//                 AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
//                 navigation.navigate(AppRoutes.Subscription)
//                 return
//               }
//               onSend([{ text: "Looking forward to connecting coach" }])
//             }} style={{ height: 30, marginHorizontal: 20, borderColor: colors.primary, marginTop: 5, alignSelf: "center", paddingHorizontal: 10, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center" }}><Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Looking forward to connecting <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
//           </View>)}
//         {blockedObj?.isBlocked ?
//           <Text style={{ textAlign: "center", color: colors.text, fontFamily: AppFonts.MediumIta, fontSize: 16 }}>You can't reply to this conversation.</Text>
//           :
//           <ChatInput
//             val={message}
//             editMode={editingId == "" ? false : true}
//             onChangeText={t => setMessage(t)}
//             onPressSend={() => {
//               // if (isAthlete && !checkIsSubScribedStill()) {
//               //   navigation.navigate(AppRoutes.Subscription)
//               //   return
//               // }
//               if (isAthlete && !chattingEnabled(subFeatures)) {
//                 AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
//                 navigation.navigate(AppRoutes.Subscription)
//                 return
//               }
//               if (message.trim() == "") {
//                 return
//               }
//               if (editingId != "") {
//                 editAction(message, editingId)
//                 return
//               }
//               setMessage("")
//               onSend([{ text: message }])
//             }}
//             onPressCancel={() => {
//               setEditingId("")
//               setMessage("")
//             }}
//             onPressAttach={(type) => {
//               setPickType(type)
//               setPickerModal(true)
//             }}
//           />}
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   )
// }

// export default InnerChat

// const UseStyles = (colors) => StyleSheet.create({
//   chatfont: {
//     fontFamily: AppFonts.Regular,
//     fontSize: 12,
//     color: colors.black,
//   },
//   chatItem: {
//     marginBottom: hp(3),
//     padding: 10,
//     borderRadius: 10,
//     maxWidth: "90%",
//   },
// })

import { FlatList, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AppFonts from '../../constants/fonts';
import { hp } from '../../utils/dimension';
import ChatInput from '../components/ChatInput';
import ChatHeader from '../components/ChatHeader';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import ChatContainer from '../components/ChatContainer';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import CustomImagePickerModal from '../modals/CustomImagePickerModal';
import AppUtils from '../../utils/appUtils';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import { updateOtherUserData } from '../../redux/Reducers/call';
import { conversationStarted } from '../../api/Services/services';
import { getNoInteractionMatches } from '../../redux/Reducers/matches';
import checkIsSubScribedStill from '../../utils/checkIsSubScribedStill';
import { audioCallEnabled, chattingEnabled, videoCallEnabled } from '../../utils/SubscriptionCheck';

const InnerChat = ({ navigation, route }) => {
  // const { otherUserData } = route?.params;
  const user = useSelector(state => state?.userData?.user)
  const isAthlete = useSelector(state => state?.userData?.isAthlete)
  const subFeatures = useSelector(state => state?.subcriptions?.features)

  const dispatch = useDispatch()
  const { colors, images } = useTheme();
  const styles = UseStyles(colors);

  const [allMessages, setAllMessages] = useState([])
  const [message, setMessage] = useState("")
  const [otherUser, setOtherUser] = useState(route?.params?.otherUserData ?? null)

  const [roomId, setRoomId] = useState([user?._id, otherUser?._id].sort().join("_"))
  const [pickType, setPickType] = useState("photo")
  const [pickerModal, setPickerModal] = useState(false)
  const [editingId, setEditingId] = useState("")
  const [athelteFirstMsgSent, setAthelteFirstMsgSent] = useState(false)

  const getChatRef = (room) => {
    return firestore().collection("chats").doc(room)
  }

  useFocusEffect(useCallback(() => {
    if (roomId && otherUser && user && allMessages) {
      clearUnReadCount(roomId)
    }
    return () => {
      clearUnReadCount(roomId)
    }
  }, [roomId, otherUser, user, allMessages]))
  useEffect(() => {
    if (route?.params?.otherUserData) {
      setOtherUser(route?.params?.otherUserData)
    }
  }, [route?.params?.otherUserData])
  //getting room id
  useEffect(() => {
    if (user?._id && otherUser?._id) {
      setRoomId([user?._id, otherUser?._id].sort().join("_"))
    }
  }, [otherUser, user])
  // get Message if have room key
  useEffect(() => {
    if (route?.params?.key) {
      setRoomId(route?.params?.key);
      getChatRef(route?.params?.key).onSnapshot(querySnapshot => {
        let users = []
        users = querySnapshot?._data?.users
        let otherUser = users?.filter(x => x?._id != user?._id)
        setOtherUser(...otherUser)
      })
    }
  }, [route?.params?.key])
  // get Message after combining roomId
  useEffect(() => {
    let unsub = getChatRef(roomId).collection("messages").orderBy("_id", "desc").onSnapshot((querySnapshot) => {
      const temp = querySnapshot.docs.map((doc) => doc.data()) || [];
      setAllMessages(temp);
      let athMsgSent = temp?.some(msg => msg?.user?._id == user?._id)
      if (athMsgSent) {
        setAthelteFirstMsgSent(true)
      } else {
        setAthelteFirstMsgSent(false)
      }
    },
      (error) => console.error(error, "getting messages"),
    )
    return () => {
      unsub()
      setAllMessages([])
    }
  }, [roomId])
  const [blockedObj, setBlockedObj] = useState({
    isBlocked: false,
    blockedBy: ""
  })
  //for block functionality
  useEffect(() => {
    let unsub = getChatRef(roomId).onSnapshot(querySnapshot => {
      if (querySnapshot?.exists) {
        let data = querySnapshot?.data()
        if (data?.isBlocked) {
          let bObj = { isBlocked: data?.isBlocked, blockedBy: data?.blockedBy }
          setBlockedObj(bObj)
        } else {
          setBlockedObj({ isBlocked: false, blockedBy: "" })
        }
      } else {
        setBlockedObj({ isBlocked: false, blockedBy: "" })
      }
    })
    return () => {
      unsub()
    }
  }, [roomId])


  // send message
  const onSend = useCallback((messages = []) => {
    const message = {
      _id: allMessages.length,
      text: messages[0].text,
      type: messages[0].type ?? "text",
      media: messages[0].media ?? "",
      createdAt: firestore.Timestamp.now(),
      read: 0,
      user: {
        _id: user?._id,
        name: isAthlete ? user?.name : user?.fname,
        profilePic: user?.profilePic
      }
    }
    const roomData = {
      users: [
        { _id: user?._id, name: (!isAthlete ? user?.name : user?.fname), profilePic: user?.profilePic },
        { _id: otherUser?._id, name: (!isAthlete ? (otherUser?.name || otherUser?.fname) : otherUser?.name), profilePic: otherUser?.profilePic },
        //  otherUser
      ],
      unreadCount: {
        [`${user?._id}`]: 0,
        [`${otherUser?._id}`]: firestore.FieldValue.increment(1),
      },
      userIds: [otherUser?._id, user?._id],
      lastMessage: message,
    }
    if (isAthlete && otherUser?.coaches) {
      roomData.coaches = otherUser.coaches;
    } else if (!isAthlete && user?.coaches) {
      roomData.coaches = user.coaches;
    }
    if (!isAthlete && otherUser?.gradYear) {
      roomData.gradYear = otherUser.gradYear;
    } else if (isAthlete && user?.gradYear) {
      roomData.gradYear = user.gradYear;
    }
    getChatRef(roomId).collection("messages").add(message)
    getChatRef(roomId).set(roomData, { merge: true })
    setTimeout(() => {
      sendNotification({ userIds: [otherUser?._id], title: !isAthlete ? user?.name : user?.fname, body: messages[0].type == "image" ? "Image" : messages[0].type == "video" ? "Video" : messages[0].text.toString(), chat_id: roomId, notiType: "3" })
    }, 200);
    if (allMessages?.length < 2) {
      conversationAction()
    }
  }, [roomId, otherUser, user, allMessages])
  const conversationAction = async () => {
    try {
      let body = { userId: otherUser?._id, isConversationStarted: true }
      let res = await conversationStarted(body)
      if (!res?.err) {
        dispatch(getNoInteractionMatches())
      }
    } catch (e) {
      AppUtils.showLog(e, "conversation Action")
    }
  }
  const uploadImage = async image => {
    try {
      let filename = image.path.split('/').pop();
      const uploadUri = image.path;
      let type = "image"
      if (image?.mime?.split('/')[0] == "video") {
        type = "video"
      }
      onSend([{ text: type == "image" ? "Image" : "Video", type, media: uploadUri }])
      await storage().ref(filename).putFile(uploadUri);
      const url = await storage().ref(filename).getDownloadURL();
      updateImageURL(uploadUri, url)
    } catch (error) {
      AppUtils.showLog(error)
      alert('Something went wrong while sending your image!');
    }
  };
  const updateImageURL = async (path, url) => {
    let datas = await getChatRef(roomId).collection("messages").where('media', "==", path).get()
    datas.docs.map(doc => { getChatRef(roomId).collection("messages").doc(doc.id).update({ media: url }) })
  }
  const clearUnReadCount = async (roomIds) => {
    getChatRef(roomIds).get().then(doc => {
      let prevData = doc.data()
      if (prevData?.unreadCount) {
        getChatRef(roomIds).update({
          unreadCount: {
            [`${user?._id}`]: 0,
            [`${otherUser?._id}`]: prevData?.unreadCount[`${otherUser?._id}`],
          }
        })
      }
    }).catch(err => {
      AppUtils.showLog(err, "clearing unread count")
    })

    let querySnapshot = await getChatRef(roomIds).collection("messages").where('read', '==', 0).get()
    let allData = querySnapshot._docs
    let otherUserData = allData?.filter(x => x?._data?.user?._id != user?._id)
    const batch = firestore().batch();
    otherUserData.forEach((doc) => {
      const documentRef = getChatRef(roomIds).collection("messages").doc(doc.id);
      batch.update(documentRef, { read: 1 });
    });
    await batch.commit();
  }
  const sendNotification = async (body) => {
    try {
      let res = await hit(endpoints?.notifications?.noti, "post", body)
    } catch (e) {
      AppUtils.showLog(e, "notification chat")
    }
  }
  const findId = (type, item) => {
    getChatRef(roomId).collection("messages").where("_id", "==", item?._id).get().then((reqData) => {
      let temp = reqData?._docs
      if (type == "delete" && temp.length > 0) {
        deleteAction(temp[0]?.id)
      }
      if (type == "edit") {
        setEditingId(temp[0]?.id)
        setMessage(item?.text)
      }
    }).catch(err => AppUtils.showLog(err, "delete message"))
  }
  const deleteAction = async (id) => {
    getChatRef(roomId).collection("messages").doc(id).set({
      status: 0,
      updatedAt: firestore.Timestamp.now()
    }, { merge: true })
  }
  const editAction = async (txt, id) => {
    setEditingId("")
    setMessage("")
    getChatRef(roomId).collection("messages").doc(id).set({
      text: txt,
      updatedAt: firestore.Timestamp.now()
    }, { merge: true }).catch(err => AppUtils.showLog(err, "edit message"))
  }

  const renderItem = ({ item, index }) => {
    return <ChatContainer item={item} index={index}
      pressAction={(type) => {
        findId(type, item)
      }}
    />
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomImagePickerModal
        visible={pickerModal}
        mediaType={pickType}
        pressHandler={() => { setPickerModal(false) }}
        attachments={(img) => {
          uploadImage(img)
        }}
      />
      <ChatHeader
        onBackPress={() => navigation.navigate(AppRoutes.BottomTab, { screen: AppRoutes.Chat })}
        userdata={otherUser}
        onVideoCallPress={() => {
          // if (isAthlete && !checkIsSubScribedStill()) {
          //   navigation.navigate(AppRoutes.Subscription)
          //   return
          // }
          if (isAthlete && !videoCallEnabled(subFeatures)) {
            navigation.navigate(AppRoutes.Subscription)
            return
          }
          dispatch(updateOtherUserData(otherUser))
          setTimeout(() => {
            navigation.navigate(AppRoutes.VideoCall)
          }, 200);
        }}
        roomId={roomId}
        onVoiceCallPress={() => {
          // if (isAthlete && !checkIsSubScribedStill()) {
          //   navigation.navigate(AppRoutes.Subscription)
          //   return
          // }
          if (isAthlete && !audioCallEnabled(subFeatures)) {
            navigation.navigate(AppRoutes.Subscription)
            return
          }
          dispatch(updateOtherUserData(otherUser))
          setTimeout(() => {
            navigation.navigate(AppRoutes.Call, { otherUserData: otherUser })
          }, 200);
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform?.OS == "ios" ? "padding" : null}>
        <ImageBackground source={images.orangegrad} style={{ flex: 1 }}>
          <FlatList
            data={allMessages}
            keyExtractor={(item) => item?._id?.toString()}
            renderItem={renderItem}
            inverted={true}
            showsVerticalScrollIndicator={false}
          />
        </ImageBackground>
        {isAthlete && !blockedObj?.isBlocked && (!athelteFirstMsgSent &&
          <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
              <TouchableOpacity onPress={() => {
                if (isAthlete && !chattingEnabled(subFeatures)) {
                  AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
                  navigation.navigate(AppRoutes.Subscription)
                  return
                }
                // if (isAthlete && !checkIsSubScribedStill()) {
                //   navigation.navigate(AppRoutes.Subscription)
                //   return
                // }
                onSend([{ text: "Hi Coach" }])
              }} style={{ height: 30, marginRight: 10, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 }}>
                <Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Hi <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (isAthlete && !chattingEnabled(subFeatures)) {
                  AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
                  navigation.navigate(AppRoutes.Subscription)
                  return
                }
                // if (isAthlete && !checkIsSubScribedStill()) {
                //   navigation.navigate(AppRoutes.Subscription)
                //   return
                // }
                onSend([{ text: "Thanks for the match coach" }])
              }} style={{ height: 30, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center", flex: 1 }}><Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Thanks for the match <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => {
              // if (isAthlete && !checkIsSubScribedStill()) {
              //   navigation.navigate(AppRoutes.Subscription)
              //   return
              // }
              if (isAthlete && !chattingEnabled(subFeatures)) {
                AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
                navigation.navigate(AppRoutes.Subscription)
                return
              }
              onSend([{ text: "Looking forward to connecting coach" }])
            }} style={{ height: 30, marginHorizontal: 20, borderColor: colors.primary, marginTop: 5, alignSelf: "center", paddingHorizontal: 10, borderWidth: 1, borderRadius: 10, justifyContent: "center", alignItems: "center" }}><Text style={{ color: colors.text, fontSize: 12, fontFamily: AppFonts.Regular }}>Looking forward to connecting <Text style={{ fontFamily: AppFonts.SemiBold }}>coach</Text></Text></TouchableOpacity>
          </View>)}
        {blockedObj?.isBlocked ?
          <Text style={{ textAlign: "center", color: colors.text, fontFamily: AppFonts.MediumIta, fontSize: 16 }}>You can't reply to this conversation.</Text>
          :
          <ChatInput
            val={message}
            editMode={editingId == "" ? false : true}
            onChangeText={t => setMessage(t)}
            onPressSend={() => {
              // if (isAthlete && !checkIsSubScribedStill()) {
              //   navigation.navigate(AppRoutes.Subscription)
              //   return
              // }
              if (isAthlete && !chattingEnabled(subFeatures)) {
                AppUtils.showToast("Subscribe to a paid version now to connect with your matches!")
                navigation.navigate(AppRoutes.Subscription)
                return
              }
              if (message.trim() == "") {
                return
              }
              if (editingId != "") {
                editAction(message, editingId)
                return
              }
              setMessage("")
              onSend([{ text: message }])
            }}
            onPressCancel={() => {
              setEditingId("")
              setMessage("")
            }}
            onPressAttach={(type) => {
              setPickType(type)
              setPickerModal(true)
            }}
          />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default InnerChat

const UseStyles = (colors) => StyleSheet.create({
  chatfont: {
    fontFamily: AppFonts.Regular,
    fontSize: 12,
    color: colors.black,
  },
  chatItem: {
    marginBottom: hp(3),
    padding: 10,
    borderRadius: 10,
    maxWidth: "90%",
  },
})