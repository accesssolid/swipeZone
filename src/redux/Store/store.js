import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, Middleware } from "redux";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import userData from "../Reducers/userData";
import userCred from "../Reducers/userCred";
import load from "../Reducers/load";
import signup from "../Reducers/signup";
import droplist from "../Reducers/dropdownlist";
import favs from "../Reducers/favs";
import appstate from "../Reducers/appstate";
import notification from "../Reducers/notification";
import call from "../Reducers/call";
import message from "../Reducers/messages";
import matches from "../Reducers/matches";
import subcriptions from "../Reducers/subcriptions"
import completeProfile from "../Reducers/completeProfile";
import swipes from "../Reducers/swipes";

const reducers = combineReducers({
  userData,
  load,
  signup,
  droplist,
  favs,
  appstate,
  notification,
  call,
  userCred,
  message,
  matches,
  subcriptions,
  completeProfile,
  swipes
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["userData", "userCred"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    return middlewares;
  },
});
store.subscribe(() => {
  // console.log("Store", store.getState())
});
const persistor = persistStore(store);
export { store, persistor };
