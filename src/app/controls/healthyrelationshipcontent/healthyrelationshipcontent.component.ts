import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  selector: 'pathome-healthyrelationshipcontent',
  templateUrl: './healthyrelationshipcontent.component.html',
  styleUrls: ['./healthyrelationshipcontent.component.scss'],
   standalone: true,
        imports: [CommonModule, IonicModule, RouterModule]
})
export class HealthyrelationshipcontentComponent  implements OnInit {
  content: any[] = [];
 @Input() isBtnVisible: boolean = false;
 @Input() endpoint: string='';
 device:any;
 @Input() routerLink: string | string[] = [];
 @Output() loaded = new EventEmitter<void>();
  constructor(private apiService:ApiService,private loggingService: LoggingService,
    private deviceService:DeviceDetectorService) { 
      this.device = this.deviceService.getDeviceInfo();
    }

  ngOnInit() {
    this.getHealthyRelationshipContent(this.endpoint);
  }

  getHealthyRelationshipContent(endpoint: string) {
  this.apiService.getHealthyRelationShipContent(endpoint).subscribe(
    (response) => {
      if (response?.data?.length > 0) {
        // Keep all paragraphs, including empty ones
        this.content = response.data[0].content;
      }
      this.loaded.emit(); // Emit the loaded event after fetching data
    },
    (error) => {
      console.error('Error fetching healthy relationship data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to fetch healthy relationship content',
        'getHealthyRelationshipContent',
        endpoint,
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
