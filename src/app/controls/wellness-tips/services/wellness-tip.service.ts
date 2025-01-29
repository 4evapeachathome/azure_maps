// src/app/services/wellness-tip.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '..//../../services/api.service';
import { WellnessTipStore } from '../../../state/wellness-tip.store';
import { tap } from 'rxjs/operators';
import { getConstant } from 'src/shared/constants';

@Injectable({ providedIn: 'root' })
export class WellnessTipService {
  storageKey = 'previousTipIndex';

  constructor(private apiService: ApiService, private wellnessTipStore: WellnessTipStore) {}

  fetchWellnessTip() {
    this.apiService.getWellnessTip().pipe(
      tap(response => {
        if (response && response.length > 0) {
          const firstTip = response[0];
          this.wellnessTipStore.update({
            title: firstTip.title,
            subtitle: firstTip.subtitle,
            imageUrl: firstTip.image,
            description: firstTip.description.map((desc: { Description: string }) => desc.Description),
            previousTipIndex: -1 // Initialize previousTipIndex to avoid repetition
          });
          this.generateRandomTip();
        } else {
          this.setDefaultTip();
        }
      })
    ).subscribe();
  }

  generateRandomTip() {
    const state = this.wellnessTipStore.getValue();
    if (state.description.length === 1) {
      this.wellnessTipStore.update({ currentTip: state.description[0] });
      return;
    }

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * state.description.length);
    } while (randomIndex === state.previousTipIndex);

    this.wellnessTipStore.update({
      currentTip: state.description[randomIndex],
      previousTipIndex: randomIndex
    });

    console.log(`Selected random tip with index: ${randomIndex}, tip: ${state.description[randomIndex]}`);
  }


  setDefaultTip() {
    const peaceTip = getConstant('DAILY_PEACE_TIPS', 'DEFAULT_TIP');
    if (peaceTip) {
      this.wellnessTipStore.update({
        currentTip: peaceTip.message,
        title: peaceTip.title,
        imageUrl: peaceTip.imageUrl || '',
        subtitle: peaceTip.subtitle
      });
    }
  }
}