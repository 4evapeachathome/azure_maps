import { Component, OnInit } from '@angular/core';
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

  constructor(
      private router: Router,
      private apiService: ApiService,
      private menuService: MenuService,
      private cookieService: CookieService,
      private alertController: AlertController,
      private toastController: ToastController) { }

  ngOnInit() {
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

    this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || '';

    const cachedRats = this.menuService.getRatsAssessment();
    console.log('cachedRats.answerOptions!!!!!!!!!', cachedRats);
    if (cachedRats && cachedRats.questions && cachedRats.questions.length > 0) {
      this.setupRatsQuestions(cachedRats.questions, cachedRats.answerOptions);
    } else {
      // Load from API if cache is empty
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (hitsData: any) => {
          let { questions, answerOptions } = hitsData;

          // Sort the multiple_options_for_rat for each question (if still needed)
          questions.forEach((q: any) => {
            q.multiple_options_for_rat.sort((a: any, b: any) => a.score - b.score);
          });

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
  
    this.scaleOptions = [...scaleSet];
  
    this.ratsQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.question_text,
      selected: null,
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
            let totalScore = 0;
            // const answerSummary: { questionId: number; questionText: string; selectedScore: number | null; answer: string, question: string }[] = [];
            const answerSummary: { question: string, answer: boolean }[] = [];
            let criticalAlert = false;

            console.log('this.ratsQuestions>>>', this.ratsQuestions);
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
            let assessmentNumberID = Utility.generateGUID('web');
            const result = {
              // totalScore,
              response: answerSummary,
              // criticalAlert,
              support_service: this.loggedInUser.documentId,
              asssessmentNumber: assessmentNumberID,
              assessmentScore: totalScore,
              caseNumber: this.caseNumber || '',
              guidedType: this.guidedType,
              qrCodeUrl: `${window.location.origin}/viewresult?code=${assessmentNumberID}`
            };


            this.apiService.saveRatAssessment(
              result.response,
              result.support_service,
              result.asssessmentNumber,
              result.assessmentScore,
              result.caseNumber,
              result.guidedType,
              result.qrCodeUrl
            ).subscribe({
              next: (res: any) => {
                if (res?.data) {
                  sessionStorage.setItem('ratsAssessmentResult', JSON.stringify(result));
                  const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
                  presentToast(this.toastController, successMessage);
                  this.router.navigate(['/riskassessmentsummary']);
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

  isAllQuestionsAnswered(): boolean {
    return this.ratsQuestions.every(q => q.selected !== null && q.selected !== undefined);
  }

  goBack() {
    this.router.navigate(['/riskassessment']);
    this.caseNumber = '';
  }

  async logout() {
    this.menuService.logout().then(() => {
      // this.guidedType = 'staff-guided';
    }).catch(error => {
      this.showToast(error.error.error.message || 'Failed to logout', 3000, 'top');
    });
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

}
