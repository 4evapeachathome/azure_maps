// src/app/services/health-tip.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service'; // Assuming you have an ApiService for HTTP requests
import { DailyPeaceTipStore } from '../../../state/dailypeace-tip.store';
import { getConstant } from 'src/shared/constants';

@Injectable({ providedIn: 'root' })
export class DailyPeaceTipService {
  storageKey = 'previousTipIndex';
    allTips: any;
    previousTipIndex: number | undefined;

  constructor(private apiService: ApiService, private dailyPeaceTipStore: DailyPeaceTipStore) {}
 
  fetchDailyPeaceTip() {
    this.apiService.getDailyTip().subscribe(
      (response) => {
        // Check if there are any daily peace tips available
        if (response.data && response.data.length > 0) {
          const firstTip = response.data[0];
          const descriptions = firstTip.description.map((desc: { Description: string }) => desc.Description);
          this.dailyPeaceTipStore.update({
            title: firstTip.title,
            description: descriptions
          });
          this.allTips = firstTip.description.map((desc: { Description: string }) => desc);

          // Initialize previous tip index to avoid repetition
          this.dailyPeaceTipStore.update({ previousTipIndex: -1 });
          
          this.generateRandomTip();
        } else {
          this.setDefaultTip();
        }
      },
      (error) => {
        console.error('Error fetching daily peace tip:', error);
        this.setDefaultTip();
      }
    );
  }

  generateRandomTip() {
    const state = this.dailyPeaceTipStore.getValue();
    if (state.description.length === 1) {
      this.dailyPeaceTipStore.update({ currentTip: state.description[0] });
      return;
    }

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * state.description.length);
    } while (randomIndex === state.previousTipIndex);

    this.dailyPeaceTipStore.update({
      currentTip: state.description[randomIndex],
      previousTipIndex: randomIndex
    });

    console.log(`Selected random tip with index: ${randomIndex}, tip: ${state.description[randomIndex]}`);
  }

  selectDay() {
    if (this.allTips.length > 0) {
      const state = this.dailyPeaceTipStore.getValue();
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * this.allTips.length);
      } while (randomIndex === state.previousTipIndex);

      const selectedTip = this.allTips[randomIndex];
      if (selectedTip && selectedTip.Description) {
        this.dailyPeaceTipStore.update({
          currentTip: selectedTip.Description,
          previousTipIndex: randomIndex
        });

        console.log(`Selected tip with index: ${randomIndex}, tip: ${selectedTip.Description}`);
      } else {
        console.warn('Selected tip is undefined or does not have a Description property');
      }
    } else {
      console.warn('No tips available to select from');
    }
  }

  setDefaultTip() {
    const peaceTip = getConstant('HEALTH_TIPS', 'DEFAULT_TIP');
    if (peaceTip) {
      this.dailyPeaceTipStore.update({
        currentTip: peaceTip.message,
        title: peaceTip.title,
      });
    }
  }
}



