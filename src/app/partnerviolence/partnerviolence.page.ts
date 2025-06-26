import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MenuService } from 'src/shared/menu.service';
import { LoadingController } from '@ionic/angular';

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
  private totalComponents = 2; // Number of child components with API calls
private loadedComponents = 0;
private loaderDismissed = false;

  constructor(private apiService: ApiService,private menuService:MenuService,private loadingController: LoadingController) {}


  async ngOnInit() {
    this.apiService.getPartnerViolenceContent().subscribe(
      (response) => {
        const data = response.data[0];
        this.title = data.title;
        this.levels = data.ipvpartnerviolence;
      },
      (error) => {
        console.error('Error in PartnerViolencePage:', error.message);
      }
    );
    // Optional: show loader early if needed
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
