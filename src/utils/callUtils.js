import hit from "../api/Manager/manager";
import { endpoints } from "../api/Services/endpoints";
import { sensitiveData } from "../constants/Sensitive/sensitiveData";
import AppUtils from "./appUtils";
// 2d516e6115c2417f8595691428be245e
const getCallToken = async (uid) => {
    try {
        let res = await hit(endpoints?.createAgoraToken, "post", { channel_name: uid })
        return res
    } catch (e) {
        AppUtils.showLog(e, "generating agora token")
    }
}
// const getCallToken = async (uid) => {
//     return new Promise(async function (resolve, reject) {
//         const requestOptions = { method: 'GET', redirect: 'follow' };
//         fetch(`http://solidappmaker.ml/projects/php/agora_server_token/?appID=${sensitiveData?.agoraAppId}&appCertificate=${sensitiveData?.agograAppCertificate}&channelName=${uid}&uid=0`, requestOptions)
//             .then(response => response.json())
//             .then(async response => {
//                 resolve(response)
//             })
//             .catch(error => {
//                 reject(error)
//             });
//     })
// }
export default getCallToken;