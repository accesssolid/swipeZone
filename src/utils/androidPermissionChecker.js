import { PermissionsAndroid } from "react-native";
import AppUtils from "./appUtils";

export const checkPermissionAndroid = async (permission) => {
    try {
        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
            return true;
        }
        const status = await PermissionsAndroid.request(permission);
        return status === 'granted';
    } catch (error) {
        AppUtils.showLog(error, "android permission")
    }
}