import { sensitiveData } from "./src/constants/Sensitive/sensitiveData";

export const Mode = {
  PROD: "PROD",
  DEV: "DEV",
};
export const SubscriptionsMode = {
  BETA: "BETA",
  PROD: "PROD",
  DEV: "DEV",
};

export const config = {
  mode: Mode.DEV,
  //Development
  devUrl: sensitiveData.devApiUrl,
  devFileurl: sensitiveData.devFileUrl,

  // Production
  prodUrl: sensitiveData.devApiUrl,
  prodFileUrl: sensitiveData.devFileUrl,

  subscriptionsMode: SubscriptionsMode.PROD,

  //GoogleMapKey
  googleMapKey: "",
};
