import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

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
  hitsQuestions: any[] = [];
  scaleOptions: string[] = [];
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';

  constructor(
      private router: Router,
      private apiService: ApiService,
      private menuService: MenuService,
      private cookieService: CookieService,
      private alertController: AlertController) { }

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

    const cachedHits = this.menuService.getRatsAssessment();
    if (cachedHits && cachedHits.questions && cachedHits.questions.length > 0) {
      this.setupRatsQuestions(cachedHits.questions, cachedHits.answerOptions);
    } else {
      // Load from API if cache is empty
      this.apiService.getRatsAssessmentQuestions().subscribe({
        next: (hitsData: any) => {
          const { questions, answerOptions } = hitsData;

          // Sort the multiple_options_for_rat for each question (if still needed)
          questions.forEach((q: any) => {
            q.multiple_options_for_rat.sort((a: any, b: any) => a.score - b.score);
          });

          // Store both questions and answerOptions in the service
          this.menuService.setHitsAssessment({ questions, answerOptions });
          this.setupRatsQuestions(questions, answerOptions);
        },
        error: (err: any) => {
          console.error('Failed to load HITS data from API:', err);
        }
      });
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
  
    this.hitsQuestions = questions.map((q: any) => ({
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

  submit() {
    let totalScore = 0;
    const answerSummary: { questionId: number; questionText: string; selectedScore: number | null }[] = [];
    let criticalAlert = false;
  
    // Single loop to calculate totalScore, build answerSummary, and check for critical alert
    for (const question of this.hitsQuestions) {
      // Handle selected score for totalScore and answerSummary
      const selectedScore = question.selected ? question.selected.score : null;
      if (selectedScore !== null) {
        totalScore += selectedScore;
      }
  
      // Add to answerSummary
      answerSummary.push({
        questionId: question.id,
        questionText: question.text,
        selectedScore: selectedScore
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
  
    const result = {
      totalScore,
      summary: answerSummary,
      criticalAlert
    };
  
    sessionStorage.setItem('hitsAssessmentResult', JSON.stringify(result));
    //debugger;
    this.router.navigate(['/riskassessmentsummary']);
  }

  isAllQuestionsAnswered(): boolean {
    return this.hitsQuestions.every(q => q.selected !== null && q.selected !== undefined);
  }

  goBack() {
    this.router.navigate(['/riskassessment']);
    this.caseNumber = '';
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
