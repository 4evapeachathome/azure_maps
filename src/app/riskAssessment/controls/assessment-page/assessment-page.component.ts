import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { ASSESSMENT_TYPE } from 'src/shared/constants';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'assessment-page',
  templateUrl: './assessment-page.component.html',
  styleUrls: ['./assessment-page.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule,FormsModule],
})
export class AssessmentPageComponent  implements OnInit {
  loggedInUser: any = null;
  selectedAssessment: string | null = null;
  caseNumber: string = '';
  loaded: boolean = false;
  guidedType: 'self-guided' | 'staff-guided' = 'staff-guided';
  assessmentTypes: { id: number; name: string; description: string; navigate:string, documentId: string }[] = [];
  guidedTypeLabel: string = 'Staff-Guided';
  assessmentNumber: string = '';
  ASSESSMENT_TYPE = ASSESSMENT_TYPE;
  isHitAssessment = false;
  isDaAssessment = false;
  isSSripa = false;
  @Input() reloadFlag: boolean = false; // Input to trigger reload
  isDataLoaded = false;
  hasloadedDate = false; // To track if data has been loaded
  navigate: string = ''; // To store the navigate value from the selected assessment
  isInvalidCode: boolean = false; // Flag to indicate if the code is invalid
  device: any;

  constructor(
    private menuService: MenuService,
    private router: Router,
    private cookieService: CookieService,
    private apiService: ApiService,
    private analytics : PageTitleService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loggingService: LoggingService,
    private deviceService: DeviceDetectorService
  ) {
    this.device = this.deviceService.getDeviceInfo();
  }

  ngOnInit() {
    if (!this.hasloadedDate) {
    this.loadInitialData();
    this.hasloadedDate = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasloadedDate) {
        this.loadInitialData()
        this.hasloadedDate = true;
      }
    }

  loadInitialData() {
    const encodedUser = this.cookieService.get('userdetails'); // Or 'username'
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
        if (this.loggedInUser?.documentId) {
          this.apiService.getAssessmentType(this.loggedInUser?.documentId).subscribe({
            next: (response: any) => {
          const newAssessmentType = response?.data?.assessment_type || [];

          // ✅ Replace old assessment_type with new one
          this.loggedInUser.assessment_type = newAssessmentType;

          // ✅ Save updated user object back to cookie
          const updatedEncoded = btoa(JSON.stringify(this.loggedInUser));
          this.cookieService.set('userdetails', updatedEncoded);

          // Optional: update local variable too
          this.assessmentTypes = newAssessmentType;
          debugger;
            },
            error: (error: any) => {
              console.error('Failed to fetch assessment types:', error);
              this.assessmentTypes = [];
              const errorMessage = error?.error?.error?.message || error?.message || 'Unknown error';
              this.loggingService.handleApiError(
                'Fetch Assessment Types for dropdown', // activity type
                'getAssessmentType', // function in which error occured
                APIEndpoints.userLogins, // request URL
                this.loggedInUser.documentId, // request parameter
                errorMessage, // error message
                error?.status, // error status
                this.device // device information
              );
            }
          });
        }
        this.selectedAssessment = null;
        this.assessmentNumber = '';
        this.loaded = true;
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('user');
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onGuidedTypeChange(event:any) {
    this.updateGuidedTypeLabel();
  }

  onInputChange() {
    if (!this.assessmentNumber) {
      this.isInvalidCode = false; 
    }
  }

  onAssessmentChange() {
  sessionStorage.setItem('selectedAssessment', this.selectedAssessment || '');

  // Find selected assessment object by name
  const selectedAssessmentObj = this.assessmentTypes.find(
    (x: any) => x.name?.toLowerCase() === this.selectedAssessment?.toLowerCase()
  );

  if (selectedAssessmentObj) {
    sessionStorage.setItem('selectedAssessmentDocId', selectedAssessmentObj.documentId || '');
    sessionStorage.setItem('selectedAssessmentId', (selectedAssessmentObj.id || '').toString());
    sessionStorage.setItem('selectedAssessmentDescription', selectedAssessmentObj.description || '');
    this.navigate = selectedAssessmentObj.navigate || '';
  } else {
    // Clear all if not found
    sessionStorage.setItem('selectedAssessmentDocId', '');
    sessionStorage.setItem('selectedAssessmentId', '');
    sessionStorage.setItem('selectedAssessmentDescription', '');
    this.navigate = '';
  }

  this.updateGuidedTypeLabel();
}

  getSelectedAssessmentDescription(): string {
    const selectedType = this.assessmentTypes.find(type => type.name === this.selectedAssessment);
    return selectedType?.description || 'Please select an assessment type.';
  }

  navigateWithHitsCache(targetRoute: string) {
    const cached = this.menuService.getHitsAssessment();
    if (cached) {
      sessionStorage.removeItem('isSSripa');
      sessionStorage.removeItem('isDanger');
      sessionStorage.removeItem('isWeb');  
      sessionStorage.setItem('isHits', 'true');      
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getHitsAssessmentQuestions().subscribe({
        next: (res: any) => {
          const { questions, answerOptions } = res;

          // Sort the multiple_answer_option for each question (if still needed)
          questions.forEach((q: any) => {
            q.multiple_answer_option.sort((a: any, b: any) => a.score - b.score);
            q.selected = null; // Reset selected for each question
          });
      
          // Store both questions and answerOptions in the service
          this.menuService.setHitsAssessment({ questions, answerOptions });
          sessionStorage.removeItem('isDanger');
          sessionStorage.removeItem('isSSripa');
          sessionStorage.removeItem('isWeb'); 
          sessionStorage.setItem('isHits', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load HITS data:', err);
          const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
          this.loggingService.handleApiError(
            'Failed to load HITS assessment questions and answers', // activity type
            'navigateWithHitsCache', // function in which error occured
            APIEndpoints.hitsAssessmentQuestions +' ,For answer API:' + APIEndpoints.scaleOptions, // request URL
            this.loggedInUser.documentId, // request parameter
            errorMessage, // error message
            err?.status, // error status
            this.device // device information
          );
        }
      });
    }
  }

  private updateGuidedTypeLabel() {
    // Update the label based on the selected guidedType
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
    
  }

  navigateWithSsripaCache(targetRoute: string) {
    const cached = this.menuService.getSsripaDataValue(); // Synchronous access
    if (cached) {
      sessionStorage.removeItem('isHits');
      sessionStorage.removeItem('isDanger');
      sessionStorage.removeItem('isWeb'); 
      sessionStorage.setItem('isSSripa', 'true');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getSripaa().subscribe({
        next: (quiz: any) => {
          this.menuService.setSsripaData(quiz || []); 
          sessionStorage.removeItem('isHits');// Update BehaviorSubject
          sessionStorage.removeItem('isDanger');
          sessionStorage.removeItem('isWeb'); 
          sessionStorage.setItem('isSSripa', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load SSRIPA data:', err);
          const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
          this.loggingService.handleApiError(
            'Failed to load SSRIPA assessment questions', // activity type
            'navigateWithSsripaCache', // function in which error occured
            APIEndpoints.ssripaQuestions, // request URL
            this.loggedInUser.documentId, // request parameter
            errorMessage, // error message
            err?.status, // error status
            this.device // device information
          );
        }
      });
    }
  }

  navigateWithDangerCache(targetRoute: string) {
    const cached = this.menuService.getDangerAssessment(); // Synchronous access
    if (cached) {
      sessionStorage.removeItem('isHits');
      sessionStorage.removeItem('isSSripa');
      sessionStorage.removeItem('isWeb'); 
      sessionStorage.setItem('isDanger', 'true');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getDAAssessmentQuestions().subscribe({
        next: (res: any) => {
          
          this.menuService.setDangerAssessment(res); 
          sessionStorage.removeItem('isHits');// Update BehaviorSubject
          sessionStorage.removeItem('isSSripa');
          sessionStorage.removeItem('isWeb'); 
          sessionStorage.setItem('isDanger', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load SSRIPA data:', err);
          const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
          this.loggingService.handleApiError(
            'Failed to load DA assessment questions', // activity type
            'navigateWithDangerCache', // function in which error occured
            APIEndpoints.daAssessmentQuestions, // request URL
            this.loggedInUser.documentId, // request parameter
            errorMessage, // error message
            err?.status, // error status
            this.device // device information
          );
        }
      });
    }
  }


  goToTest() {
    if (this.selectedAssessment) {
      this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
      sessionStorage.setItem('guidedType', this.guidedType);
      const assessmentName = this.navigate?.toLowerCase().trim();
      this.analytics.trackAssessmentStart(this.navigate?.trim());
      switch (assessmentName) {
        case 'hits':
        case 'hits assessment':
          this.navigateWithHitsCache('/hitsassessment');
          break;
        case 'da':
        case 'the danger assessment (da)':
          this.navigateWithDangerCache('/dangerassessment');
          break;
        case 'relationship assessment tool originally called web scale':
          this.router.navigate(['/relationship-assessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'signs of self-recognition in intimate partner abuse (ssripa)':
        case 'ssripa':
          this.navigateWithSsripaCache('/ssripariskassessment');
          break;
        case 'web':
        case 'web assessment':
        case "women's experience with battering":
          this.navigateWithRatsCache('/webassessment');
          break;
        default:
          console.warn('No matching route found for selected assessment.');
      }
    } else {
    }
  }

  goBack() {
    this.selectedAssessment = null;
    this.caseNumber = '';
    this.guidedType = 'staff-guided';
    this.updateGuidedTypeLabel();
  }

  stayLoggedIn() {
    const now = Date.now().toString();
    this.cookieService.set('loginTime', now, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
    });
  }


  async logout() {
    try {
      this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
      await this.menuService.logout();
      // this.guidedType = 'staff-guided';
    } catch (error: any) {
      const errorMsg = error?.error?.error?.message || error?.error?.message || error?.message || 'Failed to logout';
      const alert = await this.alertController.create({
        header: 'Logout Failed',
        message: errorMsg,
        buttons: ['OK']
      });
      await alert.present();
    }
  }


  navigateWithRatsCache(targetRoute: string) {
    const cached = this.menuService.getRatsAssessment();
    if (cached) {
      sessionStorage.removeItem('isHits');
      sessionStorage.removeItem('isSSripa');
      sessionStorage.removeItem('isDanger');
      sessionStorage.setItem('isWeb', 'true');  
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (res: any) => {
          sessionStorage.removeItem('isHits');
          sessionStorage.removeItem('isSSripa');
          sessionStorage.removeItem('isDanger');
          sessionStorage.setItem('isWeb', 'true');  

          let { questions, answerOptions } = res;
          // Sort the multiple_answer_option for each question (if still needed)
          questions.forEach((q: any) => {
            q.multiple_options_for_rat.sort((a: any, b: any) => a.score - b.score);
            q.selected = null; // Reset selected for each question
          });
          
          let sortedOptions = answerOptions.sort((a: any, b: any) => a.score - b.score);
          answerOptions = sortedOptions;
      
          // Store both questions and answerOptions in the service
          this.menuService.setRatsAssessment({ questions, answerOptions });
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load HITS data:', err);
          const errorMessage = err?.error?.error?.message || err?.message || 'Unknown';
          this.loggingService.handleApiError(
            'Failed to load WEB assessment questions and answers', // activity type
            'navigateWithRatsCache', // function in which error occured
            APIEndpoints.ratsAssessmentQuestions +' For answer API:' + APIEndpoints.ratScaleOptions, // request URL
            this.loggedInUser.documentId, // request parameter
            errorMessage, // error message
            err?.status, // error status
            this.device // device information
          );
        }
      });
    }
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

  viewResult(code: string) {
    this.isInvalidCode = false;
    code = code.trim();
    if (code && code.toLowerCase().includes('web-')) {
      this.fetchRatResults(code);
    } else if(code && code.toLowerCase().includes('hits-')) {
      this.isHitAssessment = true;
      const url = APIEndpoints.getHitsAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url, code);
    } else if(code && code.toLowerCase().includes('da-')) {
      this.isDaAssessment = true;
      const url = APIEndpoints.getDaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url, code);
    } else if(code && code.toLowerCase().includes('dai-')) {
    } else if(code && code.toLowerCase().includes('cts-')) {
    } else if(code && code.toLowerCase().includes('ssripa-')) {
      this.isSSripa = true;
      const url = APIEndpoints.getSSripaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url, code);
    } else {
      this.selectedAssessment = '';
      this.isInvalidCode = true;
    }
  }

  fetchRatResults(code: string) {
    this.apiService.getRatsResult(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
          this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
        }
      },
      error: (error: any) => {
        console.error('Rat Assessment fetch error:', error);
      const errorMessage = error?.error?.error?.message || error?.message || 'Unknown error';
        this.showToast(String(error), 3000, 'top');
        let requestUrl = APIEndpoints.ratResult + code;
        this.loggingService.handleApiError(
          'Fetch WEB Assessment', // activity type
          'fetchRatResults', // function in which error occured
          requestUrl, // request URL
          code, // request parameter
          errorMessage, // error message
          error?.status, // error status,
          this.device // device information
        );
      }
    })
  }

  async GetAssessmentResponsebycode(url: string, code: string) {
    if (url && this.isDaAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
        this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
      } catch (error: any) {
        console.error('DA Assessment fetch error:', error);
        const errorMessage = error?.error?.error?.message || error?.message || 'Unknown error';
        this.showToast(String(error), 3000, 'top');
        this.loggingService.handleApiError(
          'Fetch DA Assessment', // activity type
          'GetAssessmentResponsebycode', // function in which error occured
          url, // request URL
          code, // request parameter
          error?.message, // error message
          error?.status, // error status,
          this.device // device information
        );
      }
    }
  
    if (url && this.isHitAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
        this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
      } catch (error: any) {
        console.error('HITS Assessment fetch error:', error);
        const errorMessage = error?.error?.error?.message || error?.message || 'Unknown error';
        this.showToast(String(error), 3000, 'top');
        await this.loggingService.handleApiError(
          'Fetch HITS Assessment', // activity type
          'GetAssessmentResponsebycode', // function in which error occured
          url, // request URL
          code, // request parameter
          errorMessage, // error message
          error?.status, // error status,
          this.device // device information
        );
      }
    }
  
    if (url && this.isSSripa) {
      this.apiService.getAssessmentResponse(url).subscribe(
        (res: any) => {
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
        this.isInvalidCode = false;
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      this.assessmentNumber = '';
        },
        (error) => { 
          console.error('SSRIPA Assessment fetch error:', error);
          const errorMessage = error?.error?.error?.message || error?.message || 'Unknown error';
          this.showToast(String(error), 3000, 'top');
          this.loggingService.handleApiError(
            'Fetch SSripa Assessment', // activity type
            'GetAssessmentResponsebycode', // function in which error occured
            url, // request URL
            code, // request parameter
            errorMessage, // error message
            error?.status, // error status,
            this.device // device information
          );
        }
      );
    }
  }


}
