import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-hits-assessment-page',
  templateUrl: './hits-assessment-page.page.html',
  styleUrls: ['./hits-assessment-page.page.scss'],
  standalone: false,
})
export class HitsAssessmentPagePage implements OnInit {
  loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) { }

  async ngOnInit() {
    // Only show loader if not pre-rendered
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
