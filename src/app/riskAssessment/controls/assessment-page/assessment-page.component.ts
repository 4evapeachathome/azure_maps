import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
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
  assessmentTypes: { id: number; name: string; description: string; navigate:string }[] = [];
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

  constructor(
    private menuService: MenuService,
    private router: Router,
    private cookieService: CookieService,
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

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
          this.apiService.getAssessmentType(this.loggedInUser.documentId).subscribe({
            next: (response: any) => {
              
              this.assessmentTypes = response?.data?.assessment_type || [];
            },
            error: (error: any) => {
              console.error('Failed to fetch assessment types:', error);
              this.assessmentTypes = [];
            }
          });
        }
        this.selectedAssessment = null;
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

  onAssessmentChange() {
    sessionStorage.setItem('selectedAssessment', this.selectedAssessment || '');
    let selectedAssessmentId = this.assessmentTypes.filter((type: any) => {
      if (type.name?.toLowerCase() == this.selectedAssessment?.toLowerCase()) {
            return type;
        }
    });
    sessionStorage.setItem('selectedAssessmentId', (selectedAssessmentId[0].id || '') as any);
    console.log('this.selectedAssessment>>>>>>', this.selectedAssessment, this.assessmentTypes, selectedAssessmentId);

    // Extract and store the navigate value
    this.navigate = selectedAssessmentId[0]?.navigate || '';

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
          sessionStorage.setItem('isHits', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load HITS data:', err);
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
      sessionStorage.setItem('isSSripa', 'true');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getSripaa().subscribe({
        next: (quiz: any) => {
          this.menuService.setSsripaData(quiz || []); 
          sessionStorage.removeItem('isHits');// Update BehaviorSubject
          sessionStorage.removeItem('isDanger');
          sessionStorage.setItem('isSSripa', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load SSRIPA data:', err);
        }
      });
    }
  }

  navigateWithDangerCache(targetRoute: string) {
    const cached = this.menuService.getDangerAssessment(); // Synchronous access
    if (cached) {
      sessionStorage.removeItem('isHits');
      sessionStorage.removeItem('isSSripa');
      sessionStorage.setItem('isDanger', 'true');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getDAAssessmentQuestions().subscribe({
        next: (res: any) => {
          
          this.menuService.setDangerAssessment(res); 
          sessionStorage.removeItem('isHits');// Update BehaviorSubject
          sessionStorage.removeItem('isSSripa');
          sessionStorage.setItem('isDanger', 'true');
          this.router.navigate([targetRoute]);
        },
        error: (err) => {
          console.error('Failed to load SSRIPA data:', err);
        }
      });
    }
  }


  goToTest() {
    if (this.selectedAssessment) {
      this.hasloadedDate = false; // Reset the flag to allow reloading data
      sessionStorage.setItem('guidedType', this.guidedType);
      const assessmentName = this.navigate?.toLowerCase().trim();
      console.log('assessmentName>>>>>>>>', assessmentName);
      sessionStorage.setItem('caseNumber', this.caseNumber);
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
      console.log('Please select an assessment type');
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
    console.log('navigateWithRatsCache selectedAssessment*******', this.selectedAssessment);
    if (cached) {
      sessionStorage.removeItem('isHits');
      sessionStorage.removeItem('isSSripa');
      sessionStorage.removeItem('isDanger');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (res: any) => {
          sessionStorage.removeItem('isHits');
          sessionStorage.removeItem('isSSripa');
          sessionStorage.removeItem('isDanger');

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
        }
      });
    }
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

  viewResult(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.fetchRatResults(code);
    } else if(code && code.toLowerCase().includes('hits-')) {
      this.isHitAssessment = true;
      const url = APIEndpoints.getHitsAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
    } else if(code && code.toLowerCase().includes('da-')) {
      this.isDaAssessment = true;
      const url = APIEndpoints.getDaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
    } else if(code && code.toLowerCase().includes('dai-')) {
    } else if(code && code.toLowerCase().includes('cts-')) {
    } else if(code && code.toLowerCase().includes('ssripa-')) {
      this.isSSripa = true;
      const url = APIEndpoints.getSSripaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
    } else {
      this.selectedAssessment = '';
    }
  }

  fetchRatResults(code: string) {
    this.apiService.getRatsResult(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
        }
      },
      error: (error: any) => {
        const errorMsg = error?.error?.message || error?.message || 'Failed to fetch the assessment';
        this.showToast(errorMsg, 3000, 'top');
      }
    })
  }

  async GetAssessmentResponsebycode(url: string) {
    if (url && this.isDaAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
      } catch (error) {
        console.error('DA Assessment fetch error:', error);
        this.showToast('Failed to fetch the assessment', 3000, 'top');
      }
    }
  
    if (url && this.isHitAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
      } catch (error) {
        console.error('HITS Assessment fetch error:', error);
        this.showToast('Failed to fetch the assessment', 3000, 'top');
      }
    }
  
    if (url && this.isSSripa) {
      this.apiService.getAssessmentResponse(url).subscribe(
        (res: any) => {
        const response = res?.data;
        this.router.navigateByUrl('/viewresult?code=' + response?.AssessmentGuid);
        },
        (error) => { 
          console.error('SSRIPA Assessment fetch error:', error);
          this.showToast('Failed to fetch the assessment', 3000, 'top');
        }
      );
    }
  }


}
