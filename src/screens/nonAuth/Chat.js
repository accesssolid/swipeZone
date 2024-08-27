import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import SolidView from '../components/SolidView'
import { LocalizationContext } from '../../localization/localization';
import { useTheme } from '@react-navigation/native';
import ChatBlock from '../components/ChatBlock';
import AppRoutes from '../../routes/RouteKeys/appRoutes';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import AppFonts from '../../constants/fonts';

const Chat = ({ navigation }) => {
  const user = useSelector(state => state?.userData?.user)

  const { colors, images } = useTheme();
  const styles = useStyles(colors);
  const { localization } = useContext(LocalizationContext);
  const [chatList, setChatList] = useState([])

  useEffect(() => {
    let unsub = firestore().collection("chats").where("userIds", "array-contains", user?._id ?? "").onSnapshot(
      (querySnapshot) => {
        let users = []
        for (let snaps of querySnapshot.docs) {
          let data = snaps.data()
          let otherUser = data?.users?.filter(x => x?._id != user?._id)
          let unreadCount = data?.unreadCount ? data?.unreadCount[user?._id] : 0
          let coaches = data?.coaches
          let gradYear = data?.gradYear
          if (otherUser?.length == 1) {
            users.push({ user: otherUser[0], lastMessage: data?.lastMessage, unreadCount: unreadCount, coaches, gradYear })
          }
        }
        users.sort((a, b) => b.lastMessage?.createdAt?.seconds - a.lastMessage?.createdAt?.seconds)
        setChatList(users)
      },
      (error) => console.error(error)
    )
    return () => {
      unsub()
    }
  }, [user])

  return (
    <SolidView
      title={localization.appkeys.Chats}
      view={
        <FlatList
          data={chatList}
          contentContainerStyle={{ paddingBottom: 50, flex: 1 }}
          renderItem={({ item, index }) => {
            return (
              <ChatBlock
                item={item}
                index={index}
                onPress={() =>
                  navigation.navigate(AppRoutes.NonAuthStack, { screen: AppRoutes.InnerChat, params: { otherUserData: item?.user } })
                }
              />
            );
          }}
          ListEmptyComponent={() => {
            return (<Text style={{ textAlign: "center", fontSize: 18, marginTop: 18, fontFamily: AppFonts.Black, color: colors.text }}>No data found.</Text>)
          }}
          ItemSeparatorComponent={() => {
            return (
              <View style={{ width: "95%" }}>
                <View style={styles.seperator}></View>
              </View>
            );
          }}
        />
      }
    />
  )
}

export default Chat

const useStyles = (colors) => StyleSheet.create({
  seperator: {
    width: "75%",
    alignSelf: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
})