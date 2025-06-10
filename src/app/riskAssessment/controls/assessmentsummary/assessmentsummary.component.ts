import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import { NgxGaugeModule } from 'ngx-gauge';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SummarypageComponent } from "../summarypage/summarypage.component";


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, QRCodeComponent, NgxGaugeModule, SummarypageComponent]
})
export class AssessmentsummaryComponent  implements OnInit, AfterViewInit {
  hidePdfContainer = true;
  caseNumber: string='';
  loggedInUser:any = null;
  loaded: boolean = false;
  riskValue!: number; // Dynamic risk value (0-100)
  riskLevelsTitle: string = 'Risk Levels';
  stressCurveLabel: string = 'Stress Curve';
  @ViewChild('qrcodeEl', { static: false }) qrcodeEl!: QRCodeComponent;
  @ViewChild('pdfExportContainer', { static: false }) pdfExportContainer!: ElementRef;
  @ViewChild('qrImage', { static: false }) qrImage!: ElementRef<HTMLImageElement>;
  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;
  showbarcode: boolean = false;
  isSSripa:boolean = false;
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  answerSummary: any[] = [];
  assessmentTitle: string = 'Risk Assessment Results';
  QrcodeUrl: string = ''; // QR code content
  hitResults: any[] = []; // To store the API response
  errorMessage: string | null = null;
  isHitsAssessment: boolean = false;
  riskGaugeMin: number = 0;
  riskGaugeMax: number = 100;
  gaugeThresholds: any[] = [];
  thresholdValues: { [key: string]: { color: string } } = {};
  criticalalert: boolean = false;
  note!: string;
  caution!: string;
  selectedAssessment: string | null = null; // To store the selected assessment type
  rangevalue:any;
  showSummary = false; /// enable when to show summary
  isRatAssessment = false;
  ratAssessmentResult: any;
  ratQrCodeValue: string = '';
  responseJson: any;
  isHitAssessment = false;


  constructor(private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute) { }

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
    if (storedGuidedType) {
      this.guidedType = storedGuidedType;
    }
  
    this.updateGuidedTypeLabel();

    this.isSSripa = sessionStorage.getItem('isSSripa') === 'true';
    this.isHitsAssessment = sessionStorage.getItem('isHits') === 'true';
    this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;

    if(this.isSSripa) {
      const resultStr = sessionStorage.getItem('ssripaAssessmentResult');
      if (resultStr) {
        const result = JSON.parse(resultStr);
        debugger;
        this.responseJson= result.summary;
        this.QrcodeUrl= result.ssripasurl;
      }
    }
   
    if(this.isHitsAssessment) {
      const resultStr = sessionStorage.getItem('hitsAssessmentResult');
      if (resultStr) {
        const result = JSON.parse(resultStr);
        debugger;
        this.responseJson= result.summary;
        this.riskValue = result.totalScore;
        this.answerSummary = result.summary;
        this.criticalalert = result.criticalAlert === 'true' || result.criticalAlert === true;
        this.QrcodeUrl= result.hitsurl;
      }
      this.fetchHitResults();
    }

    this.loaded = true;
    this.caseNumber = sessionStorage.getItem('caseNumber') || '';
    
  }

  ngAfterViewInit(): void {
    let ratResult = sessionStorage.getItem('ratsAssessmentResult');
    if(ratResult) {
      this.ratAssessmentResult = JSON.parse(ratResult || '')
      if(this.ratAssessmentResult) {
        this.ratQrCodeValue = `${window.location.origin}/viewresult?code=${this.ratAssessmentResult?.asssessmentNumber}`
      }
    }
  }


  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }


  async downloadPDF() {
    try {

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.hidePdfContainer = true;
    }
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
            this.guidedType = 'staff-guided';
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
  

  fetchHitResults() {
    this.apiService.getHitsResultCalculation().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          debugger;
          this.hitResults = response.data;
  
          // Extract and store Note and Caution (assumes only one item in hitResults)
          const hitData = this.hitResults[0];
          this.note = hitData?.Note || '';
          this.caution = hitData?.Caution || '';
  
          this.rangevalue = hitData?.AnswerOption.map((option:any) => ({
            min: option.min,
            max: option.max,
            color: option.color,
            label: option.label
          }));
        } else {
          this.hitResults = [];
          this.thresholdValues = {};
          this.note = '';
          this.caution = '';
        }
      },
      error: (error: any) => {
        this.errorMessage = error;
        console.error('Error in subscription:', error);
      },
      complete: () => {
        console.log('Hit results fetch completed');
      },
    });
  }
}