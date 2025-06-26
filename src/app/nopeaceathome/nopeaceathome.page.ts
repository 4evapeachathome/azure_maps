import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-nopeaceathome',
  templateUrl: './nopeaceathome.page.html',
  styleUrls: ['./nopeaceathome.page.scss'],
  standalone: false
})
export class NopeaceathomePage implements OnInit,AfterViewInit {
  nopeaceathomeslider:string=APIEndpoints.nopeaceathomeslider;
  nopeaceathometitlecontent:string= APIEndpoints.nopeaceathometitlecontent;
  nopeacepartnerviolencecontent:string=APIEndpoints.nopeacepartnerviolencecontent;
  nopeacehouseholdconflicts:string=APIEndpoints.nopeacehouseholdconflicts;
  nopeacetoxicrelationship:string=APIEndpoints.nopeacetoxicrelationship;
  loading: HTMLIonLoadingElement | null = null;
  private totalComponents = 3; // Number of child components with API calls
  private loadedComponents = 0;
  private loaderDismissed = false;
  constructor(private menuService:MenuService,private loadingController: LoadingController) { }

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

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
