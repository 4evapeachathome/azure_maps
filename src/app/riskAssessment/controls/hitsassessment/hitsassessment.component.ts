import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { MenuService } from 'src/shared/menu.service';
import { Utility } from 'src/shared/utility';

@Component({
  selector: 'app-hitsassessment',
  templateUrl: './hitsassessment.component.html',
  styleUrls: ['./hitsassessment.component.scss'],
    standalone: true,
          imports: [CommonModule, IonicModule, FormsModule]
})
export class HitsassessmentComponent  implements OnInit {
  submitted:boolean = false;
  loggedInUser: any = null;
  caseNumber: string = '';
  loaded: boolean = false;
  hitsQuestions: any[] = [];
  scaleOptions: string[] = [];
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  @Input() hitsGuid:any;
  hasloadedDate: boolean = false;
  hasValidationError: boolean = false; // Flag to track validation errors
  @Input() reloadFlag: boolean = false; // Input property to trigger reload

  constructor(
    private router: Router,
    private apiService: ApiService,
    private menuService: MenuService,
    private cookieService: CookieService,
    private alertController: AlertController,
    private analytics: PageTitleService
  ) { }

   ngOnInit() {
     if (!this.hasloadedDate) {
     this.loadinitialData();
     this.hasloadedDate = true;
     }
   }
 
   ngOnChanges(changes: SimpleChanges) {
       if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasloadedDate) {
         this.loadinitialData();
         this.hasloadedDate = true;
       }
     }
  

  loadinitialData() {
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
  
    const cachedHits = this.menuService.getHitsAssessment();
if (cachedHits && cachedHits.questions && cachedHits.questions.length > 0) {
  this.setupHitsQuestions(cachedHits.questions, cachedHits.answerOptions);
    } else {
      // Load from API if cache is empty
      this.apiService.getHitsAssessmentQuestions().subscribe({
        next: (hitsData: any) => {
          const { questions, answerOptions } = hitsData;

    // Sort the multiple_answer_option for each question (if still needed)
    questions.forEach((q: any) => {
      q.multiple_answer_option.sort((a: any, b: any) => a.score - b.score);
    });

    // Store both questions and answerOptions in the service
    this.menuService.setHitsAssessment({ questions, answerOptions });
    this.setupHitsQuestions(questions, answerOptions);
        },
        error: (err:any) => {
          console.error('Failed to load HITS data from API:', err);
        }
      });
    }}


  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }

  


  setupHitsQuestions(questions: any[], answerOptions: any[]) {
    // Sort answer options by score to ensure correct order
    const sortedOptions = answerOptions.sort((a, b) => a.score - b.score);
  
    // Map the sorted options to the scale format (e.g., "1. NEVER", "2. RARELY", etc.)
    this.scaleOptions = sortedOptions.map(opt => `${opt.score}. ${opt.label}`);
  
    // Map questions to the hitsQuestions format
    this.hitsQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.question_text,
      selected: null,
      showValidation: false,
      weight_critical_alert: q.weight_critical_alert,
      options: sortedOptions.map((opt: any) => ({
        score: opt.score,
        label: opt.label
      })),
      criticalOptions: (q.multiple_answer_option || []).map((opt: any) => ({
        score: opt.score,
        label: opt.label
      }))
    }));
  
    this.loaded = true;
  }
  
  isUnanswered(question: any): boolean {
    return this.submitted && !question.selected;
  }

  onAnswerChange(question: any) {
    if (this.submitted) {
      question.showValidation = !question.selected;
  
      // Recalculate overall form validity
      const hasUnanswered = this.hitsQuestions.some(q => !q.selected);
      this.hasValidationError = hasUnanswered;
    }
  }

  async submit() {
                // Proceed with the original logic if OK is clicked
                this.submitted = true;
                let hasUnanswered = false;
              
                this.hitsQuestions.forEach(q => {
                  const isUnanswered = !q.selected;
                  q.showValidation = isUnanswered;
                  if (isUnanswered) hasUnanswered = true;
                });
              
                this.hasValidationError = hasUnanswered;
              
                if (hasUnanswered) {
                  return; // ❌ block submission if unanswered
                }
                           
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
     
            
            // Reset the validation error flag
            let totalScore = 0;
            const answerSummary: { question: string; answer: string | null }[] = [];
            let criticalAlert = false;
  
            for (const question of this.hitsQuestions) {
              const selected = question.selected;
              const selectedScore = selected ? selected.score : null;
              const selectedAnswer = selected ? selected.label : null;
  
              if (selectedScore !== null) {
                totalScore += selectedScore;
              }
  
              answerSummary.push({
                question: question.text,
                answer: selectedAnswer
              });
  
              if (!criticalAlert && question.weight_critical_alert && selected) {
                const matchFound = question.criticalOptions.some((opt: any) =>
                  opt.score === selected.score || opt.label === selected.label
                );
                if (matchFound) {
                  criticalAlert = true;
                }
              }
            }
  
            const payload = {
              data: {
                AssessmentGuid: this.hitsGuid,
                response: answerSummary,
                Score: totalScore,
                guidedType: this.guidedType,
                isCriticalAlert: criticalAlert,
                CaseNumber: this.caseNumber,
                support_service: this.loggedInUser?.support_service?.documentId,
                assessment_type: sessionStorage.getItem('selectedAssessmentDocId') || ''
              }
            };
  
            this.apiService.postHitsAssessmentResponse(payload).subscribe({
              next: (res) => {
                this.analytics.trackAssessmentSubmit('HITS');
                sessionStorage.setItem('hitsAssessmentResult', JSON.stringify({
                  totalScore,
                  summary: answerSummary,
                  criticalAlert,
                  hitsurl: `${window.location.origin}/viewresult?code=${res.data.AssessmentGuid}`,
                  caseNumber: res?.data?.CaseNumber
                }));
                this.hasloadedDate = false; // Reset the flag to allow reloading
                this.router.navigate(['/riskassessmentsummary']);
              },
              error: (err) => {
                console.error('Failed to save assessment', err);
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

}
