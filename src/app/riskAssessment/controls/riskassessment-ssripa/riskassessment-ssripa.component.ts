import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
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

  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';

  quizTitle = '';
sripa: any[] = [];
yesanswer: any[] = [];
currentIndex = 0;
showAnswers: boolean[] = [];
selectedOptions: string[] = [];
showresults: boolean = false;
@Input() sripaGuid: any;

  constructor(private router: Router,
      private apiService: ApiService,
      private menuService: MenuService,
      private cookieService: CookieService,
      private alertController: AlertController) { }

  ngOnInit() {
    this.loadInitialData(); 
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
      this.apiService.getSripaa().subscribe((quiz) => {
        if (quiz) {
          this.quizTitle = 'Signs of Self-Recognition in Intimate Partner Abuse - SSRIPA';
          this.sripa = quiz || [];
          this.showAnswers = new Array(this.sripa.length).fill(false);
          this.selectedOptions = new Array(this.sripa.length).fill(null);
          this.menuService.setSsripaData(this.sripa); // Update BehaviorSubject
        }
      });
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
            console.log('Submission canceled');
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
  
            const payload = {
              data: {
                response: respondedQuestions,
                AssessmentGuid: this.sripaGuid,
                support_service: this.loggedInUser?.documentId ?? null,
                CaseNumber: this.caseNumber,
                guidedType: this.guidedType,
                IsAssessmentfromEducationModule: false
              }
            };
  
            // Subscribe to the Observable and log the response
            this.apiService.postSsripaAssessmentResponse(payload).subscribe({
              next: (response) => {
                sessionStorage.setItem('ssripaAssessmentResult', JSON.stringify({
                  summary: respondedQuestions,
                  ssripasurl: `${window.location.origin}/viewresult?code=${response.data.AssessmentGuid}`,
                }));
                this.router.navigate(['/riskassessmentsummary']);
              },
              error: (err) => {
                console.error('Failed to submit assessment response:', err);
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

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }


}
