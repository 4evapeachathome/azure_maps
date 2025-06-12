import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-da-assessment-page',
  templateUrl: './da-assessment-page.component.html',
  styleUrls: ['./da-assessment-page.component.scss'],
  standalone: false
})
export class DaAssessmentPageComponent  implements OnInit {
  daGuidUrl :string = APIEndpoints.daGuidUrl; // Replace with your actual API URL
  loading: HTMLIonLoadingElement | null = null;
  constructor(private apiService:ApiService,private loadingController: LoadingController) { }
  daData: any; // This will hold the data fetched from the API

  async ngOnInit() {
    this.loadDaData();
    await this.showLoader();
  }

  loadDaData() {
    try {
      // Replace with your actual API URL
      const url = this.daGuidUrl; // Assuming daGuidUrl is defined somewhere in your component
      
      this.apiService.generateGuid(url).subscribe({
        next: (response) => {
          debugger;
          this.daData = response;
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
