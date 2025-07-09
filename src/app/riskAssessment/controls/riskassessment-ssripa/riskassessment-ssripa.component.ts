import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { Utility } from 'src/shared/utility';

@Component({
  selector: 'app-riskassessment-ssripa',
  templateUrl: './riskassessment-ssripa.component.html',
  styleUrls: ['./riskassessment-ssripa.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule]
})
export class RiskassessmentSSripaComponent  implements OnInit {
  loggedInUser: any = null;
  caseNumber: string = '';

  guidedType: string = 'self-directed'; // Default value
  guidedTypeLabel: string = 'Self-Directed';
@Input() reloadFlag: boolean = false; // Input property to trigger reload
  quizTitle = '';
sripa: any[] = [];
yesanswer: any[] = [];
currentIndex = 0;
showAnswers: boolean[] = [];
selectedOptions: string[] = [];
showresults: boolean = false;
@Input() sripaGuid: any;
hasloadedDate: boolean = false;
device: any;

  constructor(private router: Router,
      private apiService: ApiService,
      private menuService: MenuService,
      private cookieService: CookieService,
      private alertController: AlertController,
      private analytics:PageTitleService,
      private loggingService: LoggingService,
      private deviceService: DeviceDetectorService) {
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
            this.loadInitialData();
            this.hasloadedDate = true;
          }
        }
  loadInitialData(){
    const encodedUser = this.cookieService.get('userdetails');
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('userdetails');
        this.router.navigate(['/login']);
        return;
      }
    } else {
      this.router.navigate(['/login']);
      return;
    }
    const storedGuidedType = sessionStorage.getItem('guidedType');

    // If a value exists in sessionStorage, use it; otherwise, keep the default
    if (storedGuidedType) {
      this.guidedType = storedGuidedType;
    }

    // Update the label based on the retrieved guidedType
    this.updateGuidedTypeLabel();
    this.loadQuiz();
  }

  loadQuiz(): void {
    const cachedData = this.menuService.getSsripaDataValue(); 
    if (cachedData) {
      this.quizTitle = 'Signs of Self-Recognition in Intimate Partner Abuse - SSRIPA';
      this.sripa = cachedData;
      this.showAnswers = new Array(this.sripa.length).fill(false);
      this.selectedOptions = new Array(this.sripa.length).fill(null);
    } else {
      try {
        this.apiService.getSripaa().subscribe({
          next: (quiz) => {
            if (quiz) {
              this.quizTitle = 'Signs of Self-Recognition in Intimate Partner Abuse - SSRIPA';
              this.sripa = quiz || [];
              this.showAnswers = new Array(this.sripa.length).fill(false);
              this.selectedOptions = new Array(this.sripa.length).fill(null);
              this.menuService.setSsripaData(this.sripa); // Update BehaviorSubject
            }
          },
          error: (err) => {
            console.error('Failed to load SSRIPA quiz:', err);
            const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
            this.loggingService.handleApiErrorRiskAssessment(
              'Failed to load SSRIPA quiz:', // activity type
              'loadQuiz', // function in which error occured
              APIEndpoints.ssripaQuestions, // request URL
              '', // request parameter
              errorMessage, // error message
              err?.status, // error status
              this.device // device information
            );
          }
        });
      } catch (error:any) {
        console.error('Unexpected error while loading SSRIPA quiz:', error);
        this.loggingService.handleApiErrorRiskAssessment(
          'Failed to load SSRIPA quiz:', // activity type
          'loadQuiz', // function in which error occured
          APIEndpoints.ssripaQuestions, // request URL
          this.loggedInUser.documentId, // request parameter
          error?.message, // error message
          error?.status, // error status
          this.device // device information
        );
      }
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  
  nextSlide(): void {
    if (this.currentIndex < this.sripa.length) {
      this.currentIndex++;
    }
  }
  
  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  selectOption(index: number, option: 'yes' | 'no'): void {
    this.selectedOptions[index] = option;
    this.showresults = this.selectedOptions.some(opt => opt !== null);
  }

  checkHighSeverityYes(): boolean {
    return this.sripa.some((q, i) => 
      q.severity?.toLowerCase() === 'high' &&
      this.selectedOptions[i]?.trim().toLowerCase() === 'yes'
    );
  }

  async submitAssessmentResponse() {
    // Create the alert using AlertController
    const alert = await this.alertController.create({
      header: 'Confirm Submission',
      message: 'Are you sure you want to submit the assessment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'OK',
          handler: () => {
            const respondedQuestions = this.sripa.map((q, index) => {
              const selected = this.selectedOptions[index];
              const answer = selected ? selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase() : '';
              return {
                question: q.text,
                answer: answer
              };
            });

            const numQuestionsAnswered = respondedQuestions.filter(r => r.answer !== '').length;

            const isHighSeverityYes = this.checkHighSeverityYes();
  
            const payload = {
              data: {
                response: respondedQuestions,
                AssessmentGuid: this.sripaGuid,
                support_service: this.loggedInUser?.support_service?.documentId ?? null,
                CaseNumber: this.caseNumber,
                guidedType: this.guidedType,
                answeredHighratedquestion: isHighSeverityYes,
                IsAssessmentfromEducationModule: false,
                assessment_type: sessionStorage.getItem('selectedAssessmentDocId') || ''
              }
            };
  
            // Subscribe to the Observable and log the response
            this.apiService.postSsripaAssessmentResponse(payload).subscribe({
              next: (response) => {
                   this.analytics.trackAssessmentSubmit('SSRIPA_Risk_Module',numQuestionsAnswered);
                sessionStorage.setItem('ssripaAssessmentResult', JSON.stringify({
                  summary: respondedQuestions,
                  ssripasurl: `${window.location.origin}/viewresult?code=${response.data.AssessmentGuid}`,
                  caseNumber: this.caseNumber,
                  answeredHighratedquestion: isHighSeverityYes
                }));
                this.hasloadedDate = false; // Reset to allow reloading
                this.router.navigate(['/riskassessmentsummary']);
              },
              error: (err) => {
                console.error('Failed to submit assessment response:', err);
                const errorMessage = err?.error?.error?.message || err?.message || 'Failed to submit assessment response';
                this.loggingService.handleApiErrorRiskAssessment(
                  'Failed to submit SSRIPA assessment response', // activity type
                  'loadQuiz', // function in which error occured
                  APIEndpoints.saveSSripaAssessment, // request URL
                  this.loggedInUser.documentId, // request parameter
                  errorMessage, // error message
                  err?.status, // error status
                  this.device // device information
                );
              }
            });
          }
        }
      ]
    });
  
    // Present the alert
    await alert.present();
  }
  


  goBack() {
    this.hasloadedDate = false;
    this.caseNumber = '';
    this.router.navigate(['/riskassessment']);
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
      this.hasloadedDate = false;
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

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Directed';
  }


}
