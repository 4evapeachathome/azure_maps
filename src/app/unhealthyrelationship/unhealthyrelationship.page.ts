import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-unhealthyrelationship',
  templateUrl: './unhealthyrelationship.page.html',
  styleUrls: ['./unhealthyrelationship.page.scss'],
  standalone: false
})
export class UnhealthyrelationshipPage implements OnInit,AfterViewInit {
public readonly unhealthyrelationcontent :string = APIEndpoints.unhealthyrelationshipbanner;
public readonly unhealthyrelationslider :string = APIEndpoints.unhealthyrelationshipslider
public readonly unhealthyrelationcontentone :string = APIEndpoints.unhealthyrelationcontentone
public readonly unhealthyrelationcontenttwo :string = APIEndpoints.unhealthyrelationcontenttwo
public readonly unhealthyrelationcontentthree :string = APIEndpoints.unhealthyrelationcontentthree
loading: HTMLIonLoadingElement | null = null;
private totalComponents = 5; // Number of child components with API calls
  private loadedComponents = 0;
  private loaderDismissed = false;

  constructor(private menuService:MenuService,private loadingController: LoadingController) { }

  async ngOnInit() {
    await this.showLoader();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.loaderDismissed) {
        console.log('Fallback timeout triggered: dismissing loader');
        this.hideLoader();
      } else {
        console.log('Fallback timeout ignored: loader already dismissed');
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
    console.log('Loader presented');
  }

  async hideLoader() {
    if (this.loading && !this.loaderDismissed) {
      try {
        await this.loading.dismiss();
        console.log('Loader dismissed');
      } catch (e) {
        console.warn('Loader already dismissed or error dismissing:', e);
      }
      this.loaderDismissed = true;
      this.loading = null;
    }
  }

 async onChildLoaded() {
  if (this.loaderDismissed) {
    console.log(`Ignoring extra load event after loader dismissed`);
    return;
  }

  this.loadedComponents++;

  console.log(`Component loaded (${this.loadedComponents}/${this.totalComponents})`);

  if (this.loadedComponents >= this.totalComponents) {
    console.log(`All components loaded, hiding loader...`);
    await this.hideLoader(); // <- important
  }
}

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
