import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-rat-assessment-page',
  templateUrl: './rat-assessment-page.component.html',
  styleUrls: ['./rat-assessment-page.component.scss'],
  standalone: false
})
export class RatAssessmentPageComponent implements OnInit {

  loading: HTMLIonLoadingElement | null = null;
  webData: any;
  webGuidUrl: string = APIEndpoints.webGuidUrl; // Replace with your actual API URL

  constructor(private loadingController: LoadingController, private apiService:ApiService, private cdRef:ChangeDetectorRef) { }

  async ngOnInit() {
    this.cdRef.detectChanges();
    // Clear any cached data related to the RAT assessment
    sessionStorage.removeItem('ratsAssessmentResult');

    // ...add any other cache keys you use...
    this.cdRef.detectChanges();
    
    this.loadWebData();
    await this.showLoader();
  }

  loadWebData() {
    try {
      // Replace with your actual API URL
      const url = this.webGuidUrl;

      this.apiService.generateGuid(url).subscribe({
        next: (response) => {
       //   debugger;
          this.webData = response?.guid;
        },
        error: (err) => {
          console.error('API Error:', err);
          // Handle error (show toast, etc.)
        }
      });
    } catch (err) {
      console.error('Error:', err);
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
