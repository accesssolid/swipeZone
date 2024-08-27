import { createSlice } from "@reduxjs/toolkit";
import hit from "../../api/Manager/manager";
import { endpoints } from "../../api/Services/endpoints";

const subcriptionsSlice = createSlice({
    name: "subcriptions",
    initialState: {
        features: [],
        subPlans: [],
        allFeatures: {
            paid: [],
            free: []
        },
        iapProducts: []
    },
    reducers: {
        setSubPlans: (state, action) => {
            state.subPlans = action.payload
        },
        setSubFeatures: (state, action) => {
            state.features = action.payload
        },
        clearSubFeatures: (state, action) => {
            state.features = []
        },
        updateFeatureList: (state, action) => {
            state.allFeatures = action.payload
        },
        setIapProducts: (state, action) => {
            state.iapProducts = action.payload
        },
    }
})

export const { setSubFeatures, clearSubFeatures, setSubPlans, updateFeatureList, setIapProducts } = subcriptionsSlice.actions

export default subcriptionsSlice.reducer

export const getSubFeatures = (user) => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints?.subFeatures, "post", { type: user?.isSubscribed ? "1" : "0" })
            if (!res?.err) {
                dispatch(setSubFeatures(res?.data))
            }
        } catch (err) {
            console.error(err)
        } finally {
        }
    }
}
export const getAllPlans = (user) => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints?.iapProducts, "get")
            if (!res?.err) {
                dispatch(setIapProducts(res?.data?.data))
            }
        } catch (err) {
            console.error(err)
        } finally {
        }
    }
}