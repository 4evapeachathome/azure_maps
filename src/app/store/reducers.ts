import { createReducer, on } from '@ngrx/store';
import { Item } from './item.model';
import * as ItemActions from './actions';

export interface ItemState {
items: Item[];
loading: boolean;
error: string;
}
export const initialState: ItemState = {
items: [],
loading: false,
error: ''
};
export const itemReducer = createReducer(
initialState,

on(ItemActions.loadItems, state => ({ ...state, loading: true })),

on(ItemActions.loadItemsSuccess, (state, { items }) =>({ ...state, items, loading: false })),

on(ItemActions.loadItemsFailure, (state, { error }) => ({ ...state, error, loading: false })),

on(ItemActions.addItem, (state, { item }) => ({ ...state, items: [...state.items, item] })),

on(ItemActions.updateItem, (state, { item }) => ({ ...state, items: state.items.map(t => t.id === item.id ? item : t) })),

on(ItemActions.deleteItem, (state, { id }) => ({ ...state, items: state.items.filter(t => t.id !== id) })),
);