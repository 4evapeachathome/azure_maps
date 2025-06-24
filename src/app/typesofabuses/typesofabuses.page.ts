import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
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

  constructor(private menuService:MenuService,private loadingController: LoadingController,private route:ActivatedRoute,private router: Router,
    private location: Location) { }

  async ngOnInit() {
    await this.showLoader();
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        setTimeout(() => {
          this.scrollToSection(section);
  
          // Remove the query param from the URL after scrolling
          this.location.replaceState(this.router.url.split('?')[0]);
        }, 300); // Allow DOM to render before scrolling
      }
    });
   
  }

  async ngAfterViewInit() {
    const idleCallback = window['requestIdleCallback'] || function (cb: any) {
      setTimeout(cb, 1000);
    };

    idleCallback(() => {
      setTimeout(() => {
        this.hideLoader();
      }, 500);
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

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

  scrollToSection(sectionId: string) {
    debugger;
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  }


