import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
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
  
  loggedInUser: any = null;
  caseNumber: string = '';
  loaded: boolean = false;
  hitsQuestions: any[] = [];
  scaleOptions: string[] = [];
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  @Input() hitsGuid:any;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private menuService: MenuService,
    private cookieService: CookieService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadinitialData();
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
    //debugger;
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
  
  isAllQuestionsAnswered(): boolean {
    return this.hitsQuestions.every(q => q.selected !== null && q.selected !== undefined);
  }

  async submit() {
    // Create the alert using AlertController
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
            // Proceed with the original logic if OK is clicked
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
                support_service: this.loggedInUser?.documentId
              }
            };
  
            this.apiService.postHitsAssessmentResponse(payload).subscribe({
              next: (res) => {
                sessionStorage.setItem('hitsAssessmentResult', JSON.stringify({
                  totalScore,
                  summary: answerSummary,
                  criticalAlert,
                  hitsurl: `${window.location.origin}/viewresult?code=${res.data.AssessmentGuid}`,
                }));
                console.log('Assessment saved:', res);
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
    this.router.navigate(['/riskassessment']);
    this.caseNumber = '';
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

}
