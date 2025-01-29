import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface WellnessTipState {
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string[];
  currentTip: string;
  previousTipIndex: number | null;
}

export function createInitialState(): WellnessTipState {
  return {
    title: '',
    subtitle: '',
    imageUrl: '',
    description: [],
    currentTip: '',
    previousTipIndex: null
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'wellnessTip' })
export class WellnessTipStore extends Store<WellnessTipState> {
  constructor() {
    super(createInitialState());
  }
}