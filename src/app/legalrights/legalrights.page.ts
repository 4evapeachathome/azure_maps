import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UsaMapComponent } from '../usa-map/usa-map.component';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-legalrights',
  templateUrl: './legalrights.page.html',
  styleUrls: ['./legalrights.page.scss'],
  standalone: false
})
export class LegalrightsPage implements OnInit,AfterViewInit {
  selectedState: any = null;
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(UsaMapComponent) usaMapComponent!: UsaMapComponent;

 
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
      }, 200); // adjust if needed based on image/component loading
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

  ionViewWillLeave() {
    if (this.usaMapComponent) {
      this.usaMapComponent.resetState();
    }
  }


}
