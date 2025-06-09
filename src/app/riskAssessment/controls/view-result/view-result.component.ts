import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.scss'],
  standalone: false
})
export class ViewResultComponent  implements OnInit {

  hidePdfContainer = true;
  caseNumber: string='';
  loggedInUser:any = null;
  loaded: boolean = false;
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  answerSummary: any[] = [];
  assessmentTitle: string = 'Risk Assessment Results';
  hitResults: any[] = []; // To store the API response
  errorMessage: string | null = null;
  criticalalert: boolean = false;
  note!: string;
  caution!: string;
  selectedAssessment: string | null = null; // To store the selected assessment type
  riskValue!: number; // Dynamic risk value (0-100)

  showSummary = false; /// enable when to show summary

  isRatAssessment = false;
  ratAssessmentResult: any;
  ratQrCodeValue: string = '';

  isHitAssessment = false;
  ratAssessmentResultList: any = [];

  constructor(private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute,
        private menuService: MenuService,
        private toastController: ToastController
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails');
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
      } catch {
        this.cookieService.delete('userdetails');
        this.router.navigate(['/login']);
        return;
      }
    } else {
      this.router.navigate(['/login']);
      return;
    }
  
    const storedGuidedType = sessionStorage.getItem('guidedType');
    if (storedGuidedType) {
      this.guidedType = storedGuidedType;
    }
  
    this.updateGuidedTypeLabel();

    // this.isSSripa = sessionStorage.getItem('isSSripa') === 'true';
        
    let code = this.activatedRoute.snapshot.queryParamMap.get('code');
    if(code) {
      this.checkSelectedAssessment(code);
    } else {
      this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
    }
    this.loaded = true;
  }

  async logout() {
    this.menuService.logout().then(() => {
      this.guidedType = 'staff-guided';
    }).catch(error => {
      this.showToast(error.error.error.message || 'Failed to logout', 3000, 'top');
    });
  }

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }

  checkAssessmentType() {
    if(this.selectedAssessment?.toLowerCase() == 'web') {
      this.isRatAssessment = true;
      this.fetchRatResults();
      return sessionStorage.getItem('ratsAssessmentResult');
    } else if(this.selectedAssessment?.toLowerCase() == 'hits' || this.selectedAssessment?.toLowerCase() == 'hit'){
      this.isHitAssessment = true;
      // this.fetchHitResults();
      return sessionStorage.getItem('hitsAssessmentResult');
    } else {
      return null;
    }
  }

  checkSelectedAssessment(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.selectedAssessment = 'web';
      this.isRatAssessment = true;
      this.fetchRatResults();
    } else if(code && code.toLowerCase().includes('hit-')) {
      this.selectedAssessment = 'hit';
    } else if(code && code.toLowerCase().includes('da-')) {
      this.selectedAssessment = 'da';
    } else if(code && code.toLowerCase().includes('dai-')) {
      this.selectedAssessment = 'dai';
    } else if(code && code.toLowerCase().includes('cts-')) {
      this.selectedAssessment = 'cts';
    } else if(code && code.toLowerCase().includes('ssripa-')) {
      this.selectedAssessment = 'ssripa';
    } else {
      this.selectedAssessment = '';
    }
  }

  fetchRatResults() {
    this.apiService.getRatsResult().subscribe({
      next: (response: any) => {
        // const resultStr = this.checkAssessmentType();
        if (response) {
          // const result = JSON.parse(resultStr);
          this.ratAssessmentResultList.push(response.data[0]);
          this.showToast(response?.message || 'Assessment result fetch successfully.', 3000, 'top');
        }
      },
      error: (error: any) => {
        this.errorMessage = error;
        this.showToast(error.error.error.message || 'Failed to logout', 3000, 'top');
      }
    })
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

}
