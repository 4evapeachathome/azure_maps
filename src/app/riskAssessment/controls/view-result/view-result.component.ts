import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { ASSESSMENT_TYPE } from 'src/shared/constants';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { presentToast } from 'src/shared/utility';

interface AssessmentResponse {
  data: {
    id: number;
    documentId: string;
    AssessmentGuid: string;
    response: Array<{
      answer: string;
      question: string;
      DAChild?: Array<{ answer: string; question: string }>; // Optional for da-assessment-response
      [key: string]: any; // Allow additional properties
    }>;
    CaseNumber: string;
    Score?: number;
    support_service: {
      documentId: string;
      user_login: {
        username: string;
        assessment_type: Array<{
          name: string;
          description: string;
        }>;
      } | null;
    } | null;
  };
  meta: Record<string, any>;
}

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
  qCodeValue: string = '';

  isHitAssessment = false;
  isSSripa = false;
  isDaAssessment = false;
  ratAssessmentResultList: any = [];
  assessmentNumber: string = '';
  responseJson: any;
  ASSESSMENT_TYPE = ASSESSMENT_TYPE;
  @ViewChild('qrcodeElement', { static: false }) qrCodeElement!: QRCodeComponent;

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

    // this.isSSripa = sessionStorage.getItem('isSSripa') === 'true';
        
    this.assessmentNumber = this.activatedRoute.snapshot.queryParamMap.get('code') || '';
    if(this.assessmentNumber) {
      this.checkSelectedAssessment(this.assessmentNumber);
    } else {
      this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
    }
    this.loaded = true;
  }

  async logout() {
    this.menuService.logout().then(() => {
      // this.guidedType = 'staff-guided';
    }).catch(error => {
      this.showToast(error.error.error.message || 'Failed to logout', 3000, 'top');
    });
  }

  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }

  checkSelectedAssessment(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.selectedAssessment = this.ASSESSMENT_TYPE.WEB;
      this.isRatAssessment = true;
      this.fetchRatResults(code);
    } else if(code && code.toLowerCase().includes('hits-')) {
      this.selectedAssessment = this.ASSESSMENT_TYPE.HITS;
      this.isHitAssessment = true;
      const url =APIEndpoints.getHitsAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
    } else if(code && code.toLowerCase().includes('da-')) {
      this.selectedAssessment = this.ASSESSMENT_TYPE.DA;
      this.isDaAssessment = true;
      const url =APIEndpoints.getDaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
    } else if(code && code.toLowerCase().includes('dai-')) {
      this.selectedAssessment = 'dai';
    } else if(code && code.toLowerCase().includes('cts-')) {
      this.selectedAssessment = 'cts';
    } else if(code && code.toLowerCase().includes('ssripa-')) {
      this.selectedAssessment = this.ASSESSMENT_TYPE.SSRIPA;
      this.isSSripa = true;
      const url =APIEndpoints.getSSripaAssessmentByGuid + code;
      this.GetAssessmentResponsebycode(url);
      
    } else {
      this.selectedAssessment = '';
    }
  }

  fetchRatResults(code: string) {
    this.apiService.getRatsResult(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.ratAssessmentResultList.push(response);
          this.responseJson = response.assessmentSummary;
          this.guidedType = response.guidedType;
          this.updateGuidedTypeLabel();
          this.caseNumber = response?.caseNumber;
          this.qCodeValue = response.qrCodeUrl;
          this.showToast(response?.message || 'Assessment result fetch successfully.', 3000, 'top');
        }
      },
      error: (error: any) => {
        const errorMsg = error?.error?.message || error?.message || 'Failed to fetch assessment result';
        this.showToast(errorMsg, 3000, 'top');
      }
    })
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

  GetAssessmentResponsebycode(url: string) {
    if(url && this.isDaAssessment) {
    this.apiService.getAssessmentResponse(url).subscribe(
      (response: AssessmentResponse) => {
        debugger;
        console.log('DA Assessment Response:', response.data);
      },
      (error) => console.error('Error:', error.message)
    );
  }

    // HITS Assessment
    if(url && this.isHitAssessment) {
    this.apiService.getAssessmentResponse(url).subscribe(
      (response: AssessmentResponse) => {
        debugger
        console.log('HITS Assessment Response:', response.data);
      },
      (error) => console.error('Error:', error.message)
    );
  }

    // SSRIPA Assessment
    if(url && this.isSSripa) {
    this.apiService.getAssessmentResponse(url).subscribe(
      (response: AssessmentResponse) => {
        debugger
        console.log('SSRIPA Assessment Response:', response.data);
      },
      (error) => console.error('Error:', error.message)
    );
  }
}
  
}



