import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-unhealthyrelationexample',
  templateUrl: './unhealthyrelationexample.component.html',
  styleUrls: ['./unhealthyrelationexample.component.scss'],
  standalone: true,
          imports: [CommonModule, IonicModule],
})
export class UnhealthyrelationexampleComponent  implements OnInit {
 title:string = '';
 description:string= '';
 content:any;
 device:any
 @Output() loaded = new EventEmitter<void>();
  constructor(
       private loggingService: LoggingService,
  private deviceService:DeviceDetectorService,
    private apiService: ApiService) {
    this.device = this.deviceService.getDeviceInfo(); // Initialize device info
     }

  ngOnInit() {
    this.loadunhealthyrelationexampledate();
  }

  loadunhealthyrelationexampledate() {
  this.apiService.getunhealthyrelationexample().subscribe( 
    (res: any) => {
      if (res) {
        this.title = res.Title;
        this.description = res.Description;
        this.content = res.content;
      }
      this.loaded.emit(); // Emit the loaded event after fetching data
    },
    (error) => {
      console.error('Error fetching unhealthy relationship example data:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load unhealthy relationship example',
        'loadunhealthyrelationexampledate',
        APIEndpoints.unhealthyrelationexamples, // Replace with your actual constant
        '', // documentId intentionally left blank
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.loaded.emit();
    }
  );
}

}
