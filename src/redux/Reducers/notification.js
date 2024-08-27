import { createSlice } from "@reduxjs/toolkit";
import { notifications } from "../services/endpoints";
import { endpoints } from "../../api/Services/endpoints";
import hit from "../../api/Manager/manager";
import { getNoInteractionMatches } from "./matches";

const notificationSlice = createSlice({
    name: "notification",
    initialState: { list: [] },
    reducers: {
        setNotifications: (state, action) => {
            state.list = action.payload
        }
    }
})

export const { setNotifications, setNotiLoad } = notificationSlice.actions

export const getAllNotifications = () => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints.notifications?.noti, "get")
            if (res?.data) {
                dispatch(setNotifications(res?.data))
                dispatch(getNoInteractionMatches())
            }
        } catch (err) {
            console.error(err)
        } finally {
        }
    }
}

export default notificationSlice.reducer