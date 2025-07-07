import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'pathome-peace-harmony',
  templateUrl: './peace-harmony.component.html',
  styleUrls: ['./peace-harmony.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,RouterModule]
})
export class PeaceHarmonyComponent  implements OnInit {
title: any;
description:any;
image:any;
device:any;
@Output() loaded = new EventEmitter<void>();

  constructor(private apiService:ApiService,
  private loggingService: LoggingService,
  private deviceService:DeviceDetectorService,
     private menuService:MenuService) {
      this.device = this.deviceService.getDeviceInfo(); 
      }

  ngOnInit() {
    this.getExpertAdviceData();
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

 getExpertAdviceData() {
  this.apiService.getExpertAdvice().subscribe(
    (response) => {
      if (response && response.length > 0) {
        const firstBanner = response[0];

        this.title = firstBanner.title || ''; 
        this.description = firstBanner.description || '';
        this.image = firstBanner.image || ''; 
        this.loaded.emit();
      } else {
        console.warn('No data found in the response.');
        this.title = '';
        this.description = '';
        this.image = '';
        this.loaded.emit();
      }
    },
    (error) => {
      console.error('Error fetching expert advice data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch expert advice content',
        'getExpertAdviceData',
        APIEndpoints.expertadvice, // Replace with the actual endpoint string or constant
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit();
    }
  );
}


}
