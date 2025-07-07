import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  private totalComponents = 5; // Number of child components with API calls
  private loadedComponents = 0;
  private loaderDismissed = false;
  @ViewChild('smContainerRef') smContainerRef!: ElementRef;

  constructor(private menuService:MenuService,private loadingController: LoadingController) { }

  async ngOnInit() {
    await this.showLoader();
  }

  ngAfterViewInit() {
    setTimeout(() => {
    const height = this.smContainerRef?.nativeElement?.offsetHeight || 0;
    this.menuService.setContentHeight(height);
  }, 0);
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

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
