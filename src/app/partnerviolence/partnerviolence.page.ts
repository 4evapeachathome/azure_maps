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
