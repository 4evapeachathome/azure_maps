import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
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

  constructor(private loadingController: LoadingController, private apiService:ApiService, private cdRef:ChangeDetectorRef) { }

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
          console.error('API Error:', err);
          this.hideLoader(); // Dismiss loader on error
        },
        complete: () => {
          // Ensure loader is dismissed after data is fetched
          this.hideLoader();
        }
      });
    } catch (err) {
      console.error('Error:', err);
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
