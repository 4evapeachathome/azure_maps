import {AfterViewInit, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  // imports: [IonicModule, MenuComponent]
})
export class HomePage implements OnInit,AfterViewInit {
  sliderEndpoint:string = APIEndpoints.sliderapi;
  loading: HTMLIonLoadingElement | null = null;
  private totalComponents = 4; // Number of child components with API calls
  private loadedComponents = 0;
  

  constructor(private router: Router, private menuService:MenuService, private loadingController: LoadingController) {}

  async ngOnInit() {
    await this.showLoader();
  }

  ngAfterViewInit() {
    //optionally set back
    setTimeout(() => {
      this.hideLoader();
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
    if (this.loading) {
      try {
        await this.loading.dismiss();
      } catch (e) {
        console.warn('Loader already dismissed or not yet created');
      }
      this.loading = null;
    }
  }

  onChildLoaded() {
    if (this.loadedComponents >= this.totalComponents) {
      console.log(`Ignoring extra load event from after all components loaded`);
      return;
    }
    this.loadedComponents++;
    console.log(`Child component loaded: (${this.loadedComponents}/${this.totalComponents})`);
    if (this.loadedComponents >= this.totalComponents) {
      console.log(`All children loaded`);
      this.hideLoader();
    }
  }

  navigateToPeaceAtHome() {
    this.router.navigate(['/peaceathome']);
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }
}
