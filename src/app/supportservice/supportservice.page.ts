import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-supportservice',
  templateUrl: './supportservice.page.html',
  styleUrls: ['./supportservice.page.scss'],
  standalone: false,
})
export class SupportservicePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(SupportserviceComponent) supportServiceComponent!: SupportserviceComponent;

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


  ionViewWillEnter() {
    if (this.supportServiceComponent) {
      this.supportServiceComponent.loadFilterSupportSeviceData();
    }    
}


ionViewDidLeave() {
  if (this.supportServiceComponent) {
    this.supportServiceComponent.resetState();
  }
}
}