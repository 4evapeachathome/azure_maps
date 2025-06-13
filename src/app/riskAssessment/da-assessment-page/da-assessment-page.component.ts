import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { DaAssessmentQuestionsComponent } from '../controls/da-assessment-questions/da-assessment-questions.component';

@Component({
  selector: 'app-da-assessment-page',
  templateUrl: './da-assessment-page.component.html',
  styleUrls: ['./da-assessment-page.component.scss'],
  standalone: false
})
export class DaAssessmentPageComponent  implements OnInit, OnDestroy {
  daGuidUrl :string = APIEndpoints.daGuidUrl; // Replace with your actual API URL
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(DaAssessmentQuestionsComponent) dacomp!: DaAssessmentQuestionsComponent;
  private navigationSubscription: Subscription | null = null; // Subscription to track navigation events
  constructor(private apiService:ApiService,private loadingController: LoadingController, private router:Router) { }
  daData: any; // This will hold the data fetched from the API
  isInitialLoad: boolean = true; // Track if it's the initial load

 async ngOnInit() {
       // Set up navigation event subscription
       this.navigationSubscription = this.router.events
         .pipe(filter(event => event instanceof NavigationEnd))
         .subscribe((event: NavigationEnd) => {
           if (event.urlAfterRedirects.includes('dangerassessment')) {
             console.log('Navigated to SSRIPA page, refreshing data');
             // Skip data load on initial NavigationEnd if already loaded
             if (!this.isInitialLoad) {
              if(this.dacomp){
                this.dacomp.loadInitialData();
              }
               this.loadDaData();
               this.showLoader();
             }
           }
         });
   
       // Load data initially
       this.loadDaData();
       await this.showLoader();
       this.isInitialLoad = false; // Mark initial load as complete
     }

  loadDaData() {
    try {
      // Replace with your actual API URL
      const url = this.daGuidUrl; // Assuming daGuidUrl is defined somewhere in your component
      
      this.apiService.generateGuid(url).subscribe({
        next: (response) => {
       //   debugger;
          this.daData = response?.guid;
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


  ngOnDestroy() {
    // Clean up subscription
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
}
