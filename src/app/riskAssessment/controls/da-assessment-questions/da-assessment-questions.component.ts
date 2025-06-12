import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
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

    const cachedHits = this.menuService.getDangerAssessment();
    debugger;

if (cachedHits && cachedHits.data && cachedHits.data.length > 0) {
  this.daAssessment = this.initializeAssessmentData(cachedHits.data);
    } else {
      // Load from API if cache is empty
      this.apiService.getDAAssessmentQuestions().subscribe({
        next: (res: any) => {
          if(res && res.data && res.data.length > 0) {
            this.daAssessment = this.initializeAssessmentData(res.data);       
            this.menuService.setDangerAssessment(res);
          }
        },
        error: (err:any) => {
          console.error('Failed to load HITS data from API:', err);
        }
      });
    }
    
  }

  initializeAssessmentData(data: any[]) {
    return data.map(q => ({
      ...q,
      selected: null,  // Initialize main question selection
      DAChild: q.DAChild ? q.DAChild.map((sub:any) => ({ 
        ...sub, 
        selected: null // Initialize sub-question selection
      })) : []
    }));
  }


  get allParentQuestionsAnswered(): boolean {
    if (!this.daAssessment) return false;
    
    return this.daAssessment.every((question:any) => 
      question.selected !== null && question.selected !== undefined
    );
  }

   private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }
  

  get paginatedQuestions() {
    if (!this.daAssessment) return [];
    const start = this.currentPageIndex * this.questionsPerPage;
    return this.daAssessment.slice(start, start + this.questionsPerPage);
  }
  
  get currentRangeText() {
    if (!this.daAssessment || this.daAssessment.length === 0) {
      return 'Questions Set - 0 to 0';
    }
    const start = this.currentPageIndex * this.questionsPerPage + 1;
    const end = Math.min(start + this.questionsPerPage - 1, this.daAssessment.length);
    return `Questions Set - ${start} to ${end}`;
  }

  getCharFromCode(code: number): string {
    return String.fromCharCode(code);
  }

  nextPage() {
    if (!this.daAssessment) return;
    if ((this.currentPageIndex + 1) * this.questionsPerPage < this.daAssessment.length) {
      this.currentPageIndex++;
    }
  }
  
  prevPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
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

 async submitDangerAssessment(){
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
            const answerSummary: { question: string; answer: string | null }[] = [];
            let criticalAlert = false;

            // Process main questions
            for (const question of this.daAssessment) {
              const selected = question.selected;
              const isYes = selected && selected.label === 'Yes';
              const selectedAnswer = selected?.label 
  ? selected.label.charAt(0).toUpperCase() + selected.label.slice(1).toLowerCase() 
  : '';

              answerSummary.push({
                question: question.questionText,
                answer: selectedAnswer
              });

              // Calculate score based on weightage_score if available, otherwise default to score or 1
              if (isYes) {
                const weight = question.weightage_score !== null ? question.weightage_score : question.score;
                totalScore += weight || 1;
              }

              // Process sub-questions (like 3a)
              if (question.DAChild && question.DAChild.length > 0) {
                for (const subQuestion of question.DAChild) {
                  const subSelected = subQuestion.selected;
                  const isSubYes = subSelected && subSelected.label === 'Yes';
                  const selectedAnswer = subSelected?.label
  ? subSelected.label.charAt(0).toUpperCase() + subSelected.label.slice(1).toLowerCase()
  : '';


                  answerSummary.push({
                    question: `${question.questionOrder}${String.fromCharCode(97 + question.DAChild.indexOf(subQuestion))}. ${subQuestion.questionText}`,
                    answer: selectedAnswer
                  });

                  if (isSubYes && subQuestion.weightageScore) {
                    totalScore += subQuestion.weightageScore;
                  }
                }
              }
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
                AssessmentGuid: Utility.generateGUID('da'),
                response: answerSummary,
                Score: totalScore,
                CaseNumber: this.caseNumber,
                support_service: this.loggedInUser?.documentId,
                Levelofdanger: levelOfDanger ,
              }
            };

            this.apiService.saveDaAssessmentResponse(payload).subscribe({
              next: (res) => {
                debugger;
                sessionStorage.setItem('daAssessmentResult', JSON.stringify({
                  totalScore,
                  summary: answerSummary,
                  Levelofdanger: levelOfDanger,
                  daurl: `${window.location.origin}/viewresult?code=${res.data.AssessmentGuid}`,
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

    await alert.present();
  }


  onAnswerChange(question: any, event: any) {
    // If clicking the already selected option, deselect it
    if (question.selected === event.detail.value) {
      question.selected = null;
    } else {
      question.selected = event.detail.value;
    }
  }

}
