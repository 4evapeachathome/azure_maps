import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { getConstant } from 'src/shared/constants';
import { APIEndpoints } from 'src/shared/endpoints';


@Component({
  selector: 'pathome-wellness-tips',
  templateUrl: './wellness-tips.component.html',
  styleUrls: ['./wellness-tips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WellnessTipsComponent  implements OnInit {
  tips: { id: number; wellnesstips: string }[] = [];
  @Output() loaded = new EventEmitter<void>();
  currentTip: string = '';
  HealthTipTitle: string = '';
  HealthTipImageUrl: string = '';
  HealthytipSubtitle: string = '';
  device: any;
  allTips: any[] = [];
  private previousTipIndex: number | null = null;
  private storageKey: string = 'previousHealthTipIndex';


  constructor(   private loggingService: LoggingService,
  private deviceService:DeviceDetectorService,
    private apiService: ApiService) {
    this.device = this.deviceService.getDeviceInfo(); // Initialize device info
   }

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
        this.allTips = firstTip.description;
        this.HealthytipSubtitle = firstTip.subtitle;

        if (this.allTips && this.allTips.length > 0) {
          this.generateRandomTip();
        } else {
          this.setDefaultTip();
        }
      } else {
        this.setDefaultTip();
      }
      this.loaded.emit();
    },
    (error) => {
      console.error('Error fetching health tips:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch wellness tip',
        'fetchWellnessTip',
        APIEndpoints.healthtips, // replace with constant or string endpoint as needed
        '', // documentId left as an empty string
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.setDefaultTip();
      this.loaded.emit();
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
      this.currentTip = peaceTip.message,
      this.HealthTipTitle = peaceTip.title,
      this.HealthTipImageUrl = peaceTip.imageUrl || '',
      this.HealthytipSubtitle= peaceTip.subtitle
    }
  }
}
