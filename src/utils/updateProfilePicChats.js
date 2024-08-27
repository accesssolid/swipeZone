import firestore from '@react-native-firebase/firestore';
import AppUtils from './appUtils';

export const updateProfilePicChats = async (user) => {
    let isAthlete = user?.role == "athelete" ? true : false
    try {
        let allChats = await firestore().collection("chats").where("userIds", "array-contains", user?._id ?? "").get()
        for (let doc of allChats.docs) {
            let data = doc.data()
            let users = data?.users
            users = users.filter(x => x?._id != user?._id)
            let temp = { _id: user?._id, name: !isAthlete ? user?.name : user?.fname, profilePic: user?.profilePic }
            users.push(temp)
            let changeData = { users: users, }
            if (user?.coaches?.length > 0) {
                changeData = { ...changeData, coaches: user?.coaches }
            }
            firestore().collection("chats").doc(doc.id).set(changeData, { merge: true })
        }
    } catch (e) {
        AppUtils.showLog(e, "while updating pofilepic chats")
    }
}