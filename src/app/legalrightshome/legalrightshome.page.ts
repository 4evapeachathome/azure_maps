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
  private totalComponents = 1; // Number of child components with API calls
private loadedComponents = 0;
private loaderDismissed = false;
  constructor(private loadingController: LoadingController) { }

  async ngOnInit() {
    await this.showLoader();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.loaderDismissed) {
        this.hideLoader();
      } else {
      }
    }, 10000); // 10 seconds max
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
    if (this.loading && !this.loaderDismissed) {
      try {
        await this.loading.dismiss();
      } catch (e) {
      }
      this.loaderDismissed = true;
      this.loading = null;
    }
  }

 async onChildLoaded() {
  if (this.loaderDismissed) {
    return;
  }

  this.loadedComponents++;


  if (this.loadedComponents >= this.totalComponents) {
    await this.hideLoader(); // <- important
  }
}

}
