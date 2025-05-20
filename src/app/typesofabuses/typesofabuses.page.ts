import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-typesofabuses',
  templateUrl: './typesofabuses.page.html',
  styleUrls: ['./typesofabuses.page.scss'],
  standalone: false
})
export class TypesofabusesPage implements OnInit,AfterViewInit {
  activeSection: string = '';
  ipvtypesofabusesendpoint:string=APIEndpoints.ipvtypesofabuses;
  physicalabuse:string=APIEndpoints.physicalabuse;
  sexualabuse:string=APIEndpoints.sexualabuse;
  emotionalabuse:string=APIEndpoints.emotionalabuse;
  verbalabuse:string=APIEndpoints.verbalabuse;
  financialabuse:string=APIEndpoints.financialabuse;
  technologicalabuse:string=APIEndpoints.technologicalabuse;
  immigrantabuse:string=APIEndpoints.immigrantabuse;
  systemabuse:string=APIEndpoints.systemabuse;
  loading: HTMLIonLoadingElement | null = null;

  @ViewChild('abuseSections', { static: false }) abuseSections!: ElementRef;

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

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  }


