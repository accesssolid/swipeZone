import getEnvVars from '../../env';

export const mediaurl = (url) => {
    return getEnvVars().fileUrl + url
}