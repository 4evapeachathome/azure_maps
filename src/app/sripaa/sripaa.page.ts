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

  loading: HTMLIonLoadingElement | null = null;

  hidewhenshowingresults: boolean = false;
  hidewhenactionplanvisible: boolean = false;

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
  
      // Determine which view to show
      if (parsed.view === 'results') {
        this.hidewhenshowingresults = true;
        this.hidewhenactionplanvisible = false;
      } else if (parsed.view === 'actionplan') {
        this.hidewhenactionplanvisible = true;
        this.hidewhenshowingresults = false;
      } else {
        this.hidewhenshowingresults = false;
        this.hidewhenactionplanvisible = false;
      }
    } else {
      this.hidewhenshowingresults = false;
      this.hidewhenactionplanvisible = false;
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
    this.hidewhenactionplanvisible = false;
  }
  
  // This shows the action plan and hides others
  showActionPlan() {
    this.hidewhenactionplanvisible = true;
    this.hidewhenshowingresults = false;
  
    sessionStorage.setItem(
      'ssripa_result',
      JSON.stringify({
        quizTitle: this.quizTitle,
        sripa: this.sripa,
        selectedOptions: this.selectedOptions,
        view: 'actionplan'
      })
    );
  }
}
