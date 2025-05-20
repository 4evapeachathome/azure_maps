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
    }, 7000);
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

  ionViewWillLeave() {
    if (this.usaMapComponent) {
      this.usaMapComponent.resetState();
    }
  }


}
