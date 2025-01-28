import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { getConstant } from 'src/shared/constants';

@Component({
  selector: 'pathome-wellness-tips',
  templateUrl: './wellness-tips.component.html',
  styleUrls: ['./wellness-tips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WellnessTipsComponent  implements OnInit {
  tips: { id: number; wellnesstips: string }[] = [];
  currentTip: string = '';
  Healthsubtitle: string = '';
  HealthTipTitle: string = '';
  HealthTipImageUrl: string = '';
  allTips: any[] = [];
  private previousTipIndex: number | null = null;
  private storageKey: string = 'previousHealthTipIndex';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    const storedIndex = localStorage.getItem(this.storageKey);
    this.previousTipIndex = storedIndex ? parseInt(storedIndex, 10) : null;
    this.fetchWellnessTip();
  }

  

  fetchWellnessTip() {
    this.apiService.getWellnessTip().subscribe(
      (response) => {
        if (response && response.length > 0) {
          const firstTip = response[0];
          this.HealthTipTitle = firstTip.title;
          this.HealthTipImageUrl = firstTip.image;
          this.Healthsubtitle = firstTip.subtitle;
          this.allTips = firstTip.description;
          
          if (this.allTips && this.allTips.length > 0) {
            this.generateRandomTip();
          } else {
            this.setDefaultTip();
          }
        } else {
          this.setDefaultTip();
        }
      },
      (error) => {
        console.error('Error fetching health tips:', error);
        this.setDefaultTip();
      }
    );
  }


  generateRandomTip() {
    if (this.allTips.length === 1) {
      this.currentTip = this.allTips[0].Description;
      return;
    }

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.allTips.length);
    } while (randomIndex === this.previousTipIndex);
    
    const randomTip = this.allTips[randomIndex];
    this.currentTip = randomTip.Description;
    this.previousTipIndex = randomIndex;

    
    localStorage.setItem(this.storageKey, randomIndex.toString());
  }

  setDefaultTip() {
    const peaceTip = getConstant('DAILY_PEACE_TIPS', 'DEFAULT_TIP');
    if (peaceTip) {
      this.currentTip = peaceTip.message;
      this.HealthTipTitle = peaceTip.title;
      this.HealthTipImageUrl = peaceTip.imageUrl || '';
      this.Healthsubtitle = peaceTip.subtitle;
    }
  }



}
