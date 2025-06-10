import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

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
    private alertController: AlertController
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails'); // Or 'username'
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
        console.log('this.loggedInUser@@@@@@', this.loggedInUser);
        // let obj = {
        //         "id": 2,
        //         "documentId": "fb19slqtj667jlt58ipssahn",
        //         "name": "RATS",
        //         "description": "Rats assessment"
        //       };
        // this.loggedInUser?.assessment_type.push(obj);
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
    debugger;
    let selectedAssessmentId = this.assessmentTypes.filter((type: any) => {
      if(type.name == this.selectedAssessment) {
        return type;
      }
    });
    console.log('selectedAssessmentId>>>>>>>', selectedAssessmentId);
    sessionStorage.setItem('selectedAssessmentId', (selectedAssessmentId[0].id || '') as any);
    console.log('Selected assessment:', this.selectedAssessment);
  }

  getSelectedAssessmentDescription(): string {
    const selectedType = this.assessmentTypes.find(type => type.name === this.selectedAssessment);
    return selectedType?.description || 'Please select an assessment type.';
  }

  navigateWithHitsCache(targetRoute: string) {
    const cached = this.menuService.getHitsAssessment();
    if (cached) {
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
      sessionStorage.setItem('isSSripa', 'true');
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getSripaa().subscribe({
        next: (quiz: any) => {
          this.menuService.setSsripaData(quiz || []); // Update BehaviorSubject
          sessionStorage.setItem('isSSripa', 'true');
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
          this.router.navigate(['/dangerassessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'relationship assessment tool originally called web scale':
          this.router.navigate(['/relationship-assessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'signs of self-recognition in intimate partner abuse (ssripa)':
          this.navigateWithSsripaCache('/ssripariskassessment');
          break;
        case 'web':
        case 'web assessment':
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
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: () => {
            this.selectedAssessment = null;
            this.guidedType = 'staff-guided';
            this.cookieService.delete('username');
            this.cookieService.delete('loginTime');
            this.cookieService.delete('userdetails');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
  
    await alert.present();
  }


  navigateWithRatsCache(targetRoute: string) {
    const cached = this.menuService.getRatsAssessment();
    if (cached) {
      this.router.navigate([targetRoute]);
    } else {
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (res: any) => {
          const { questions, answerOptions } = res;
          console.log('getRatsAssessmentQuestions res>>>>>', res);
          // Sort the multiple_answer_option for each question (if still needed)
          questions.forEach((q: any) => {
            q.multiple_options_for_rat.sort((a: any, b: any) => a.score - b.score);
          });
      
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

}
