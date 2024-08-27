import { createSlice } from "@reduxjs/toolkit";
import hit from "../../api/Manager/manager";
import { endpoints } from "../../api/Services/endpoints";

const matchesSlice = createSlice({
    name: 'matches',
    initialState: {
        noInteractionMatches: 0
    },
    reducers: {
        setNoInteractions: (state, action) => {
            state.noInteractionMatches = action.payload;
        },
        clearNoInteractions: (state, action) => {
            state.noInteractionMatches = 0
        }
    },
});

export const { setNoInteractions, clearNoInteractions } = matchesSlice.actions

export default matchesSlice.reducer;

export const getNoInteractionMatches = () => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints.swipes?.getCount, "get")
            if (res?.data) {
                dispatch(setNoInteractions(res?.data?.totalResults))
            }
        } catch (err) {
            console.error(err)
        } finally {
        }
    }
}