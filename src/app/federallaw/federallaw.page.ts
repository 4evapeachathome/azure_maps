import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-federallaw',
  templateUrl: './federallaw.page.html',
  styleUrls: ['./federallaw.page.scss'],
  standalone:false
})
export class FederallawPage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  public readonly federallawbannercontent : string =APIEndpoints.federallawbannercontent;
  public readonly uvisa : string =APIEndpoints.uvisa;
  public readonly tvisa : string =APIEndpoints.tvisa;
  public readonly childwaiver : string =APIEndpoints.childwaiver;
  public readonly immigrationbenfit : string =APIEndpoints.immigrationbenfit;

  constructor(private menuService:MenuService,private loadingController: LoadingController) { }

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

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
