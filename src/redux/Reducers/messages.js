import { createSlice } from "@reduxjs/toolkit";
import firestore from '@react-native-firebase/firestore';

const messageSlice = createSlice({
    name: 'message',
    initialState: {
        totalUnreadCount: 0
    },
    reducers: {
        setUnreadChats: (state, action) => {
            state.totalUnreadCount = action.payload;
        },
        clearUnreadCount: (state, action) => {
            state.totalUnreadCount = 0
        }
    },
});

export const { setUnreadChats, clearUnreadCount } = messageSlice.actions

export default messageSlice.reducer;

export const getChatUnreadCount = (id) => {
    return async (dispatch) => {
        firestore().collection("chats").where("userIds", "array-contains", id ?? "").onSnapshot((querySnapshot) => {
            let totalUnreadCount = 0
            let singleUnread = 0
            for (let snaps of querySnapshot.docs) {
                let data = snaps.data()
                let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
                // totalUnreadCount += unreadCount
                singleUnread += unreadCount
                if (unreadCount > 0) {
                    totalUnreadCount += 1
                }
            }
            if (totalUnreadCount == 1) {
                dispatch(setUnreadChats(singleUnread))
                return
            }
            dispatch(setUnreadChats(totalUnreadCount))
        })
    }
}