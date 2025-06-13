import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
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
  assessmentTypes: { id: number; name: string; description: string }[] = [];
  guidedTypeLabel: string = 'Staff-Guided';
  constructor(
    private menuService: MenuService,
    private router: Router,
    private cookieService: CookieService,
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    const encodedUser = this.cookieService.get('userdetails'); // Or 'username'
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
        this.assessmentTypes = this.loggedInUser?.assessment_type || [];
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
      if(type.name == this.selectedAssessment) {
        return type;
      }
    });
    sessionStorage.setItem('selectedAssessmentId', (selectedAssessmentId[0].id || '') as any);
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
          //debugger;
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
      sessionStorage.setItem('guidedType', this.guidedType);
      const assessmentName = this.selectedAssessment?.toLowerCase().trim();
      sessionStorage.setItem('caseNumber', this.caseNumber);
      switch (assessmentName) {
        case 'hits':
        case 'hits assessment':

          this.navigateWithHitsCache('/hitsassessment');
          break;
        case 'conflict tactic scale 2':
          this.router.navigate(['/cts2'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'danger assessment for immigrants':
          this.router.navigate(['/danger-assessment-immigrants'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'da':
        case 'the danger assessment (da)':
          this.navigateWithDangerCache('/dangerassessment');
          break;
        case 'relationship assessment tool originally called web scale':
          this.router.navigate(['/relationship-assessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'signs of self-recognition in intimate partner abuse (ssripa)':
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
    this.menuService.logout().then(() => {
      // this.guidedType = 'staff-guided';
    }).catch(error => {
      this.showToast(error.error.error.message || 'Failed to logout', 3000, 'top');
    });
  }


  navigateWithRatsCache(targetRoute: string) {
    const cached = this.menuService.getRatsAssessment();
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

}
