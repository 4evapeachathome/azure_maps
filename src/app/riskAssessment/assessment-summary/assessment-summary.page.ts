import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-assessment-summary',
  templateUrl: './assessment-summary.page.html',
  styleUrls: ['./assessment-summary.page.scss'],
  standalone: false,
})
export class AssessmentSummaryPage implements OnInit,AfterViewInit{
  loading: HTMLIonLoadingElement | null = null;
  riskScore: number = 7; // Example score, should be updated with actual risk assessment score
  reloadData: boolean = false;
  constructor(private loadingController: LoadingController,private router:Router) { }

  async ngOnInit() {
    // Only show loader if not pre-rendered
    this.reloadData = true;

    // Subscribe to route changes to toggle reloadFlag
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Toggle reloadFlag to trigger ngOnChanges in child
        this.reloadData = false;
        setTimeout(() => {
          this.reloadData = true; // Set to true after a tick to ensure change detection
        }, 0);
      }
    });
    await this.showLoader();
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
