import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { RiskassessmentSSripaComponent } from '../controls/riskassessment-ssripa/riskassessment-ssripa.component';
import { LoggingService } from 'src/app/services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-risk-assessment-ssripa',
  templateUrl: './risk-assessment-ssripa.page.html',
  styleUrls: ['./risk-assessment-ssripa.page.scss'],
  standalone: false
})
export class RiskAssessmentSSripaPage implements OnInit,AfterViewInit {
 loading: HTMLIonLoadingElement | null = null;
 ssripGuidUrl :string = APIEndpoints.ssripGuidUrl; 
 reloadData: boolean = false; // Subscription to track navigation events
 sripaData:any;// Replace with your actual API URL
 device:any
constructor(private loadingController: LoadingController,
  private loggingService: LoggingService,
    private deviceService: DeviceDetectorService, private apiService:ApiService,private router: Router) { 
      this.device = this.deviceService.getDeviceInfo();
    }

  async ngOnInit() {
  }

  ionViewWillEnter() {
    // Show loader
    this.showLoader();

    // Fetch data
    this.loadSSripaData();

    // Toggle reloadData for child component
    this.reloadData = false;
    setTimeout(() => {
      this.reloadData = true;
    }, 0);
  }
 

  loadSSripaData() {
  try {
    const url = this.ssripGuidUrl;

    this.apiService.generateGuid(url).subscribe({
      next: (response) => {
        this.sripaData = response?.guid;
        this.hideLoader();
      },
      error: (err) => {
        console.error('API Error in loadSSripaData:', err);
        const errorMsg = err?.error?.error?.message || err?.message || 'Failed to generate SSRIPA GUID';
        this.loggingService.handleApiErrorRiskAssessment(
          'Failed to generate SSRIPA GUID',
          'loadSSripaData',
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
    console.error('Unexpected error in loadSSripaData:', err);
    const errorMsg = err?.error?.error?.message || err?.message || 'Unexpected error';
    this.loggingService.handleApiErrorRiskAssessment(
      'Unexpected error in loadSSripaData',
      'loadSSripaData',
      this.ssripGuidUrl || '',
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
