import analytics from "@react-native-firebase/analytics";

export const USEREVENTS = {
    'iap': 'in_app_purchase_more_swipes',
    'subscription': 'full_subscription',
    'register': 'onboard_started',
    'profileCompleted': 'onboard_completed',
    'onboardStarted': 'onboard_started_',
    'athleteSelected': 'athlete_selected_',
    'universitySelected': 'university_selected_',
    'nextbuttonselected': 'next_button_one_selected_',
    'skipselected': 'skip_selected_',
    'nextselected': 'next_selected_',
    'reminderPromptSkipSelected': 'reminder_prompt_skip_selected_',
    'reminderPromptCompleteNowSelected': 'reminder_prompt_complete_now_selected_',
    'onboardingComplete': 'onboarding_complete_',
    'pnCompletingProfileOpen': 'pn_completing_profile_open_',
    'pnNewCoachesOpen': 'pn_new_coaches_open_',
    'pnNewAthleteOpen': 'pn_new_athlete_open_',
    'coachesLogin': 'coaches_login_',
}

// const userAnalytics = (eventKey, data) => {
//     console.log("eventKey", eventKey)
//     console.log("eventdata", data)
//     return
//     try {
//         if (data) {
//             analytics().logEvent(eventKey, data)
//         } else {
//             analytics().logEvent(eventKey)
//         }
//     } catch (e) {
//         console.error(e);
//     } finally {
//         console.log(eventKey, "Analytics");
//     }
// }


const eventsWithPlatform = [
    USEREVENTS.onboardStarted,
    USEREVENTS.athleteSelected,
    USEREVENTS.universitySelected,
    USEREVENTS.nextbuttonselected,
    USEREVENTS.skipselected,
    USEREVENTS.nextselected,
    USEREVENTS.reminderPromptSkipSelected,
    USEREVENTS.reminderPromptCompleteNowSelected,
    USEREVENTS.onboardingComplete,
    USEREVENTS.pnCompletingProfileOpen,
    USEREVENTS.pnNewCoachesOpen,
    USEREVENTS.pnNewAthleteOpen,
    USEREVENTS.coachesLogin,
    // Add any other events here that require platform-specific keys
];
const userAnalytics = (eventKey, data) => {
    const eventKeyWithPlatform = eventsWithPlatform.includes(eventKey)
        ? `${eventKey}${Platform.OS}`
        : eventKey;

    console.log("eventKey", eventKeyWithPlatform);
    console.log("eventdata", data);
    // return;
    try {
        if (data) {
            analytics().logEvent(eventKeyWithPlatform, data);
        } else {
            analytics().logEvent(eventKeyWithPlatform);
        }
    } catch (e) {
        console.error(e);
    } finally {
        console.log(eventKeyWithPlatform, "Analytics");
    }
}

export default userAnalytics;