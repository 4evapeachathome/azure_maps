import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-risk-assessment-ssripa',
  templateUrl: './risk-assessment-ssripa.page.html',
  styleUrls: ['./risk-assessment-ssripa.page.scss'],
  standalone: false
})
export class RiskAssessmentSSripaPage implements OnInit {
 loading: HTMLIonLoadingElement | null = null;
 ssripGuidUrl :string = APIEndpoints.ssripGuidUrl; 
 private navigationSubscription: Subscription | null = null;
 isInitialLoad: boolean = true; // Track if it's the initial load
 sripaData:any;// Replace with your actual API URL
  constructor(private loadingController: LoadingController, private apiService:ApiService,private router: Router) { }

  async ngOnInit() {
    // Set up navigation event subscription
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes('ssripariskassessment')) {
          console.log('Navigated to SSRIPA page, refreshing data');
          // Skip data load on initial NavigationEnd if already loaded
          if (!this.isInitialLoad) {
            this.loadSSripaData();
            this.showLoader();
          }
        }
      });

    // Load data initially
    this.loadSSripaData();
    await this.showLoader();
    this.isInitialLoad = false; // Mark initial load as complete
  }

  loadSSripaData() {
    try {
      // Replace with your actual API URL
      const url = this.ssripGuidUrl;
      
      this.apiService.generateGuid(url).subscribe({
        next: (response) => {
       //   debugger;
          this.sripaData = response?.guid;
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
