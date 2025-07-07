import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MenuService } from 'src/shared/menu.service';
import { LoadingController } from '@ionic/angular';
import { LoggingService } from '../services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';

interface IpvPartnerViolence {
  id: number;
  multilinerichtextbox: {
    type: string;
    level?: number;
    format?: string;
    children: { text: string; type: string }[];
  }[];
}

@Component({
  selector: 'app-partnerviolence',
  templateUrl: './partnerviolence.page.html',
  styleUrls: ['./partnerviolence.page.scss'],
  standalone: false,
})
export class PartnerviolencePage implements OnInit,AfterViewInit {
  title: string = '';
  loading: HTMLIonLoadingElement | null = null;
  levels: IpvPartnerViolence[] = [];
  device:any;
  private totalComponents = 2; // Number of child components with API calls
private loadedComponents = 0;
private loaderDismissed = false;

  constructor(private apiService: ApiService,
       private loggingService: LoggingService,
  private deviceService:DeviceDetectorService,
    private menuService:MenuService,private loadingController: LoadingController) {
    this.device = this.deviceService.getDeviceInfo();
    }


 async ngOnInit() {
  try {
    await this.showLoader(); // Show loader before making API call

    this.apiService.getPartnerViolenceContent().subscribe(
      (response) => {
        const data = response?.data?.[0];
        if (data) {
          this.title = data.title;
          this.levels = data.ipvpartnerviolence;
        }
         this.hideLoader(); // Emit event to indicate loading is done
      },
      (error) => {
        console.error('Error in PartnerViolencePage:', error);

        this.loggingService.handleApiErrorEducationModule(
          'Failed to load Partner Violence content',
          'ngOnInit',
          APIEndpoints.ipvpartnervioence, // Replace with actual constant if not already
          '',
          error?.error?.error?.message || error?.message || 'Unknown error',
          error?.status || 500,
          this.device
        );

         this.hideLoader();// Still emit to unblock UI
      }
    );
  } catch (err) {
    console.error('Unexpected error in ngOnInit:', err);
    await this.hideLoader();// Safety fallback
  }
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
