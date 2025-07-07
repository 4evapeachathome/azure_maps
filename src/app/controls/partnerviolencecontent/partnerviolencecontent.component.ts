import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-partnerviolencecontent',
  templateUrl: './partnerviolencecontent.component.html',
  styleUrls: ['./partnerviolencecontent.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BreadcrumbComponent]
})
export class PartnerviolencecontentComponent  implements OnInit {

partnerviolenceimg: string='';
 contentBlocks: any[] = [];
  titleContent: any;
  titleparaContent: any;
  headingBlock: any;
paragraphBlock: any;
device:any
  @Output() loaded = new EventEmitter<void>();
  paragraphContent: any;
  constructor(
    private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,private apiService:ApiService) { 
      this.device = this.deviceService.getDeviceInfo();
    }

  ngOnInit() {
    this.getPartnerViolenceTitle();
  }

 getPartnerViolenceTitle() {
  this.apiService.getPartnerViolenceTitle().subscribe(
    (response) => {
      if (response && response.image && response.title && response.ContentBlocks) {
        this.partnerviolenceimg = response.image;
        this.titleContent = response.title;
        this.contentBlocks = response.ContentBlocks;
        this.titleparaContent = response.titleContent;

        // Extract heading and paragraph dynamically
        this.headingBlock = response.title.find((block: any) => block.type === 'heading');
        this.paragraphBlock = response.title.find((block: any) => block.type === 'paragraph');
      }
      this.loaded.emit();
    },
    (error) => {
      console.error('Error fetching partner violence content:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch partner violence data',
        'getPartnerViolenceTitle',
        APIEndpoints.partnervioencehome, // replace with actual endpoint if needed
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit();
    }
  );
}


  getHeadingLevelClass(level: number): string {
    switch (level) {
      case 1: return 'cb-headeing-1';
      case 2: return 'cb-headeing-2';
      case 3: return 'cb-headeing-3';
      default: return '';
    }
  }

}
