export const endpoints = {
    default_pic: "public/user.png",

    //uploading media
    uploads: "/uploads",
    uploadsvideo: "/uploads/video",

    // auth
    checkuser: "/auth/check-user",
    login: "/auth/login",
    registerAthelete: "/auth/register/athelete",
    registerUni: "/auth/register/uni",
    sociallogin: "/auth/social-login",
    forgotpassword: "/auth/forgot-password",
    verifyotp: "/auth/check-otp",
    resetpassword: "/auth/reset-password",
    logout: "/auth/logout",

    updateself: "/users/self",  //users update
    user: "/users",
    deleteSelf: "/users/deleteSelf",  //delete account
    deactivateacc: "/users/self/deactivate",  //deactivate account

    getUnis: "/ath/unis", //get universities for athelete

    getAth: "/uni/aths", //get atheletes for university

    fav: "/favs",  //favs

    faqs: "/faqs",  //faqs

    //swipes
    swipes: {
        matches: "/swipes/matches",
        left: "/swipes/left",
        right: "/swipes/right",
        getCount: "/swipes/getCount",
        conversation: "/swipes/conversation",
    },

    //notifications
    notifications: {
        noti: "/notifications",
        delete: "/notifications/del",
        call: "/notifications/call",
    },

    blocks: "/blocks",  //block

    allTerms: "/adminMisc", //t&c,policy,about

    contactus: "/supports", //contact us

    ps: "/ps", //sports and majors

    positions: "/positions", //sports positions

    subFeatures: "/subscriptions/features",

    updateSubscription: "/users/updateSubscription",

    checkSubscription: "users/getSubscription",

    iapProducts: "users/plans",

    purchaseProduct: "users/purchasePlan",

    createAgoraToken: "users/create_agora_token"
}
