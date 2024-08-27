import { createSlice } from "@reduxjs/toolkit";
import { endpoints } from "../../api/Services/endpoints";
import hit from "../../api/Manager/manager";

const dropslice = createSlice({
    name: "droplist",
    initialState: {
        sports: [
            { name: "Men's Baseball", data: [{ name: "RHP" }, { name: "LHP" }, { name: "C" }, { name: "1B" }, { name: "2B" }, { name: "3B" }, { name: "SS" }, { name: "OF" }] },
            { name: "Men's Football", data: [{ name: "Oline" }, { name: "QB" }, { name: "RB" }, { name: "WR" }, { name: "TE" }, { name: "ATH" }, { name: "Dline" }, { name: "DE" }, { name: "OLB" }, { name: "ILB" }, { name: "CB" }, { name: "S" }, { name: "K" }, { name: "P" }, { name: "LS" }] },
            { name: "Men's Basketball", data: [{ name: "PG" }, { name: "SG" }, { name: "SF" }, { name: "PF" }, { name: "C" },] },
            { name: "Women's Basketball", data: [{ name: "PG" }, { name: "SG" }, { name: "SF" }, { name: "PF" }, { name: "C" },] },
            { name: "Men's Soccer", data: [{ name: "Goalie" }, { name: "Defense" }, { name: "Mid" }, { name: "Forward" },] },
            { name: "Women's Soccer", data: [{ name: "Goalie" }, { name: "Defense" }, { name: "Mid" }, { name: "Forward" },] },
            { name: "Women's Softball", data: [{ name: "RHP" }, { name: "LHP" }, { name: "C" }, { name: "1B" }, { name: "2B" }, { name: "3B" }, { name: "SS" }, { name: "OF" }] },
            { name: "Men's Lacrosse ", data: [{ name: "Attack" }, { name: "Mid" }, { name: "Defender" }, { name: "Goalie" }] },
            { name: "Women's Volleyball", data: [{ name: "S" }, { name: "MB" }, { name: "OH" }, { name: "OPP" }, { name: "L" }, { name: "DS" },] },
        ],
        height: [
            { name: "5ft 07in" }, { name: "5ft 08in" }, { name: "5ft 09in" }, { name: "5ft 10in" }, { name: "5ft 11in" }
        ],
        majors: ['Agricultural Science', 'Architecture', 'Art', 'Business management', 'Communications', 'Computer Science', 'Criminal Justice', 'Film', 'Economics', 'Education', 'Global Studies', 'Engineering', 'Graphic Design', 'History', 'Kinesiology', 'Sports Management', 'Nursing', 'Religious Studies', 'Political Science', 'Law', 'Other']
    },
    reducers: {
        updateSportList: (state, action) => {
            state.sports = action.payload
        },
        updatePositionList: (state, action) => {
            state.positions = action.payload
        },
        updateHeightList: (state, action) => {
            state.height = action.payload
        },
        updateMajorsList: (state, action) => {
            state.majors = action.payload
        }
    }
})

export const { updateSportList, updatePositionList, updateHeightList, updateMajorsList } = dropslice.actions

export default dropslice.reducer

export const getSportListThunk = () => {
    return async (dispatch) => {
        const getPosition = (i) => {
            let data = []
            if (i?.includes("Baseball")) {
                data = [{ name: "RHP" }, { name: "LHP" }, { name: "C" }, { name: "1B" }, { name: "2B" }, { name: "3B" }, { name: "SS" }, { name: "OF" }]
            } else if (i?.includes("Basketball")) {
                data = [{ name: "PG" }, { name: "SG" }, { name: "SF" }, { name: "PF" }, { name: "C" },]
            } else if (i?.includes("Volleyball")) {
                data = [{ name: "S" }, { name: "MB" }, { name: "OH" }, { name: "OPP" }, { name: "L" }, { name: "DS" },]
            } else if (i?.includes("Soccer")) {
                data = [{ name: "Goalie" }, { name: "Defense" }, { name: "Mid" }, { name: "Forward" },]
            } else if (i?.includes("Softball")) {
                data = [{ name: "RHP" }, { name: "LHP" }, { name: "C" }, { name: "1B" }, { name: "2B" }, { name: "3B" }, { name: "SS" }, { name: "OF" }]
            } else if (i?.includes("Lacrosse")) {
                data = [{ name: "Attack" }, { name: "Mid" }, { name: "Defender" }, { name: "Goalie" }]
            } else if (i?.includes("Football")) {
                data = [{ name: "Oline" }, { name: "QB" }, { name: "RB" }, { name: "WR" }, { name: "TE" }, { name: "ATH" }, { name: "Dline" }, { name: "DE" }, { name: "OLB" }, { name: "ILB" }, { name: "CB" }, { name: "S" }, { name: "K" }, { name: "P" }, { name: "LS" }]
            }
            let temp = { name: i, data }
            return temp
        }
        try {
            let res = await hit(`${endpoints.ps}`, "get")
            // console.log(res);
            if (res.data) {
                let sortedArr = res?.data?.reduce((arr, item) => {
                    if (item?.type == 0) {
                        // arr?.sports?.push(getPosition(item?.name))
                        arr.sports?.push(item)
                    }
                    if (item?.type == 1) {
                        arr?.majors?.push(item?.name)
                    }
                    return arr;
                }, { sports: [], majors: [] })
                dispatch(updateSportList(sortedArr?.sports))
                dispatch(updateMajorsList(sortedArr?.majors?.sort()))
            }
        } catch (err) {
            console.error(err)
        }
    }
}