import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';

@Component({
  selector: 'app-legalrightshome',
  templateUrl: './legalrightshome.page.html',
  styleUrls: ['./legalrightshome.page.scss'],
  standalone: false
})
export class LegalrightshomePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  legalrightsbannercontent: string = APIEndpoints.legalrightsbannercontent;
  constructor(private loadingController: LoadingController) { }

  async ngOnInit() {
    // Optional: show loader early if needed
    await this.showLoader();
  }

  async ngAfterViewInit() {
    // Wait for images and components to render
    requestIdleCallback(async () => {
      // Give a slight delay to ensure child components/images are painted
      setTimeout(() => {
        this.hideLoader();
      }, 500); // adjust if needed based on image/component loading
    });
  }

  async showLoader() {
    this.loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async hideLoader() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

}
