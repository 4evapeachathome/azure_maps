import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsaMapComponent } from '../usa-map/usa-map.component';
import { LoadingController } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-legalrights',
  templateUrl: './legalrights.page.html',
  styleUrls: ['./legalrights.page.scss'],
  standalone: false
})
export class LegalrightsPage implements OnInit,AfterViewInit {
  selectedState: any = null;
  isStateSelected: boolean = false;
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(UsaMapComponent) usaMapComponent!: UsaMapComponent;
  @ViewChild('smContainerRef') smContainerRef!: ElementRef;

 
  constructor(private loadingController: LoadingController, private menuService:MenuService) { }

  async ngOnInit() {
    // Only show loader if not pre-rendered
    await this.showLoader();
  }

  onStateSelected(state: { id: string; name: string; path: string }) {
    this.isStateSelected = !!state; // Set to true if a state is selected (state is not null/undefined)
  }

  async ngAfterViewInit() {
  // Measure height as soon as view is ready
  setTimeout(() => {
    const height = this.smContainerRef?.nativeElement?.offsetHeight || 0;
    this.menuService.setContentHeight(height);
  }, 0);

  // Hide loader after a slight delay (optional and tunable)
  setTimeout(() => {
    this.hideLoader();
  }, 3000); // shorter than 500ms for snappier UX
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

  ionViewWillLeave() {
    if (this.usaMapComponent) {
      this.usaMapComponent.resetState();
    }
  }


}
