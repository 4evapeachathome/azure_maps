import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-rat-assessment-page',
  templateUrl: './rat-assessment-page.component.html',
  styleUrls: ['./rat-assessment-page.component.scss'],
  standalone: false
})
export class RatAssessmentPageComponent implements OnInit, AfterViewInit {

  loading: HTMLIonLoadingElement | null = null;
  webData: any;
  webGuidUrl: string = APIEndpoints.webGuidUrl; // Replace with your actual API URL
  reloadData:boolean = false; 
  device:any;

  constructor(private loadingController: LoadingController, private loggingService: LoggingService,
    private deviceService: DeviceDetectorService,
     private apiService:ApiService, private cdRef:ChangeDetectorRef) { }

  ionViewWillEnter() {
    // Show loader
    this.showLoader();

    // Fetch data
    this.loadWebData();

    // Toggle reloadData for child component
    this.reloadData = false;
    setTimeout(() => {
      this.reloadData = true;
    }, 0);
  }

  async ngOnInit() {
    this.cdRef.detectChanges();
    // Clear any cached data related to the RAT assessment
    sessionStorage.removeItem('ratsAssessmentResult');

    // ...add any other cache keys you use...
    this.cdRef.detectChanges();
    
  }

 loadWebData() {
  try {
    const url = this.webGuidUrl;

    this.apiService.generateGuid(url).subscribe({
      next: (response) => {
        this.webData = response?.guid;
        this.hideLoader();
      },
      error: (err) => {
        console.error('API Error in loadWebData:', err);
        const errorMsg = err?.error?.error?.message || err?.message || 'Failed to generate Web GUID';
        this.loggingService.handleApiError(
          'Failed to generate Web GUID',
          'loadWebData',
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
    console.error('Unexpected error in loadWebData:', err);
    const errorMsg = err?.error?.error?.message || err?.message || 'Unexpected error';
    this.loggingService.handleApiError(
      'Unexpected error in loadWebData',
      'loadWebData',
      this.webGuidUrl || '',
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
