import { create } from 'apisauce';
import { config, Mode } from '../../../config';
import getEnvVars from '../../../env';
import AppUtils from '../../utils/appUtils';
import { getData } from '../../utils/asyncStore';

export const api = create({
  baseURL: getEnvVars().apiUrl,
  timeout: 20000,
});

// api.addAsyncRequestTransform(request => async () => {
//   const tokens = await getData("@tokens");
//   let accessToken = tokens?.access
//   if (accessToken) {
//     request.headers['Authorization'] = `Bearer ${accessToken.token}`;
//   }
// });

// const naviMonitor = response => AppUtils.showLog('Api Response ==> ', response);
// config.mode == Mode.DEV && api.addMonitor(naviMonitor);

const hit = async (endpoint = "", method = "GET", body = {}, isUpload = false, axiosConfig = {}) => {
  let x = ""
  const tokens = await getData("@tokens");
  let accessToken = tokens?.access
  // console.log(accessToken,"accessToken");
  if (accessToken) {
    api.setHeader('Authorization', `bearer ${accessToken.token}`);
  }
  if (isUpload === true) {
    api.setHeader('Content-Type', 'multipart/form-data');
  } else {
    api.setHeader('Content-Type', 'application/json');
  }

  switch (method.toLowerCase()) {
    case "get":
      x = await api.get(endpoint, body)
      break
    case "post":
      x = await api.post(endpoint, body)
      break
    case "patch":
      x = await api.patch(endpoint, body)
      break
    case "delete":
      x = await api.delete(endpoint, body)
      break
    case "put":
      x = await api.put(endpoint, body)
      break
  }
  switch (x.problem) {
    case null:
      return { err: false, data: x.data, status: x.status }
    case "CLIENT_ERROR":
      return { err: true, msg: x.data.message, status: x.status }
    case "SERVER_ERROR":
      return { err: true, msg: "SERVER_ERROR", status: x.status }
    default:
      return { err: true, msg: x.problem, status: x.status }
  }
}

export default hit;
