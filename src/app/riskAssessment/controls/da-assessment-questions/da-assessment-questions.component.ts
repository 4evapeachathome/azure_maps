import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { Utility } from 'src/shared/utility';

@Component({
  selector: 'app-da-assessment-questions',
  templateUrl: './da-assessment-questions.component.html',
  styleUrls: ['./da-assessment-questions.component.scss'],
  standalone: false
})
export class DaAssessmentQuestionsComponent  implements OnInit {
 loggedInUser: any = null;
  caseNumber: string = '';
  loaded: boolean = false;
  questionsPerPage = 5;
  currentPageIndex = 0; // starts from 0
  questions: any[] = [];
  daAssessment:any;
  hitsQuestions: any[] = [];
  scaleOptions: string[] = [];
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  @Input() daGuid:any;
  daQues:any;
  hasloadedDate: boolean = false;
  @Input() reloadFlag: boolean = false; 
  submitted: boolean = false;
  hasValidationError:boolean = false;
  device: any;

constructor(
    private router: Router,
    private apiService: ApiService,
    private menuService: MenuService,
    private analytics: PageTitleService,
    private cookieService: CookieService,
    private alertController: AlertController,
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
        this.loadInitialData(); 
        this.hasloadedDate = true;
      }
    }

  loadInitialData() {
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
    this.submitted = false;
    this.hasValidationError = false;

    // If a value exists in sessionStorage, use it; otherwise, keep the default
    if (storedGuidedType) {
      this.guidedType = storedGuidedType;
    }

    // Update the label based on the retrieved guidedType
    this.updateGuidedTypeLabel();

    const cachedHits = this.menuService.getDangerAssessment();
    

if (cachedHits && cachedHits.data && cachedHits.data.length > 0) {
  const sortedData = cachedHits.data.sort((a:any, b:any) => a.questionOrder - b.questionOrder);
  this.daAssessment = this.initializeAssessmentData(sortedData);
  this.daQues = this.daAssessment;
    } else {
      // Load from API if cache is empty
      this.apiService.getDAAssessmentQuestions().subscribe({
        next: (res: any) => {
          if(res && res.data && res.data.length > 0) {
            const sortedData = res.data.sort((a:any, b:any) => a.questionOrder - b.questionOrder);
            this.daAssessment = this.initializeAssessmentData(sortedData);  
            this.daQues = this.daAssessment;     
            this.menuService.setDangerAssessment(res);
          }
        },
        error: (err:any) => {
          console.error('Failed to load DA data from API:', err);
         const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';


          this.loggingService.handleApiError(
            'Failed to load DA assessment questions', // activity type
            'loadInitialData', // function in which error occured
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

initializeAssessmentData(data: any[]) {
  try {
    return data.map(q => ({
      ...q,
      selected: null,
      showValidation: false,
      DAChild: Array.isArray(q.DAChild)
        ? q.DAChild.map((sub: any) => ({
            ...sub,
            selected: null
          }))
        : []
    }));
  } catch (err: any) {
    console.error('Error in initializeAssessmentData:', err);
             const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
    this.loggingService.handleApiError(
      'Failed to initialize assessment data', // activityType
      'initializeAssessmentData',             // errorFunction
      '',                                     // url (not an API call)
      '',    // requestParams
      errorMessage,        // errorMessage
      0,                                      // errorStatus (0 for local error)
      this.device                             // device info
    );
    throw err; // optionally rethrow to propagate the error
  }
}

   private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }
  

  getCharFromCode(code: number): string {
    return String.fromCharCode(code);
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

  async submitDangerAssessment() {
            //Validation to check all questions are answered
            this.submitted = true;

            // Mark validation only on main questions
            let hasUnanswered = false;
          
            this.daAssessment.forEach((q: any) => {
              const unanswered = !q.selected;
              q.showValidation = unanswered;
              if (unanswered) {
                hasUnanswered = true;
              }
            });
          
            this.hasValidationError = hasUnanswered;
          
            if (hasUnanswered) return;

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

            let totalScore = 0;
            const answerSummary: { question: string; answer: string; DAChild: { question: string; answer: string }[] }[] = [];
  
            // Process main questions
            for (const question of this.daQues) {
              const selected = question.selected;
              const isYes = selected && selected === 'Yes';
              const selectedAnswer = selected
                ? selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase()
                : '';
  
              // Create a question object with nested DAChild
              const questionEntry = {
                question: question.questionText,
                answer: selectedAnswer,
                DAChild: [] as { question: string; answer: string }[]
              };
  
              // Calculate score for main question
              if (isYes) {
                const weight = question.weightage_score !== null ? question.weightage_score : question.score;
                totalScore += weight;
              }
  
              // Process sub-questions (like 3a)
              if (question.DAChild && question.DAChild.length > 0) {
                for (const subQuestion of question.DAChild) {
                  const subSelected = subQuestion.selected;
                  const isSubYes = subSelected && subSelected === 'Yes';
                  const selectedAnswer = subSelected
                    ? subSelected.charAt(0).toUpperCase() + subSelected.slice(1).toLowerCase()
                    : '';
  
                  // Add sub-question to DAChild array
                  questionEntry.DAChild.push({
                    question: subQuestion.questionText,
                    answer: selectedAnswer
                  });
  
                  // Calculate score for sub-question
                  if (isSubYes && subQuestion.weightageScore) {
                    totalScore += subQuestion.weightageScore;
                  }
                }
              }
  
              // Add the question entry to answerSummary
              answerSummary.push(questionEntry);
            }
  
            let levelOfDanger: string;
            if (totalScore < 8) {
              levelOfDanger = 'Variable';
            } else if (totalScore >= 8 && totalScore <= 13) {
              levelOfDanger = 'Increased';
            } else if (totalScore >= 14 && totalScore <= 17) {
              levelOfDanger = 'Severe';
            } else if (totalScore >= 18) {
              levelOfDanger = 'Extreme';
            } else {
              levelOfDanger = 'Unknown';
            }
  
            const payload = {
              data: {
                AssessmentGuid: this.daGuid,
                response: answerSummary,
                Score: totalScore,
                guidedType: this.guidedType,
                CaseNumber: this.caseNumber,
                support_service: this.loggedInUser?.support_service?.documentId,
                Levelofdanger: levelOfDanger,
                assessment_type: sessionStorage.getItem('selectedAssessmentDocId') || ''
              }
            };
  
            this.apiService.saveDaAssessmentResponse(payload).subscribe({
              next: (res) => {
                this.analytics.trackAssessmentSubmit('DA');
                sessionStorage.setItem('daAssessmentResult', JSON.stringify({
                  totalScore,
                  summary: answerSummary,
                  Levelofdanger: levelOfDanger,
                  daurl: `${window.location.origin}/viewresult?code=${res.data.AssessmentGuid}`,
                  caseNumber: this.caseNumber
                }));
                this.hasloadedDate = false;
                this.router.navigate(['/riskassessmentsummary']);
              },
              error: (err) => {
                console.error('Failed to save assessment', err);
                const errorMessage = err?.error?.error?.message || err?.message || 'Unknown error';
                this.loggingService.handleApiError(
                  'Failed to save assessment DA assessment', // activity type
                  'submitDangerAssessment', // function in which error occured
                  APIEndpoints.daAssessmentResponse, // request URL
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
  
    await alert.present();
  }


  onAnswerChange(question: any) {
  
    // After submit, dynamically clear red highlight if user answers
    if (this.submitted) {
      question.showValidation = !question.selected;
  
      // Recalculate validation error state for the whole form
      const hasUnanswered = this.daAssessment.some((q: any) => !q.selected);
      this.hasValidationError = hasUnanswered;
    }
    if (question.selected === 'No' && Array.isArray(question.DAChild)) {
      question.DAChild.forEach((sub: any) => {
        sub.selected = null;
        sub.showValidation = false;
      });
    }
  }
  

}
