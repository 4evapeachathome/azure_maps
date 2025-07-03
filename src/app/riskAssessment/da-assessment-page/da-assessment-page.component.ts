import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { filter, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-da-assessment-page',
  templateUrl: './da-assessment-page.component.html',
  styleUrls: ['./da-assessment-page.component.scss'],
  standalone: false
})
export class DaAssessmentPageComponent  implements OnInit,AfterViewInit {
  daGuidUrl :string = APIEndpoints.daGuidUrl; // Replace with your actual API URL
  loading: HTMLIonLoadingElement | null = null;
  reloadData: boolean = false; // Subscription to track navigation events
  constructor(private apiService:ApiService,private loadingController: LoadingController,
    private loggingService: LoggingService,
    private deviceService: DeviceDetectorService , private router:Router) { 
    this.device = this.deviceService.getDeviceInfo();
  }
  daData: any; // This will hold the data fetched from the API
  isInitialLoad: boolean = true; // Track if it's the initial load
  device:any;

     async ngOnInit() {
    }
  
    ionViewWillEnter() {
      // Show loader
      this.showLoader();
  
      // Fetch data
      this.loadDaData();
  
      // Toggle reloadData for child component
      this.reloadData = false;
      setTimeout(() => {
        this.reloadData = true;
      }, 0);
    }

  loadDaData() {
  try {
    const url = this.daGuidUrl;

    this.apiService.generateGuid(url).subscribe({
      next: (response) => {
        this.daData = response?.guid;
        this.hideLoader();
      },
      error: (err) => {
        console.error('API Error in loadDaData:', err);
        const errorMsg = err?.error?.error?.message || err?.message || 'Failed to generate DA GUID';
        this.loggingService.handleApiError(
          'Failed to generate DA GUID',
          'loadDaData',
          url,
          '',
          errorMsg,
          err?.status || 0,
          this.device
        );
        this.hideLoader();
      },
      complete: () => {
        this.hideLoader();
      }
    });
  } catch (err: any) {
    console.error('Unexpected error in loadDaData:', err);
    const errorMsg = err?.error?.error?.message || err?.message || 'Unexpected error';
    this.loggingService.handleApiError(
      'Unexpected error in loadDaData',
      'loadDaData',
      this.daGuidUrl || '',
      '',
      errorMsg,
      0,
      this.device
    );
    this.hideLoader();
  }
}


  async ngAfterViewInit() {
    const idleCallback = window['requestIdleCallback'] || function (cb: any) {
      setTimeout(cb, 1000);
    };

    idleCallback(() => {
      setTimeout(() => {
        this.hideLoader();
      }, 500);
    });
  }

  async showLoader() {
    this.loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      backdropDismiss: false,
    });
    await this.loading.present();

    // Force dismiss after 10 seconds just in case
    setTimeout(() => {
      this.hideLoader();
    }, 5000);
  }

  async hideLoader() {
    if (this.loading) {
      try {
        await this.loading.dismiss();
      } catch (e) {
        console.warn('Loader already dismissed or not yet created');
      }
      this.loading = null;
    }
  }

}
