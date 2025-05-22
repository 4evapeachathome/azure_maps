import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
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
    private cookieService: CookieService,
    private alertController: AlertController
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
      const assessmentName = this.selectedAssessment?.toLowerCase().trim();
  
      switch (assessmentName) {
        case 'hits assessment':
          this.router.navigate(['/hitsassessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'conflict tactic scale 2':
          this.router.navigate(['/cts2'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'danger assessment for immigrants':
          this.router.navigate(['/danger-assessment-immigrants'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'the danger assessment (da)':
          this.router.navigate(['/danger-assessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'relationship assessment tool originally called web scale':
          this.router.navigate(['/relationship-assessment'], { state: { assessmentType: this.selectedAssessment } });
          break;
        case 'signs of self-recognition in intimate partner abuse (ssripa)':
          this.router.navigate(['/ssripa'], { state: { assessmentType: this.selectedAssessment } });
          break;
        default:
          console.warn('No matching route found for selected assessment.');
      }
    } else {
      console.log('Please select an assessment type');
    }
  }

  goBack() {
    this.selectedAssessment = null;
    this.caseNumber = '';
    this.guidedType = 'staff-guided';
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
            this.selectedAssessment = null;
            this.guidedType = 'staff-guided';
            this.cookieService.delete('username');
            this.cookieService.delete('loginTime');
            this.cookieService.delete('userdetails');
            this.router.navigate(['/loginPage']);
          }
        }
      ]
    });
  
    await alert.present();
  }

}
