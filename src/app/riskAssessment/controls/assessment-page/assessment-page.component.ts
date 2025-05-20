import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'assessment-page',
  templateUrl: './assessment-page.component.html',
  styleUrls: ['./assessment-page.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule,FormsModule],
})
export class AssessmentPageComponent  implements OnInit {
  loggedInUser: any = null;
  selectedAssessment: string | null = null;
  caseNumber: string = '';
  loaded: boolean = false;
  guidedType: 'self-guided' | 'staff-guided' = 'staff-guided';
  assessmentTypes: { id: number; name: string; description: string }[] = [];

  constructor(
    private menuService: MenuService,
    private router: Router,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails'); // Or 'username'
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
        this.assessmentTypes = this.loggedInUser?.assessment_type || [];
        this.selectedAssessment = null;
        this.loaded = true;
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('user');
        this.router.navigate(['/loginPage']);
      }
    } else {
      this.router.navigate(['/loginPage']);
    }
  }

  onGuidedTypeChange() {
  }

  onAssessmentChange() {
    console.log('Selected assessment:', this.selectedAssessment);
  }

  getSelectedAssessmentDescription(): string {
    const selectedType = this.assessmentTypes.find(type => type.name === this.selectedAssessment);
    return selectedType?.description || 'Please select an assessment type.';
  }

  goToTest() {
    if (this.selectedAssessment) {
      this.router.navigate(['/riskassessmentresult'], { state: { assessmentType: this.selectedAssessment } });
    } else {
      console.log('Please select an assessment type');
    }
  }

  goBack() {
    this.selectedAssessment = null;
    this.caseNumber = '';
    this.guidedType = 'self-guided';
  }

  logout(){
    this.selectedAssessment = null;
    this.guidedType = 'staff-guided';
    this.cookieService.delete('username');
    this.cookieService.delete('loginTime');
    this.cookieService.delete('userdetails');
    this.router.navigate(['/loginPage']);
  }

}
