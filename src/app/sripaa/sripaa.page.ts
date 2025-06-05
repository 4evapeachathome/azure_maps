import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SripacompComponent } from '../controls/sripacomp/sripacomp.component';
import { MenuService } from 'src/shared/menu.service';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-sripaa',
  templateUrl: './sripaa.page.html',
  styleUrls: ['./sripaa.page.scss'],
  standalone: false,
})
export class SripaaPage implements OnInit,AfterViewInit {
  @ViewChild(SripacompComponent) sripaCompRef!: SripacompComponent;
  @ViewChild('resultsRef') resultsRef!: any;
  @ViewChild('actionPlanRef') actionPlanRef!: any;
  loading: HTMLIonLoadingElement | null = null;

  hidewhenshowingresults: boolean = false;
  selectedTab: 'results' | 'actionplan' = 'results';
  // These will be passed to the results component
  quizTitle: string = '';
  sripa: any[] = [];
  selectedOptions: string[] = [];

  constructor(
    private menuService: MenuService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const saved = sessionStorage.getItem('ssripa_result');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.quizTitle = parsed.quizTitle || '';
      this.sripa = parsed.sripa || [];
      this.selectedOptions = parsed.selectedOptions || [];
  
      // Show result+actionplan tab view by default if session data exists
      if (parsed.view === 'results') {
        this.hidewhenshowingresults = true;
        this.selectedTab = 'results'; 
      } else {
        this.hidewhenshowingresults = false;
      }
    } else {
      this.hidewhenshowingresults = false;
    }
  
    await this.showLoader();
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

  showResults() {
    if (this.sripaCompRef) {
      this.quizTitle = this.sripaCompRef.quizTitle;
      this.sripa = this.sripaCompRef.sripa;
      this.selectedOptions = this.sripaCompRef.selectedOptions;
  
      sessionStorage.setItem(
        'ssripa_result',
        JSON.stringify({
          quizTitle: this.quizTitle,
          sripa: this.sripa,
          selectedOptions: this.selectedOptions,
          view: 'results'
        })
      );
    }
  
    this.hidewhenshowingresults = true;
    this.selectedTab = 'results'; // Default selected tab
  }

  

  exportCurrentTabAsPDF() {
    if (this.selectedTab === 'results' && this.resultsRef?.exportAsPDF) {
      this.resultsRef.exportAsPDF();
    } else if (this.selectedTab === 'actionplan' && this.actionPlanRef?.exportAsPDF) {
      this.actionPlanRef.exportAsPDF();
    }
  }

}
