import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-abusesgallery',
  templateUrl: './abusesgallery.component.html',
  styleUrls: ['./abusesgallery.component.scss'],
    standalone: true,
      imports: [CommonModule, IonicModule, RouterModule]
  
})
export class AbusesgalleryComponent  implements OnInit {
  abuseGallery: any[] = [];
  title:any;
  device:any;
  @Output() loaded = new EventEmitter<void>();

  constructor(private apiService: ApiService,private loggingService:LoggingService,private router: Router, private deviceService:DeviceDetectorService) {
    this.device = this.deviceService.getDeviceInfo();
    // Initialize abuseGallery with an empty array
  }

  ngOnInit() {
    this.loadTypesOfAbuse();
  }

  navigateAbuse(section: string): void {
  this.router.navigate(['/typesofabuse'], {
    queryParams: { section }
  });
}

  loadTypesOfAbuse() {
  this.apiService.getTypesOfAbuse().subscribe({
    next: (data: any) => {
      if (data && data.AbuseGallery) {
        this.abuseGallery = data.AbuseGallery;
        this.title = data.title;
      }
      this.loaded.emit(); // Emit after success
    },
    error: (err: any) => {
      console.error('Error loading types of abuse:', err);

      const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load types of abuse',       // Activity Type
        'loadTypesOfAbuse',                    // Function Name
        APIEndpoints.typesOfAbuse,             // API Endpoint (use your constant if defined)
        '',   // Document ID or relevant param
        errorMessage,                          // Error Message
        err?.status,                           // HTTP Status
        this.device                            // Device info
      );

      this.loaded.emit(); // Emit even if there's an error
    }
  });
}



}
