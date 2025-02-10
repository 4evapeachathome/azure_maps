import { Action, ActionReducer } from "@ngrx/store";
import { ItemEffects } from "./effects";
import { itemReducer, ItemState } from "./reducers";


export interface AppState {
  item: ItemState
}

export interface AppStore {
  item: ActionReducer<ItemState, Action>;
}

export const appStore: AppStore = {
  item: itemReducer
}

export const appEffects = [ItemEffects];
