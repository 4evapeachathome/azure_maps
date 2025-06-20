import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { getConstant } from 'src/shared/constants';
import { MenuService } from 'src/shared/menu.service';
import { presentToast, Utility } from 'src/shared/utility';

@Component({
  selector: 'app-rat-assessment-questions',
  templateUrl: './rat-assessment-questions.component.html',
  styleUrls: ['./rat-assessment-questions.component.scss'],
  standalone: false
})
export class RatAssessmentQuestionsComponent  implements OnInit {
  loggedInUser: any = null;
  caseNumber: string = '';
  loaded: boolean = false;
  ratsQuestions: any[] = [];
  scaleOptions: string[] = [];
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  selectedAssessment: string = ''; 
  @Input() webGuid:any;
  hasloadedDate: boolean = false;
  @Input() reloadFlag: boolean = false; // Input property to trigger reload
  submitted: boolean = false;
  hasValidationError: boolean = false; // Flag to track validation errors

  constructor(
      private router: Router,
      private apiService: ApiService,
      private menuService: MenuService,
      private cookieService: CookieService,
      private alertController: AlertController,
      private toastController: ToastController,
      private cdRef:ChangeDetectorRef) { }

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

    this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || '';

    const cachedRats = this.menuService.getRatsAssessment();
    if (cachedRats && cachedRats.questions && cachedRats.questions.length > 0) {
      // answerOptions should be defined in the cachedRats object
      cachedRats.questions.forEach((q: any) => {
        q.selected = null; // Reset selected for each question
      });

      cachedRats.questions = cachedRats.questions.sort((a: any, b: any) => a.questionOrder - b.questionOrder);
      this.setupRatsQuestions(cachedRats.questions, cachedRats.answerOptions);
    } else {
      // Load from API if cache is empty
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (webData: any) => {
          let { questions, answerOptions } = webData;
          this.cdRef.detectChanges();
          // Sort the multiple_options_for_rat for each question (if still needed)
          questions.forEach((q: any, index: number) => {
            q.multiple_options_for_rat.sort((a: any, b: any) => a.score - b.score);
            q.selected = null; // Reset selected for each question
          });

          // Sort questions by questionOrder in ascending order
          questions = questions.sort((a: any, b: any) => a.questionOrder - b.questionOrder);

          let sortedOptions = answerOptions.sort((a: any, b: any) => a.score - b.score);
          answerOptions = sortedOptions;

          // Store both questions and answerOptions in the service
          this.menuService.setRatsAssessment({ questions, answerOptions });
          this.setupRatsQuestions(questions, answerOptions);
        },
        error: (err: any) => {
          console.error('Failed to load HITS data from API:', err);
        }
      });
    }
    if(sessionStorage.getItem('caseNumber')) {
      this.caseNumber = sessionStorage.getItem('caseNumber') || '';
    }
  }

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }

  setupRatsQuestions(questions: any[], answerOptions: any[]) {
    const scaleSet = new Set<string>();
    answerOptions.forEach((opt: any) => {
      scaleSet.add(`${opt.score}. ${opt.Label}`);
    });
    this.cdRef.detectChanges();

    this.scaleOptions = [...scaleSet];
  
    this.ratsQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.question_text,
      selected: null,
      showValidation: false,
      weight_critical_alert: q.weight_critical_alert,
      options: answerOptions.map((opt: any) => ({
        score: opt.score,
        Label: opt.Label
      })),
      criticalOptions: (q.multiple_options_for_rat || []).map((opt: any) => ({
        score: opt.score,
        label: opt.Label
      }))
    }));
    // Reset selected for each question
    this.ratsQuestions.forEach((q: any) => { 
      q.selected = null; // Reset selected for each question
    });
    this.cdRef.detectChanges();
  
    this.loaded = true;
  }

  async submit() {
      const alert = await this.alertController.create({
      header: 'Confirm Submission',
      message: 'Are you sure you want to submit the assessment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Submission canceled');
          }
        },
        {
          text: 'OK',
          handler: () => {

            

          const unanswered = this.ratsQuestions.filter(q => {
            q.showValidation = !q.selected; // 🔴 Mark if unanswered
          return !q.selected;
           });

        if (unanswered.length > 0) {
        this.submitted = true;
        this.hasValidationError = true;
        return;
        }
        this.hasValidationError = false;


            let totalScore = 0;
            // const answerSummary: { questionId: number; questionText: string; selectedScore: number | null; answer: string, question: string }[] = [];
            const answerSummary: { question: string, answer: boolean }[] = [];
            let criticalAlert = false;

            // Single loop to calculate totalScore, build answerSummary, and check for critical alert
            for (const question of this.ratsQuestions) {
              // Handle selected score for totalScore and answerSummary
              const selectedScore = question.selected ? question.selected.score : null;
              if (selectedScore !== null) {
                totalScore += Number(selectedScore);
              }

              // response: resJson, // JSON.stringify(resJson),
              answerSummary.push({
                answer: question?.selected?.Label, // true
                question: question.text,
              });

              // Check for critical alert condition
              if (!criticalAlert && question.weight_critical_alert && question.selected) {
                const matchFound = question.criticalOptions.some((opt: any) =>
                  opt.score === question.selected.score || opt.Label === question.selected.Label
                );

                if (matchFound) {
                  criticalAlert = true;
                  // No break needed since we'll exit after this loop iteration if needed
                }
              }
            }
            let assessmentNumberID = this.webGuid;
            // let assessmentNumberID = Utility.generateGUID('web');
            const result = {
              // totalScore,
              response: answerSummary,
              // criticalAlert,
              support_service: this.loggedInUser?.support_service?.documentId,
              AssessmentGuid: assessmentNumberID,
              assessmentScore: totalScore,
              caseNumber: this.caseNumber || '',
              guidedType: this.guidedType,
              qrCodeUrl: `${window.location.origin}/viewresult?code=${assessmentNumberID}`,
              assessment_type: sessionStorage.getItem('selectedAssessmentDocId') || ''
            };


            this.apiService.saveRatAssessment(
              result.response,
              result.support_service,
              result.AssessmentGuid,
              result.assessmentScore,
              result.caseNumber,
              result.guidedType,
              result.qrCodeUrl,
              result.assessment_type
            ).subscribe({
              next: (res: any) => {
                if (res?.data) {
                  sessionStorage.setItem('ratsAssessmentResult', JSON.stringify(result));
                  const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
                  presentToast(this.toastController, successMessage);
                  this.cdRef.detectChanges();
                  this.hasloadedDate = false;
                  this.router.navigate(['/riskassessmentsummary']).then(() => {
                    this.cdRef.detectChanges();
                    this.ratsQuestions.forEach((q: any) => {
                      q.selected = null; // Reset selected for each question
                    });
                    this.cdRef.detectChanges();
                  });
                    
                }
              },
              error: (error: any) => {
                const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
                presentToast(this.toastController, errorMessage);
              }
            });
          }
        }
      ]
    });

    // Present the alert
    alert.present();
  }

  goBack() {
    this.router.navigate(['/riskassessment']);
    this.caseNumber = '';
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

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

}
