import { createSlice } from '@reduxjs/toolkit';

export const completeProfile = createSlice({
    name: 'completeProfile',
    initialState: {
        isDisplayed: false
    },
    reducers: {
        setIsDisplayed: (state, action) => {
            state.isDisplayed = action.payload;
        },
    },
});

export const { setIsDisplayed } = completeProfile.actions;

export default completeProfile.reducer;