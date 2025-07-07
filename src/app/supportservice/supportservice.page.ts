import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';
import { LoadingController } from '@ionic/angular';
import { combineLatest, filter, firstValueFrom, take } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-supportservice',
  templateUrl: './supportservice.page.html',
  styleUrls: ['./supportservice.page.scss'],
  standalone: false,
})
export class SupportservicePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild('smContainerRef') smContainerRef!: ElementRef;
  @ViewChild(SupportserviceComponent) supportServiceComponent!: SupportserviceComponent;

  constructor(private loadingController: LoadingController,private sharedDataService:MenuService) { }

ngOnInit() {
}


  async ngAfterViewInit() {
    setTimeout(() => {
    const height = this.smContainerRef?.nativeElement?.offsetHeight || 0;
    this.sharedDataService.setContentHeight(height);
  }, 0);
  }

  async showLoader() {
  this.loading = await this.loadingController.create({
    message: 'Loading...',
    spinner: 'crescent',
    backdropDismiss: false,
  });
  await this.loading.present();

  // Optional force dismiss backup
  setTimeout(() => {
    if (this.loading) {
      console.warn('[Loader] ⏱ Timeout hit – forcing loader hide');
      this.hideLoader();
    }
  }, 10000);
}

async hideLoader() {
  if (this.loading) {
    try {
      await this.loading.dismiss();
    } catch (e) {
      console.warn('[Loader] ❌ Loader dismiss failed or already dismissed');
    }
    this.loading = null;
  }
}

    expandMenu(sectionTitle: string) {
    this.sharedDataService.toggleAdditionalMenus(true, sectionTitle);
  }

async ionViewWillEnter() {

  await this.showLoader(); // 👈 Show loader early


  combineLatest([
    this.sharedDataService.dataLoaded$,
    this.sharedDataService.menuLoaded$
  ])
  .pipe(
    filter(([dataLoaded, menuLoaded]) => {
      return dataLoaded && menuLoaded;
    }),
    take(1)
  )
  .subscribe(() => {

    this.supportServiceComponent.initializeGoogleMapsServices();
    this.supportServiceComponent.setupSearchDebounce();
    this.supportServiceComponent.getCurrentPosition();
    this.supportServiceComponent.loadFilterSupportSeviceData();

    this.hideLoader(); // 👈 Hide loader only when everything is ready
  });
}

ionViewDidLeave() {
  if (this.supportServiceComponent) {
    this.supportServiceComponent.resetState();
  }
}
}