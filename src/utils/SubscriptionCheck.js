import { config } from "../../config"
import { store } from "../redux/Store/store"

const getFeature = (arr, key) => {
    let type = arr?.filter(x => x?._id?.toString() == key)
    if (type?.length > 0) {
        return type?.[0]
    }
}

export const editingProfileAndHighlights = (data) => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        let key = isSubscribed ? "658d2fe6de61864f69b54bcb" : "658d2e30de61864f69b54bc9"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}
export const chattingEnabled = (data) => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        let key = isSubscribed ? "64cb6ffab427e476b3d45bb1" : "64cb6ffab427e476b3d45bb2"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}
export const audioCallEnabled = (data) => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        let key = isSubscribed ? "64cb6ffab427e476b3d45bb3" : "658d2e30de61864f69b54bc7"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}
export const videoCallEnabled = (data) => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        let key = isSubscribed ? "658d2fe6de61864f69b54bca" : "658d2e30de61864f69b54bc8"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}
export const swipingEnabled = (data) => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        let key = isSubscribed ? "64cb6ffab427e476b3d45bab" : "64cb6ffab427e476b3d45baa"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}
export const szsResources = () => {
    if (config.subscriptionsMode == "BETA") {
        return true
    } else {
        let isFreeSubscription = store.getState()?.userData?.user?.isFreeSubscription
        if (isFreeSubscription) {
            return true
        }
        let isSubscribed = store.getState()?.userData?.user?.isSubscribed
        const data = store.getState()?.subcriptions?.features
        if (!isSubscribed) {
            return false
        }
        let key = "658d2fe6de61864f69b54bcc"
        if (getFeature(data, key)?.isAvailable) {
            return true
        } else {
            return false
        }
    }
}