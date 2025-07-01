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
  private totalComponents = 1; // Number of child components with API calls
private loadedComponents = 0;
private loaderDismissed = false;

  constructor(
    private menuService: MenuService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    await this.showLoader();
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
  }
  
  async retakeAssessment() {
    await this.showLoader(); // Start the loader
    this.hidewhenshowingresults = false; // Set to show the assessment component
    sessionStorage.removeItem('hasYesAnswer');
    sessionStorage.removeItem('ssripa_result');

    // Reload data and wait for it to complete
    await this.loadSSripaDataAsync();
    // Delay loader dismissal until the child component is likely rendered
    await new Promise(resolve => setTimeout(resolve, 500)); // Adjust delay as needed
    this.hideLoader(); // Dismiss loader only when content is visible
  }

  async loadSSripaDataAsync() {
    return new Promise<void>((resolve) => {
      try {
        const url = this.ssripGuidUrl;
        this.apiService.generateGuid(url).subscribe({
          next: (response) => {
            this.sripaData = response?.guid;
            resolve(); // Resolve when data is loaded
          },
          error: (err) => {
            console.error('API Error:', err);
            this.sripaData = null; // Fallback in case of error
            resolve(); // Resolve even on error to proceed
          }
        });
      } catch (err) {
        console.error('Error:', err);
        this.sripaData = null; // Fallback
        resolve(); // Resolve to avoid hanging
      }
    });
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
          }
        },
        {
          text: 'OK',
          handler: async () => {
            // Dismiss the alert first
            await alert.dismiss();
  
            // Start the loader after the alert is dismissed
            await this.showLoader();
  
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
  
            // Delay loader dismissal to allow UI update
            await new Promise(resolve => setTimeout(resolve, 500)); // Adjust delay as needed
            await this.hideLoader(); // Dismiss loader after results are processed
          }
        }
      ]
    });
  
    // Present the alert
    await alert.present();
  }

  

  async exportCurrentTabAsPDF() {
    try {      
      if (this.selectedTab === 'results') {
        await this.resultsRef?.exportToPDF();
      } else if (this.selectedTab === 'actionplan') {
        await this.actionPlanRef?.exportAsPDF();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

}
