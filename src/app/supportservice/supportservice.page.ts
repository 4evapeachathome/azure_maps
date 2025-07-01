import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';
import { LoadingController } from '@ionic/angular';
import { filter, firstValueFrom, take } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-supportservice',
  templateUrl: './supportservice.page.html',
  styleUrls: ['./supportservice.page.scss'],
  standalone: false,
})
export class SupportservicePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(SupportserviceComponent) supportServiceComponent!: SupportserviceComponent;

  constructor(private loadingController: LoadingController,private sharedDataService:MenuService) { }

ngOnInit() {
  this.sharedDataService.dataLoaded$
    .pipe(
      filter(loaded => loaded), // Wait until AppComponent says data is ready
      take(1)
    )
    .subscribe(() => {
      this.supportServiceComponent.loadFilterSupportSeviceData(); // ✅ Safe now
    });
}


  async ngAfterViewInit() {
    const idleCallback = window['requestIdleCallback'] || function (cb: any) {
      setTimeout(cb, 1000);
    };

    idleCallback(() => {
      setTimeout(() => {
        this.hideLoader();
      }, 2000);
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
    }, 3500);
  }

  onChildDataLoaded() {
  this.hideLoader(); // ✅ Hide loading spinner
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
    this.sharedDataService.toggleAdditionalMenus(true, sectionTitle);
  }

async ionViewWillEnter() {
  await this.showLoader();
  this.supportServiceComponent.initializeGoogleMapsServices();
  this.supportServiceComponent.setupSearchDebounce();

  this.sharedDataService.dataLoaded$
    .pipe(filter(loaded => loaded), take(1))
    .subscribe(() => {
      // ✅ Now API data is available, safe to:
      this.supportServiceComponent.getCurrentPosition(); // Fetch lat/lng using shared data
      this.supportServiceComponent.loadFilterSupportSeviceData();
      this.hideLoader();
    });
}


ionViewDidLeave() {
  if (this.supportServiceComponent) {
    this.supportServiceComponent.resetState();
  }
}
}