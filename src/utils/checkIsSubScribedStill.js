import moment from "moment"
const subTypes = {
    "monthly": "monthly",
    "yearly": "yearly"
}
import { store } from '../redux/Store/store'
const checkIsSubScribedStill = () => {
    let user = store.getState()?.userData?.user
    if (user?.isSubscribed) {
        let subDate = moment(user?.subscribeDate)
        // console.log(subDate.format("YYYY-MM-DD"))
        if (user?.subType == subTypes.monthly) {
            if (subDate.add(30, "day").toDate() > moment().toDate()) {
                return false
            }
            return true
        } else {
            return true
        }
    } else {
        return false
    }
}

export default checkIsSubScribedStill