import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api.service'; 
import { LoggingService } from 'src/app/services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'pathome-relational',
  templateUrl: './relational.component.html',
  styleUrls: ['./relational.component.scss'],
  standalone: true,
  imports: [CommonModule,  IonicModule],
})
export class RelationalComponent  implements OnInit {
  personalItems: any[] = [];
  interpersonalItems: any[] = [];
  device:any;
   @Output() loaded = new EventEmitter<void>();

  constructor(private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,
    private apiService: ApiService) {
      this.device = this.deviceService.getDeviceInfo();
     }

 async ngOnInit() {
  try {
    // Fetching Personal and Interpersonal items from Strapi
    const data = await this.apiService.getRelationalContent().toPromise();

    if (data && data.data && data.data[0]) {
      this.personalItems = data.data[0].Personal || [];
      this.interpersonalItems = data.data[0].Interpersonal || [];
    }

    this.loaded.emit(); // Emit the loaded event after fetching data
  } catch (err) {
    console.error('Error in fetching Personal and Interpersonal items from Strapi:', err);

    this.loggingService.handleApiErrorEducationModule(
      'Failed to load relational content',
      'ngOnInit',
      APIEndpoints.relations, // Replace with the actual endpoint constant if needed
      '',
      (err as any)?.error?.error?.message || (err as any)?.message || 'Unknown error',
      (err as any)?.status || 500,
      this.device
    );

    this.loaded.emit(); // Emit the loaded event even if there's an error
  }
}


}
