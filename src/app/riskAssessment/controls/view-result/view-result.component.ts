import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import {SummarypageComponent} from 'src/app/riskAssessment/controls/summarypage/summarypage.component';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { ASSESSMENT_TYPE } from 'src/shared/constants';
import { APIEndpoints } from 'src/shared/endpoints';
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
  daResult: any[] = [];
  assessmentTitle: string = 'Risk Assessment Results';
  hitResults: any[] = []; // To store the API response
  errorMessage: string | null = null;
  criticalalert: boolean = false;
  note!: string;
  caution!: string;
  score!:any;
  highratedQuestions:boolean = false; // To track if any high-rated questions are answered
  selectedAssessment: string | null = null; // To store the selected assessment type
  riskValue!: number; // Dynamic risk value (0-100)
  supportService:any;
  showSummary = false; /// enable when to show summary
  isassessmenfromeducation: boolean = false;
  isRatAssessment = false;
  ratAssessmentResult: any;
  qCodeValue: string = '';
  levelofdanger: string = '';
  isHitAssessment = false;
  isSSripa = false;
  rangevalue:any[] = [];
  hitsCriticalAlert: boolean = false;
  isDaAssessment = false;
  AssessmentResultList: any = [];
  assessmentNumber: string = '';
  responseJson: any;
  isDataLoaded = false;
  ASSESSMENT_TYPE = ASSESSMENT_TYPE;
  @ViewChild('qrcodeElement', { static: false }) qrCodeElement!: QRCodeComponent;

  constructor(private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute,
        private menuService: MenuService,
        private toastController: ToastController
  ) { }

  ngOnInit() {
    this.isDataLoaded = false;
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

    this.assessmentNumber = this.activatedRoute.snapshot.queryParamMap.get('code') || '';
    if(this.assessmentNumber) {
      this.checkSelectedAssessment(this.assessmentNumber);
    } else {
      this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
    }
  }

  async logout() {
    try {
      await this.menuService.logout();
      // this.guidedType = 'staff-guided';
    } catch (error: any) {
      const errorMsg = error?.error?.error?.message || error?.error?.message || error?.message || 'Failed to logout';
      const alert = await this.alertController.create({
        header: 'Logout Failed',
        message: errorMsg,
        buttons: ['OK']
      });
      await alert.present();
    }
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
          let checkValidation = this.CheckAssessmenttypeAuthorize(response);


          if(checkValidation) {
            this.AssessmentResultList.push(response);
            this.responseJson = response.assessmentSummary;
            this.guidedType = response.guidedType;
            this.updateGuidedTypeLabel();
            this.caseNumber = response?.caseNumber;
            this.qCodeValue = response.qrCodeUrl;
            this.showToast(response?.message || 'Assessment result fetch successfully.', 3000, 'top');
            this.isDataLoaded = true;
          } else {
            this.showToast('You are not authorized to view this assessment result.', 3000, 'top');
            this.router.navigate(['/login']);
          }
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

  CheckAssessmenttypeAuthorize(response:any) : boolean{
    const userAssessmentTypes = this.loggedInUser.assessment_type || [];
    const responseAssessmentType = response?.assessment_type;
    debugger;
    return userAssessmentTypes.some(
      (type:any) => type?.documentId === responseAssessmentType?.documentId
    );
  }

  async GetAssessmentResponsebycode(url: string) {
    if (url && this.isDaAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;


        let checkValidation = this.CheckAssessmenttypeAuthorize(response);

        if(checkValidation) {
          this.responseJson = response.response;
          this.levelofdanger = response.Levelofdanger;
          this.guidedType = response.guidedType;
          this.score = response.Score;
          this.supportService = response.support_service;
          this.updateGuidedTypeLabel();
          this.caseNumber = response?.CaseNumber;
          this.qCodeValue = response.AssessmentGuid
            ? `${window.location.origin}/viewresult?code=${response.AssessmentGuid}`
            : '';
          this.showToast(response?.message || 'Assessment result fetched successfully.', 3000, 'top');
    
          await this.fetchDaResults();
          this.isDataLoaded = true;
        } else {
          this.showToast('You are not authorized to view this assessment result.', 3000, 'top');
          this.router.navigate(['/login']);
        }
  
      } catch (error) {
        console.error('DA Assessment fetch error:', error);
      }
    }
  
    if (url && this.isHitAssessment) {
      try {
        const res: any = await new Promise((resolve, reject) => {
          this.apiService.getAssessmentResponse(url).subscribe(resolve, reject);
        });
        const response = res?.data;
        
     
        let checkValidation = this.CheckAssessmenttypeAuthorize(response);
        if(checkValidation) {
          this.responseJson = response.response;
          this.guidedType = response.guidedType;
          this.score = response.Score;
          this.hitsCriticalAlert = response.isCriticalAlert;
          
          this.supportService = response.support_service;
          this.updateGuidedTypeLabel();
          this.caseNumber = response?.CaseNumber;
          this.qCodeValue = response.AssessmentGuid
            ? `${window.location.origin}/viewresult?code=${response.AssessmentGuid}`
            : '';
          this.showToast(response?.message || 'Assessment result fetched successfully.', 3000, 'top');
    
          await this.fetchHitResults();
          this.isDataLoaded = true;
        } else {
          this.showToast('You are not authorized to view this assessment result.', 3000, 'top');
          this.router.navigate(['/login']);
        }
  
      } catch (error) {
        console.error('HITS Assessment fetch error:', error);
      }
    }
  
    if (url && this.isSSripa) {
      this.apiService.getAssessmentResponse(url).subscribe(
        (res: any) => {
          const response = res?.data;
          
        let checkValidation = false;


        if(response.IsAssessmentfromEducationModule) {
          this.allowSrppa(response);
        } else {
          checkValidation = this.CheckAssessmenttypeAuthorize(response);

          if(checkValidation) {
            this.allowSrppa(response);
          } else {
            this.showToast('You are not authorized to view this assessment result.', 3000, 'top');
            this.router.navigate(['/login']);
          }
        }

  
        },
        (error) => console.error('SSRIPA Assessment fetch error:', error)
      );
    }
  }

async fetchHitResults(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.apiService.getHitsResultCalculation().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.hitResults = response.data;
          const hitData = response.data[0];
          this.note = hitData?.Note || '';
          this.caution = hitData?.Caution || '';
          this.rangevalue = hitData?.AnswerOption?.map((option: any) => ({
            min: option.min,
            max: option.max,
            color: option.color,
            label: option.label,
          }));
        } else {
          this.hitResults = [];
          this.note = '';
          this.caution = '';
        }
        resolve();
      },
      error: (error: any) => {
        this.errorMessage = error;
        console.error('Error in fetchHitResults:', error);
        reject(error);
      },
    });
  });
}

async fetchDaResults(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.apiService.getDAresultcalculation().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.daResult = response.data;
          this.rangevalue = this.daResult.map((option: any) => ({
            min: option.min,
            max: option.max,
            color: option.color,
            label: option.label,
          }));
        } else {
          this.daResult = [];
        }
        resolve();
      },
      error: (error: any) => {
        this.errorMessage = error;
        console.error('Error in fetchDaResults:', error);
        reject(error);
      },
    });
  });
}

getCharFromCode(code: number): string {
  return String.fromCharCode(code);
}

  allowSrppa(response: any) {
    this.responseJson = response.response;
    this.guidedType = response.guidedType;
    this.supportService = response.support_service;
    this.isassessmenfromeducation = response.IsAssessmentfromEducationModule;
    this.updateGuidedTypeLabel();
    this.caseNumber = response?.CaseNumber;
    this.highratedQuestions =response.answeredHighratedquestion;
    this.qCodeValue = response.AssessmentGuid
      ? `${window.location.origin}/viewresult?code=${response.AssessmentGuid}`
      : '';
      this.isDataLoaded = true;
    this.showToast(response?.message || 'Assessment result fetched successfully.', 3000, 'top');
  }
  
}



