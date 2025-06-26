import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonContent, LoadingController } from '@ionic/angular';
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
  private totalComponents = 11; // Number of child components with API calls
  private loadedComponents = 0;
  private loaderDismissed = false;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
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
            this.location.replaceState(this.router.url.split('?')[0]);
          }, 1000); // Slightly shorter might work better on mobile
        }
      });
    }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.loaderDismissed) {
        this.hideLoader();
      } else {
      }
    }, 15000); // 10 seconds max
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
        console.warn('Loader already dismissed or error dismissing:', e);
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

  scrollToSection(sectionId: string, attempt: number = 1) {
    const element = document.getElementById(sectionId);
    this.activeSection = sectionId;
    if (element && this.content) {
      const yOffset = element.getBoundingClientRect().top + window.scrollY;
      this.content.scrollToPoint(0, yOffset - 100, 500);
    } else if (attempt <= 5) {
      setTimeout(() => this.scrollToSection(sectionId, attempt + 1), 300);
    }
  }
  }


