import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { LoggingService } from 'src/app/services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-peaceathome',
  templateUrl: './peaceathome.component.html',
  styleUrls: ['./peaceathome.component.scss'],
  standalone: true,
      imports: [CommonModule, IonicModule, BreadcrumbComponent]
})
export class PeaceathomeComponent  implements OnInit {
 peaceathomeImg: string='';
 contentBlocks: any[] = [];
  titleContent: any;
  headingBlock: any;
  device:any;
  paragraphBlock: any;
   @Output() loaded = new EventEmitter<void>();
  constructor(private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,
    private apiService:ApiService) { 
      this.device = this.deviceService.getDeviceInfo();
    }

  ngOnInit() {
    this.getPeaceAtHome();
  }

  getHeadingLevelClass(level: number): string {
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }

  getPeaceAtHome() {
  this.apiService.getPeaceAtHome().subscribe(
    (response) => {
      if (response && response.image && response.title && response.ContentBlocks) {
        this.peaceathomeImg = response.image;
        this.titleContent = response.title;
        this.contentBlocks = response.ContentBlocks;

        // Dynamically extract heading & paragraph blocks
        this.headingBlock = response.title.find((block: any) => block.type === 'heading');
        this.paragraphBlock = response.title.find((block: any) => block.type === 'paragraph');

        this.loaded.emit();
      }
    },
    (error) => {
      console.error('Error fetching peace at home:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch peace at home content',
        'getPeaceAtHome',
        APIEndpoints.peaceathome, // Replace with actual endpoint constant if applicable
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
