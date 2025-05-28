import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

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

  constructor(
    private router: Router,
    private apiService: ApiService,
    private menuService: MenuService,
    private cookieService: CookieService,
    private alertController: AlertController
  ) { }

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
    }
  }

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }


  setupHitsQuestions(questions: any[], answerOptions: any[]) {
    const scaleSet = new Set<string>();
    answerOptions.forEach((opt: any) => {
      scaleSet.add(`${opt.score}. ${opt.label}`);
    });
  
    this.scaleOptions = [...scaleSet];
  
    this.hitsQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.question_text,
      selected: null,
      weight_critical_alert: q.weight_critical_alert,
      options: answerOptions.map((opt: any) => ({
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
          opt.score === question.selected.score || opt.label === question.selected.label
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
