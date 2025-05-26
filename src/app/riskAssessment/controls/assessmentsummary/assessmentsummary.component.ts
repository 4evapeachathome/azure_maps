import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import domtoimage from 'dom-to-image-more';
import { NgxGaugeModule } from 'ngx-gauge';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
          imports: [CommonModule, IonicModule, FormsModule,QRCodeComponent,NgxGaugeModule],
})
export class AssessmentsummaryComponent  implements OnInit {
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
  myAngularxQrCode: string = 'https://sripaalink.com'; // QR code content
  hitResults: any[] = []; // To store the API response
  errorMessage: string | null = null;
  riskGaugeMin: number = 0;
  riskGaugeMax: number = 100;
  gaugeThresholds: any[] = [];
  thresholdValues: { [key: string]: { color: string } } = {};
  criticalalert: boolean = false;
  note!: string;
  caution!: string;
  selectedAssessment: string | null = null; // To store the selected assessment type

  constructor(private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController) { }

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
    this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
    const resultStr = sessionStorage.getItem('hitsAssessmentResult');
    if (resultStr) {
      const result = JSON.parse(resultStr);
      this.riskValue = result.totalScore;
      this.answerSummary = result.summary;
      this.criticalalert = result.criticalAlert === 'true' || result.criticalAlert === true;
    }
  
    this.fetchHitResults();
    this.loaded = true;
  }




  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }


  async downloadPDF() {
    try {
      // 1. Show the PDF container (if hidden)
      this.hidePdfContainer = false;
  
      // 2. Wait briefly for Angular change detection
      await new Promise(resolve => setTimeout(resolve, 100));
  
      // 3. Capture the QR code canvas (if needed)
      const canvas = this.qrcodeEl.qrcElement.nativeElement.querySelector('canvas');
      if (canvas) {
        const qrImageDataUrl = canvas.toDataURL('image/png');
        this.qrImage.nativeElement.src = qrImageDataUrl;
      }
  
      // 4. Wait for the QR image to load (if used)
      await new Promise(resolve => setTimeout(resolve, 200));
  
      // 5. Capture the entire PDF container as a PNG image
      const dataUrl = await domtoimage.toPng(this.pdfExportContainer.nativeElement, {
        quality: 1, // Highest quality
        bgcolor: '#ffffff', // White background
      });
  
      // 6. Create a temporary container with the captured image
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '100%';
      tempDiv.style.padding = '20px';
      tempDiv.style.background = 'white';
  
      const img = new Image();
      img.src = dataUrl;
      img.style.width = '100%';
      tempDiv.appendChild(img);
  
      // 7. Append to body (temporarily)
      document.body.appendChild(tempDiv);
  
      // 8. Generate PDF from the image
      const opt = {
        margin: 0.5,
        filename: 'Assessment-Summary.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
  
      await html2pdf().from(tempDiv).set(opt).save();
  
      // 9. Clean up
      document.body.removeChild(tempDiv);
      this.hidePdfContainer = true;
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
  
          const answerOptions = hitData?.AnswerOption || [];
  
          // Set min and max for the gauge from nested AnswerOption scores
          const allMinScores = answerOptions.map((opt: any) => opt.minScore);
          const allMaxScores = answerOptions.map((opt: any) => opt.maxScore ?? opt.minScore);
  
          this.riskGaugeMin = Math.min(...allMinScores);
          this.riskGaugeMax = Math.max(...allMaxScores);
  
          // Handle critical alert case
          if (this.criticalalert) {
            debugger;
            this.thresholdValues = {
              10: { color: 'red' },
              20: { color: 'red' }
            };
          } else {
            // Map API data to thresholds
            this.thresholdValues = {};
            answerOptions.forEach((option: any) => {
              this.thresholdValues[option.minScore] = {
                color: this.getColorForLabel(option.label),
              };
            });
          }
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

  getColorForLabel(label: string): string {
    switch (label?.toLowerCase()) {
      case 'yellow': return 'green';
      case 'orange': return 'orange';
      case 'red': return 'red';
      default: return 'gray';
    }
  }

}
