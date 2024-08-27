import { createSlice } from "@reduxjs/toolkit";

const loadSlice = createSlice({
    name: "load",
    initialState: { isLoading: false },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload
        }
    }
})

export const { setLoading } = loadSlice.actions

export default loadSlice.reducer