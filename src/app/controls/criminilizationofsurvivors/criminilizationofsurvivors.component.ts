import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-criminilizationofsurvivors',
  templateUrl: './criminilizationofsurvivors.component.html',
  styleUrls: ['./criminilizationofsurvivors.component.scss'],
      imports: [CommonModule, IonicModule]
  
})
export class CriminilizationofsurvivorsComponent  implements OnInit {
  contentBlocks: any[] = [];
  webImages: any[] = [];
  isLoaded: boolean = false;
  firstGroupBlocks:any;
  secondGroupBlocks:any;
  device:any;
  @Output() loaded = new EventEmitter<void>();

  constructor(private apiService:ApiService,
              private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,

  ) { 
    this.device = this.deviceService.getDeviceInfo();
  }

  ngOnInit() {
    this.criminilizationofSurvivor();
  }

  criminilizationofSurvivor() {
  this.apiService.getCriminalizationOfSurvivors().subscribe(
    (data) => {
      if (data) {
        this.contentBlocks = data.contentBlock;
        this.webImages = data.imageList;

        const startIndexOfC = this.contentBlocks.findIndex(
          block =>
            block.type === 'heading' &&
            block.children?.[0]?.text?.trim()?.startsWith('C. ')
        );

        // If found, split into two groups
        if (startIndexOfC !== -1) {
          this.firstGroupBlocks = this.contentBlocks.slice(0, startIndexOfC);
          this.secondGroupBlocks = this.contentBlocks.slice(startIndexOfC);
        } else {
          // fallback if "C." heading not found
          this.firstGroupBlocks = this.contentBlocks;
          this.secondGroupBlocks = [];
        }

        this.loaded.emit();
        this.isLoaded = true;
      }
    },
    (error) => {
      console.error('Error loading getCriminalizationOfSurvivors API data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load criminalization of survivors data',
        'loadTypesOfAbuse',
        APIEndpoints.criminalizationOfSurvivors, // replace with actual endpoint or string if needed
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit();
    }
  );
}

  getImageUrl(index: number): string {
    return this.webImages?.[index]?.fullUrl || '';
  }


}
