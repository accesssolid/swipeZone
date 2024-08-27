import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name: "call",
    initialState: {
        hasIncomingCall: 0,
        callData: null,
        otherUserData: null,
    },
    reducers: {
        setHasIncomingCall: (state, action) => {
            state.hasIncomingCall = action.payload
        },
        updateCallData: (state, action) => {
            state.callData = action.payload
        },
        updateOtherUserData: (state, action) => {
            state.otherUserData = action.payload
        },
        clearCallData: (state, action) => {
            state.otherUserData = null,
                state.callData = null,
                state.hasIncomingCall = 2
        }
    }
})

export const { updateCallData, updateOtherUserData, clearCallData, setHasIncomingCall } = callSlice.actions

export default callSlice.reducer