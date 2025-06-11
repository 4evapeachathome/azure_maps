import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

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
  this.daAssessment = cachedHits.data;
    } else {
      // Load from API if cache is empty
      this.apiService.getDAAssessmentQuestions().subscribe({
        next: (res: any) => {
          if(res && res.data && res.data.length > 0) {
            this.daAssessment = res.data;            
            this.menuService.setDangerAssessment(res);
          }
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


}
