import RNFetchBlob from "rn-fetch-blob";
import AppUtils from "../../utils/appUtils";
import hit from "../Manager/manager";
import api from "../Manager/manager";
import { endpoints } from "../Services/endpoints";
import getEnvVars from "../../../env";
import { Platform } from "react-native";
import { getData } from "../../utils/asyncStore";

export const uploadImage = (imgarr) => {
  return new Promise(async (resolve, reject) => {
    try {
      let arr = [...imgarr]
      let formdata = new FormData();
      for (let i of arr) {
        if (i && i.path) {
          formdata.append('file', {
            name: Date.now() + "." + i?.mime?.split("/")[1],
            uri: i.path,
            type: i.mime,
          });
        }
      }
      let res = await hit(endpoints.uploads, "post", formdata, true);
      if (!res.err) {
        resolve(res);
      } else {
        AppUtils.showToast(res?.msg);
        reject(res?.msg);
      }
    } catch (err) {
      reject(err);
    }
  });
};
export const uploadVideos = (vidarr) => {
  return new Promise(async (resolve, reject) => {
    try {
      let formdata = new FormData();
      for (let i of vidarr) {
        formdata.append('file', {
          name: Date.now() + "." + i?.mime?.split("/")[1],
          uri: i.path,
          type: i.mime,
        });
      }
      let res = await hit(endpoints.uploadsvideo, "post", formdata, true);
      if (!res.err) {
        resolve(res);
      } else {
        AppUtils.showToast(res?.msg);
        reject(res?.msg);
      }
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};
export const uploadImagesFetchblob = async (imgarr) => {
  const tokens = await getData("@tokens");
  let accessToken = tokens?.access
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data', }
  try {
    let mediaArray = [];
    for (let i of imgarr) {
      let path = Platform?.OS == "ios" ? i?.path.replace('file://', '') : i?.path
      const mediaObject = {
        filename: Date.now() + "." + i?.mime?.split("/")[1],
        type: i.mime,
        data: decodeURIComponent(RNFetchBlob.wrap(path)),
        name: "file"
      }
      mediaArray.push(mediaObject)
    }
    console.log(mediaArray);
    let res = await RNFetchBlob.fetch('POST', (getEnvVars()?.apiUrl + endpoints.uploads), headers, mediaArray)
    console.log(res, "image uploaaaddddddddddd");
    if (res?.respInfo?.status == 200) {
      return res
    } else {
      AppUtils.showToast("Something went wrong.")
    }
  } catch (err) {
    console.log(err);
  }
}
export const uploadVideosFetchblob = async (vidarr) => {
  console.log(vidarr, "videooo upload");
  const tokens = await getData("@tokens");
  let accessToken = tokens?.access
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data', }
  try {
    let mediaArray = [];
    for (let i of vidarr) {
      let path = Platform?.OS == "ios" ? i?.path.replace('file://', '') : i?.path
      const mediaObject = {
        filename: Date.now() + "." + i?.mime?.split("/")[1],
        type: i.mime,
        data: decodeURIComponent(RNFetchBlob.wrap(path)),
        // data: RNFetchBlob.wrap(i?.path).replace('file://file:///', 'file:///'),
        name: "file"
      }
      mediaArray.push(mediaObject)
    }
    let res = await RNFetchBlob.config({ trusty: true }).fetch('POST', (getEnvVars()?.apiUrl + endpoints.uploadsvideo), headers, mediaArray)
    console.log(res, "video uploaaaddddddddddd");
    if (res?.respInfo?.status == 200) {
      return res
    } else {
      AppUtils.showToast("Something went wrong.")
    }
  } catch (err) {
    console.log(err);
  }
}
export const sendNotification = async (body) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await hit(endpoints?.notifications?.call, "post", body)
      resolve(res);
    } catch (e) {
      AppUtils.showLog("Notifications calling", e)
      reject(e);
    }
  })
}
export const conversationStarted = async (body) => {
  try {
    let res = await hit(endpoints?.swipes?.conversation, "patch", body)
    return res
  } catch (e) {
    AppUtils.showLog(e, "conversation started")
  }
}
export const getPositionSports = async (sid) => {
  try {
    let res = await hit(`${endpoints?.positions}?sportId=${sid}`, "get")
    return res
  } catch (e) {
    AppUtils.showLog(e, "Getting sports")
  }
}