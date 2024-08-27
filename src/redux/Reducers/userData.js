import { createSlice } from '@reduxjs/toolkit';
import { strings } from '../../constants/variables';
import { clearAll, getData } from '../../utils/asyncStore';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';
import changeOnlineStatus from '../../utils/changeOnlineStatus';
import { clearNoInteractions } from './matches';
import { setSwipes } from './swipes';
const initialStateAuth = {
    user: null,
    auth: false,
    token: "",
}
const userDataSlice = createSlice({
    name: 'userData',
    initialState: {
        auth: false,
        user: {},
        appLanguage: strings.english,
        isAthlete: true
    },
    reducers: {
        authorize: (state, action) => {
            state.auth = true
            state.user = action.payload.user
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        SetAppLanguage: (state, action) => {
            state.appLanguage = action.payload;
        },
        setIsAthlete: (state, action) => {
            state.isAthlete = action.payload;
        },
        signout: (state, action) => {
            return initialStateAuth
        }
    },
});
export const { setAuth, setUser, authorize, setToken, SetAppLanguage, setIsAthlete, signout } = userDataSlice.actions;

export default userDataSlice.reducer;

export const logoutThunk = () => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints.updateself, "patch", { fcmToken: "" })
            changeOnlineStatus(false)
            dispatch(clearNoInteractions())
            clearAll()
            dispatch(signout({}))
        } catch (err) {
            console.error(err)
        } finally {
            dispatch(signout({}))
        }
    }
}
export const getUserDetailThunk = () => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints.updateself, "get")
            if (res.data) {
                dispatch(setUser(res.data))
                let swipes = { freeSwipes: res?.data?.freeCount ?? 0, paidSwipes: res?.data?.inPurchaseCount ?? 0, hasPurchased: res?.data?.isInAppPurchase ?? false }
                dispatch(setSwipes(swipes))
            }
        } catch (err) {
            console.error(err)
        }
    }
}