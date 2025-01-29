import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface DailyPeaceTipState {
  title: string;
  description: string[];
  currentTip: string;
  previousTipIndex: number | null;
}

export function createInitialState(): DailyPeaceTipState {
  return {
    title: '',
    description: [],
    currentTip: '',
    previousTipIndex: null
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'dailyPeaceTip' })
export class DailyPeaceTipStore extends Store<DailyPeaceTipState> {
  constructor() {
    super(createInitialState());
  }
}