import { Injectable } from '@angular/core';
import { Query, Store } from '@datorama/akita';
import { DailyPeaceTipState, DailyPeaceTipStore } from './dailypeace-tip.store';

@Injectable({ providedIn: 'root' })
export class DailyPeaceTipQuery extends Query<DailyPeaceTipState> {
  title$ = this.select(state => state.title);
  description$ = this.select(state => state.description);
  currentTip$ = this.select(state => state.currentTip);

  constructor(protected override store: DailyPeaceTipStore) {
    super(store);
  }
}