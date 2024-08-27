import { createSlice } from "@reduxjs/toolkit";

const signupSlice = createSlice({
    name: "signup",
    initialState: { signupdata: {} },
    reducers: {
        setSignupdata: (state, action) => {
            state.signupdata = action.payload
        },
        clearSignupdata: (state, action) => {
            state.signupdata = {}
        }
    }
})

export const { setSignupdata, clearSignupdata } = signupSlice.actions

export default signupSlice.reducer