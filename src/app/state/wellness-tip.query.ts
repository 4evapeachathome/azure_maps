// src/app/state/wellness-tip.query.ts
import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { WellnessTipStore, WellnessTipState } from './wellness-tip.store';

@Injectable({ providedIn: 'root' })
export class WellnessTipQuery extends Query<WellnessTipState> {
  title$ = this.select(state => state.title);
  subtitle$ = this.select(state => state.subtitle);
  imageUrl$ = this.select(state => state.imageUrl);
  description$ = this.select(state => state.description);
  currentTip$ = this.select(state => state.currentTip);

  constructor(protected override store: WellnessTipStore) {
    super(store);
  }
}