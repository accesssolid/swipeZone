import { createSlice } from '@reduxjs/toolkit';
import hit from '../../api/Manager/manager';
import { endpoints } from '../../api/Services/endpoints';

export const favSlice = createSlice({
    name: 'favs',
    initialState: {
        favList: []
    },
    reducers: {
        setFavList: (state, action) => {
            state.favList = action.payload;
        },
    },
});

export const { setFavList } = favSlice.actions;

export default favSlice.reducer;

export const getFavListThunk = () => {
    return async (dispatch) => {
        try {
            let res = await hit(endpoints.fav, "get")
            if (res.data) {
                let temp = res.data.filter(x => x?.item != null) ?? []
                dispatch(setFavList(temp))
            }
        } catch (err) {
            console.error(err)
        }
    }
}