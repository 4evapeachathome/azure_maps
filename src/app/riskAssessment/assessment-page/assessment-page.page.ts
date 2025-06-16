import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { AssessmentPageComponent } from '../controls/assessment-page/assessment-page.component';

@Component({
  selector: 'app-assessment-page',
  templateUrl: './assessment-page.page.html',
  styleUrls: ['./assessment-page.page.scss'],
  standalone: false,
})
export class AssessmentPagePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(AssessmentPageComponent) childComponent!: AssessmentPageComponent;
    private navigationSubscription: Subscription | null = null; // Subscription to track navigation events
  

  constructor(private loadingController: LoadingController, private router:Router) { }

   async ngOnInit() {
        // Set up navigation event subscription
        this.navigationSubscription = this.router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe((event: NavigationEnd) => {
            if (event.urlAfterRedirects.includes('riskassessment')) {
              console.log('Navigated to SSRIPA page, refreshing data');
              // Skip data load on initial NavigationEnd if already loaded
                if(this.childComponent) {
                  this.childComponent.loadInitialData(); // Call the method to load data
                }
                this.showLoader();

            }
          });
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
    }, 3000);
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
