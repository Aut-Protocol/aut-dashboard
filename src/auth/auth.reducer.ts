import { AutID } from "@api/aut.model";
import { CacheModel } from "@api/cache.api";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import { getMemberPhases } from "@utils/beta-phases";

export interface AuthState {
  isAuthenticated: boolean;
  userInfo: any;
  userAddress: string;
  cache: CacheModel;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userAddress: null,
  userInfo: null,
  cache: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action) {
      const { isAuthenticated, userInfo, cache } = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.userInfo = userInfo;
      state.cache = cache;
    },
    setUserAddress(state, action) {
      state.userAddress = action.payload;
    },
    resetAuthState: () => initialState
  }
});

export const { setAuthenticated, setUserAddress, resetAuthState } =
  authSlice.actions;

export const userInfo = (state) => state.auth.userInfo as AutID;
export const UserInfo = createSelector([userInfo], (a) => a);
export const isAuthenticated = (state) => state.auth.isAuthenticated as boolean;
export const IsAuthenticated = createSelector([isAuthenticated], (a) => a);
export const userPhasesCache = (state) => state.auth.cache as CacheModel;
export const UserPhasesCache = createSelector([userPhasesCache], (a) => a);

function getQuestDates(startDate: Date) {
  const { phaseOneStartDate, phaseTwoEndDate } = getMemberPhases(startDate);

  const questStartDateOffset = 30 * 60 * 1000; // 2 hours in milliseconds

  const questStartDate = new Date(
    phaseOneStartDate.getTime() + questStartDateOffset
  );
  const questEndDate = phaseTwoEndDate;

  return {
    questStartDate,
    questEndDate
  };
}

function questDurationInDays(startDate: Date) {
  const { questStartDate, questEndDate } = getQuestDates(startDate);

  const durationInMilliseconds: number =
    questEndDate.getTime() - questStartDate.getTime();
  const durationInDays: number = durationInMilliseconds / (24 * 60 * 60 * 1000);

  return Number(durationInDays.toFixed(2));
}

function questDurationInHours(startDate: Date) {
  const { questStartDate, questEndDate } = getQuestDates(startDate);

  const durationInMilliseconds: number =
    questEndDate.getTime() - questStartDate.getTime();
  const durationInHours: number = durationInMilliseconds / (60 * 60 * 1000);

  return Math.ceil(durationInHours);
}

export const QuestDates = createSelector([userPhasesCache], (cache) => {
  const startDate = cache?.createdAt || new Date();
  const { questEndDate, questStartDate } = getQuestDates(startDate);
  return {
    startDate: questEndDate,
    endDate: questStartDate,
    durationInHours: questDurationInHours(startDate),
    durationInDays: questDurationInDays(startDate)
  };
});

export default authSlice.reducer;
