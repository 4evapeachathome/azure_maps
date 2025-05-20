import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-healthyrelationship',
  templateUrl: './healthyrelationship.page.html',
  styleUrls: ['./healthyrelationship.page.scss'],
  standalone: false,
})
export class HealthyrelationshipPage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
healthyrelationslider:string = APIEndpoints.healthyrelationslider;
healtyrelationTitleContent:string = APIEndpoints.healtyrelationTitleContent;
healthyrelationcontentwithoutbutton = APIEndpoints.healthyrelationcontentwithoutbutton;
healthyrelationcontentwithbutton = APIEndpoints.healthyrelationcontentwithbutton;
  constructor(private menuService:MenuService,private loadingController: LoadingController) { }

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

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
