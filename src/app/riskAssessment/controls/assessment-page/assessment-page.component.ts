import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
  guidedType: 'self-guided' | 'staff-guided' = 'self-guided';
  assessmentTypes: { id: number; name: string; description: string }[] = [];

  constructor(
    private menuService: MenuService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loggedInUser = this.menuService.getLoggedInUser();
    console.log('Logged-in user on dashboard:', this.loggedInUser);

    // Subscribe to changes (if the user might change while on this page)
    this.menuService.loggedInUser$.subscribe(user => {
      this.loggedInUser = user;
      // Populate assessment types from the user's types array
      this.assessmentTypes = this.loggedInUser?.types || [];
      // Set default selected assessment (if any)
      //this.selectedAssessment = this.assessmentTypes.length > 0 ? this.assessmentTypes[0].name : null;
      this.selectedAssessment = null;
    });
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
      this.router.navigate(['/test'], { state: { assessmentType: this.selectedAssessment } });
    } else {
      console.log('Please select an assessment type');
    }
  }

  goBack() {
    this.selectedAssessment = null;
    this.caseNumber = '';
    this.guidedType = 'self-guided';
  }


}
