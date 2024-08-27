import { createSlice } from "@reduxjs/toolkit";

const appstateSlice = createSlice({
    name: "appstate",
    initialState: {
        appstate: false
    },
    reducers: {
        updateAppstate: (state, action) => {
            state.appstate = action.payload
        },
    }
})

export const { updateAppstate } = appstateSlice.actions

export default appstateSlice.reducer