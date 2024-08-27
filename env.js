import { config, Mode } from "./config";

const env = {
    development: {
      apiUrl: config.devUrl,
      fileUrl: config.devFileurl,
      stripeKey:config.devStripeKey,
      googleMapKey:config.googleMapKey
    },
    production: {
      apiUrl: config.prodUrl,
      fileUrl: config.prodFileUrl,
      stripeKey:config.prodStripeKey,
      googleMapKey:config.googleMapKey
    },
  };

  
  const getEnvVars = () => {
    if (config.mode === Mode.DEV) {
      return env.development;
    } else if (config.mode === Mode.PROD) {
      return env.production;
    }
  };
  
  export default getEnvVars;
  