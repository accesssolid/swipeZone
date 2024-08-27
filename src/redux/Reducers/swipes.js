import { createSlice } from "@reduxjs/toolkit";

const swipes = createSlice({
    name: 'swipes',
    initialState: {
        swipes: {
            freeSwipes: 0,
            paidSwipes: 0,
            hasPurchased: false
        }
    },
    reducers: {
        setSwipes: (state, action) => {
            state.swipes = action.payload
        },
        onSwipeAction: (state, action) => {
            state.swipes = action.payload
        }
    }
})

export const { setSwipes, onSwipeAction } = swipes.actions

export default swipes.reducer