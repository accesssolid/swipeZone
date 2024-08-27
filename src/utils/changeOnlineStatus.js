import firestore from "@react-native-firebase/firestore";
import { store } from "../redux/Store/store";

const changeOnlineStatus = async (value) => {
    let user = store?.getState().userData?.user
    if (user?._id) {
        firestore().collection("onlines").doc(user?._id).set({ online: value, id: user?._id })
            .catch(e => console.log(e))
    }
}

export default changeOnlineStatus;