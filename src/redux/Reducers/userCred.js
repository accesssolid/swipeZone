import { createSlice } from '@reduxjs/toolkit';

const userCredSlice = createSlice({
    name: 'userCred',
    initialState: {
        credList: [],
        hasAccount: false
    },
    reducers: {
        setUserCred: (state, action) => {
            state.credList = action.payload;
        },
        setUserHasCred: (state, action) => {
            state.hasAccount = action.payload;
        },
        clearCreds: (state, action) => {
            state.credList = []
        }
    },
});

export const { setUserCred, clearCreds, setUserHasCred } = userCredSlice.actions;

export default userCredSlice.reducer;