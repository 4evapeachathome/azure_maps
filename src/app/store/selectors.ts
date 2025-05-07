import {  createSelector } from "@ngrx/store"
import { ItemState } from "./reducers";
import { AppState } from "./store";
 

const feature = (state: AppState) => state.item;

export const itemSelector = createSelector(
  feature,
  (state: ItemState) => state.items
);