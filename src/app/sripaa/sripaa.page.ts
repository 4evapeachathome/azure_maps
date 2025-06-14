import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SripacompComponent } from '../controls/sripacomp/sripacomp.component';
import { MenuService } from 'src/shared/menu.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { SsripaactionplanComponent } from '../controls/ssripaactionplan/ssripaactionplan.component';
import { SsriparesultsComponent } from '../controls/ssriparesults/ssriparesults.component';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';


@Component({
  selector: 'app-sripaa',
  templateUrl: './sripaa.page.html',
  styleUrls: ['./sripaa.page.scss'],
  standalone: false,
})
export class SripaaPage implements OnInit,AfterViewInit {
  @ViewChild(SripacompComponent) sripaCompRef!: SripacompComponent;
  @ViewChild('resultsRef') resultsRef!: SsriparesultsComponent;
  @ViewChild('actionPlanRef') actionPlanRef!: SsripaactionplanComponent;
  resultUrl = '';
  loading: HTMLIonLoadingElement | null = null;
  ssripGuidUrl:string=APIEndpoints.ssripGuidUrl;
  sripaData:any;
  hidewhenshowingresults: boolean = false;
  selectedTab: 'results' | 'actionplan' = 'results';
  // These will be passed to the results component
  quizTitle: string = '';
  sripa: any[] = [];
  selectedOptions: string[] = [];
  hasYesAnswer = false;

  constructor(
    private menuService: MenuService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    const saved = sessionStorage.getItem('ssripa_result');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.quizTitle = parsed.quizTitle || '';
      this.sripa = parsed.sripa || [];
      this.selectedOptions = parsed.selectedOptions || [];
      this.resultUrl = parsed.resultUrl || '';
  
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
    this.loadSSripaData();
    const storedHasYes = sessionStorage.getItem('hasYesAnswer');
    this.hasYesAnswer = storedHasYes ? JSON.parse(storedHasYes) : false;
    await this.showLoader();
  }
  
  async retakeAssessment(){
    await this.showLoader();
    this.loadSSripaData();
    sessionStorage.removeItem('hasYesAnswer');
    this.hidewhenshowingresults= false;
    this.hideLoader();
  }

   loadSSripaData() {
    try {
      // Replace with your actual API URL
      const url = this.ssripGuidUrl;
      
      this.apiService.generateGuid(url).subscribe({
        next: (response) => {
          this.sripaData = response?.guid;
        },
        error: (err) => {
          console.error('API Error:', err);
          // Handle error (show toast, etc.)
        }
      });
    } catch (err) {
      console.error('Error:', err);
    }
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

  async showResults() {
    // Create the alert using AlertController
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to submit the Assessment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirmation canceled');
          }
        },
        {
          text: 'OK',
          handler: async () => {
            // Proceed with the original logic if OK is clicked
            if (this.sripaCompRef) {
              try {
                const response = await firstValueFrom(this.sripaCompRef.submitAssessmentResponse());
  
                this.quizTitle = this.sripaCompRef.quizTitle;
                this.sripa = this.sripaCompRef.sripa;
                this.selectedOptions = this.sripaCompRef.selectedOptions;
  
                if (response) {
                  this.resultUrl = `code=${response?.data?.AssessmentGuid || 'unknown'}`;
                }
  
                sessionStorage.setItem(
                  'ssripa_result',
                  JSON.stringify({
                    quizTitle: this.quizTitle,
                    sripa: this.sripa,
                    selectedOptions: this.selectedOptions,
                    view: 'results',
                    resultUrl: this.resultUrl
                  })
                );
  
                this.hidewhenshowingresults = true;
                this.selectedTab = 'results';
              } catch (error) {
                console.error('Failed to load results from child component:', error);
              }
            }
          }
        }
      ]
    });
  
    // Present the alert
    await alert.present();
  }

  

  async exportCurrentTabAsPDF() {
    try {
      // Show loader
      await this.showLoader();
      
      // Add slight delay to ensure loader is visible before heavy work starts
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (this.selectedTab === 'results') {
        await this.resultsRef?.exportToPDF();
      } else if (this.selectedTab === 'actionplan') {
        await this.actionPlanRef?.exportAsPDF();
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Optionally show error to user
    } finally {
      // Always hide loader when done
      await this.hideLoader();
    }
  }

}
