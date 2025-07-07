import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SripacompComponent } from '../controls/sripacomp/sripacomp.component';
import { MenuService } from 'src/shared/menu.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { SsripaactionplanComponent } from '../controls/ssripaactionplan/ssripaactionplan.component';
import { SsriparesultsComponent } from '../controls/ssriparesults/ssriparesults.component';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { LoggingService } from '../services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';


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
  device: any;
  selectedOptions: string[] = [];
  hasYesAnswer = false;
  private totalComponents = 1; // Number of child components with API calls
private loadedComponents = 0;
private loaderDismissed = false;
showSubmit: boolean = false; // Flag to control visibility of the submit button

  constructor(
    private menuService: MenuService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private loggingService: LoggingService,
    private deviceService: DeviceDetectorService,
    private cdRef:ChangeDetectorRef,
    private apiService: ApiService
  ) {
    this.device = this.deviceService.getDeviceInfo();
    // Initialize the sripaData to an empty object
  }

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
   this.loadedComponents = 0;
   this.loaderDismissed = false;

    // Reload data and wait for it to complete
    await this.loadSSripaDataAsync();
    // Delay loader dismissal until the child component is likely rendered
    await new Promise(resolve => setTimeout(resolve, 500)); // Adjust delay as needed
    this.hideLoader(); // Dismiss loader only when content is visible
  }

  onResultsInitialized() {
  this.hideLoader(); // ✅ should finally dismiss loader
}

  onShowResultsChanged(show: boolean) {
  this.showSubmit = show;
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
      } catch (error:any) {
        console.error('Error:', error);
         this.loggingService.handleApiErrorEducationModule(
          'Failed to load SSRIPA EducationModule GUID',
          'loadSSripaDataAsync',
          this.ssripGuidUrl, // Replace with actual constant if not already
          '',
          error?.error?.error?.message || error?.message || 'Unknown error',
          error?.status || 500,
          this.device
        );

        this.sripaData = null; // Fallback
        resolve(); // Resolve to avoid hanging
      }
    });
  }

   loadSSripaData() {
  try {
    const url = this.ssripGuidUrl;

    this.apiService.generateGuid(url).subscribe({
      next: (response) => {
        this.sripaData = response?.guid;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loggingService.handleApiErrorEducationModule(
          'Failed to load SSRIPA EducationModule GUID',
          'loadSSripaData',
          url,
          '',
          err?.error?.error?.message || err?.message || 'Unknown error',
          err?.status || 500,
          this.device
        );
      }
    });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    // Optional: log unexpected errors too
  }
}


   ngAfterViewInit() {
    setTimeout(() => {
      if (!this.loaderDismissed) {
        this.hideLoader();
      } else {
      }
    }, 5000); // 10 seconds max
  }

async showLoader() {
  console.log('[SripaaPage] showLoader called');

  try {
    this.loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      backdropDismiss: false,
    });

    await this.loading.present();
    this.loaderDismissed = false; // reset flag
  } catch (e) {
  }
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
  const alert = await this.alertController.create({
    header: 'Confirm',
    message: 'Are you sure you want to submit the Assessment?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'OK',
        handler: async () => {
          await alert.dismiss();
          await this.showLoader();

          try {
            if (this.sripaCompRef) {
              const response = await firstValueFrom(this.sripaCompRef.submitAssessmentResponse());

              this.quizTitle = this.sripaCompRef.quizTitle;
              this.sripa = this.sripaCompRef.sripa;
              this.selectedOptions = this.sripaCompRef.selectedOptions;

              if (response) {
                this.resultUrl = `code=${response?.data?.AssessmentGuid || 'unknown'}`;
              }

              sessionStorage.setItem('ssripa_result', JSON.stringify({
                quizTitle: this.quizTitle,
                sripa: this.sripa,
                selectedOptions: this.selectedOptions,
                view: 'results',
                resultUrl: this.resultUrl,
              }));

              this.hidewhenshowingresults = true;
              this.selectedTab = 'results';
            }
          } catch (error:any) {
            console.error('Failed to load results from child component:', error);

               this.loggingService.handleApiErrorEducationModule(
              'Failed to submit SSRIPA assessment and show results',
              'showResults',
              '', // No URL since it's delegated to child component
              '',
              error?.error?.error?.message || error?.message || 'Unknown error',
              error?.status || 500,
              this.device
            );
          }

          setTimeout(() => {
  this.cdRef.detectChanges(); // optional, forces view update
  this.hideLoader();          // ✅ ensure loader disappears
}, 0);  // ✅ Only here!
        },
      },
    ],
  });

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
