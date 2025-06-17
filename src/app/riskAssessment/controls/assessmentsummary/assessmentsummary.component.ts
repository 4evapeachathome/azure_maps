import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import { NgxGaugeModule } from 'ngx-gauge';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SummarypageComponent } from "../summarypage/summarypage.component";
import { presentToast } from 'src/shared/utility';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ASSESSMENT_TYPE } from 'src/shared/constants';
import { MenuService } from 'src/shared/menu.service';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, QRCodeComponent, NgxGaugeModule,RouterModule, SummarypageComponent]
})
export class AssessmentsummaryComponent  implements OnInit, AfterViewInit {
  @Input() reloadFlag: boolean = false;
  hidePdfContainer = true;
  caseNumber: string='<>';
  loggedInUser:any = null;
  loaded: boolean = false;
  riskValue!: number; // Dynamic risk value (0-100)
  riskLevelsTitle: string = 'Risk Levels';
  stressCurveLabel: string = 'Stress Curve';
  @ViewChild('qrcodeElement', { static: false }) qrCodeElement!: QRCodeComponent;
  @ViewChild('riskMeterRef') summaryPage!: SummarypageComponent;
  showbarcode: boolean = false;
  isSSripa:boolean = false;
  guidedType: string = 'self-guided'; // Default value
  guidedTypeLabel: string = 'Self-Guided';
  answerSummary: any[] = [];
  assessmentTitle: string = 'Risk Assessment Result';
  QrcodeUrl: string = ''; // QR code content
  hitResults: any[] = []; // To store the API response
  errorMessage: string | null = null;
  isHitsAssessment: boolean = false;
  riskGaugeMin: number = 0;
  daResult: any[] = []; //
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
  responseJson: any;
  isHitAssessment = false;
  assessmentNumber: string = '';
  hasFetchedData: boolean = false; // Track if logins have been fetched
  ASSESSMENT_TYPE = ASSESSMENT_TYPE;
  @Output() exportStarted = new EventEmitter<void>();
  @Output() exportCompleted = new EventEmitter<void>();
  @Output() exportFailed = new EventEmitter<Error>();
  levelofdanger:string=''; // Track if logins have been fetched
  isDanger: boolean = false; // Track if logins have been fetched
  isWeb: boolean = false;

  constructor(private cdRef:ChangeDetectorRef,private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute, private toastController: ToastController,   private menuService: MenuService) { }

  ngOnInit() {
    if (!this.hasFetchedData) {
      this.initializeComponent();
      this.hasFetchedData = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasFetchedData) {
      this.initializeComponent();
      this.hasFetchedData = true;
      setTimeout(() => {
        this.tryLoadRiskMeterImage();
      }, 100);
    }
    this.cdRef.detectChanges();
    this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
  }

  initializeComponent(){
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
    // debugger;
    if(this.isSSripa) {
      const resultStr = sessionStorage.getItem('ssripaAssessmentResult');
      if (resultStr) {
        const result = JSON.parse(resultStr);
        
        this.responseJson= result.summary;
        this.QrcodeUrl= result.ssripasurl;
        const urlObj = new URL(this.QrcodeUrl);
        this.assessmentNumber = urlObj.searchParams.get('code')?.toString() || '';
        this.caseNumber = result?.caseNumber;
      }
    }
   
    if(this.isHitsAssessment) {
      const resultStr = sessionStorage.getItem('hitsAssessmentResult');
      if (resultStr) {
        const result = JSON.parse(resultStr);
        
        this.responseJson= result.summary;
        this.riskValue = result.totalScore;
        this.answerSummary = result.summary;
        this.criticalalert = result.criticalAlert === 'true' || result.criticalAlert === true;
        this.QrcodeUrl= result.hitsurl;
        const urlObj = new URL(this.QrcodeUrl);
        this.assessmentNumber = urlObj.searchParams.get('code')?.toString() || '';
        this.caseNumber = result?.caseNumber;
      }
      this.fetchHitResults();
    }

    this.isDanger =sessionStorage.getItem('isDanger') === 'true';

    if(this.isDanger) {
      const resultStr = sessionStorage.getItem('daAssessmentResult');
      if(resultStr){
        const result = JSON.parse(resultStr);
        this.responseJson= result.summary;
        this.riskValue = result.totalScore;
        this.QrcodeUrl= result.daurl;
        this.levelofdanger = result.Levelofdanger;
        const urlObj = new URL(this.QrcodeUrl);
        this.assessmentNumber = urlObj.searchParams.get('code')?.toString() || '';
        this.caseNumber = result?.caseNumber;
      }
      this.fetchDaResults();
    }

    this.isWeb = sessionStorage.getItem('isWeb') == 'true';
    if(this.isWeb) {
      let ratResult = sessionStorage.getItem('ratsAssessmentResult');
      if(ratResult) {
        this.ratAssessmentResult = JSON.parse(ratResult || '');
        this.assessmentNumber = this.ratAssessmentResult.AssessmentGuid;
        this.riskValue = this.ratAssessmentResult?.assessmentScore;
      }
      this.checkSelectedAssessment(this.assessmentNumber);
    }    
    this.loaded = true;
  }

  ngAfterViewInit(): void {
    let ratResult = sessionStorage.getItem('ratsAssessmentResult');
    if(ratResult && this.isWeb) {
      this.ratAssessmentResult = JSON.parse(ratResult || '')
      if(this.ratAssessmentResult) {
        this.QrcodeUrl = `${window.location.origin}/viewresult?code=${this.ratAssessmentResult?.AssessmentGuid}`
      }
    }
    setTimeout(() => {
      this.tryLoadRiskMeterImage();
    }, 100);
  }

  tryLoadRiskMeterImage() {
    const canvasEl = this.summaryPage?.riskMeterComponent?.gaugeComponent?.gaugeContainerRef?.nativeElement;
    if (canvasEl) {
      // do html2canvas or whatever
    } else {
      console.warn('Gauge element not found');
    }
  }


  private updateGuidedTypeLabel() {
    this.guidedTypeLabel = this.guidedType === 'staff-guided' ? 'Staff-Guided' : 'Self-Guided';
  }


  async downloadPDF() {
    try {
      this.exportStarted.emit();
      // 1. Create the container for PDF content
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        padding: 18px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        max-width: 800px;
        background: white;
        box-sizing: border-box;
      `;

      // 2. Add title
      const title = document.createElement('h5');
      title.innerText = this.selectedAssessment || 'N/A';
      title.style.textAlign = 'center';
      title.style.marginBottom = '16px';
      title.style.fontWeight = 'bold';
      container.appendChild(title);

      // 3. Create row for Case Number, result info, and QR code
      const mainRow = document.createElement('div');
      mainRow.style.display = 'flex';
      mainRow.style.justifyContent = 'space-between';  // Space between left and right sections
      mainRow.style.alignItems = 'flex-start';
      mainRow.style.margin = '20px 0';

      // Left section: Case Number and Result Info
      const leftSection = document.createElement('div');
      leftSection.style.display = 'flex';
      leftSection.style.flexDirection = 'column';
      leftSection.style.gap = '10px';

      // Add user info (Case Number)
      const userInfo = document.createElement('div');
      userInfo.innerHTML = `<p><strong>Case Number:</strong> ${this.caseNumber || ''}</p>`;
      leftSection.appendChild(userInfo);

      // Add result info
      const resultInfo = document.createElement('div');
      resultInfo.style.display = 'inline-block';
      resultInfo.style.minWidth = '300px';  // Ensure enough space for text
      resultInfo.style.whiteSpace = 'normal';
      if (sessionStorage.getItem('isHits') === 'true') {
        resultInfo.innerHTML = `<p style="white-space: nowrap;">Thanks for taking the <strong>${this.selectedAssessment}</strong>.</p>`;
      } else if (this.isWeb) {
        resultInfo.innerHTML = `<p>Thanks for taking the <strong>${this.selectedAssessment}</strong> assessment.</p>
          ${this.guidedType === 'staff-guided' ? `
          <p><strong>Status:</strong> ${this.riskValue >= 20 ? 'Positive' : 'Negative'}</p>` : ''}`;
      } else if (sessionStorage.getItem('isSSripa') === 'true') {
        resultInfo.innerHTML = `<p>Thanks for taking the <strong>${this.selectedAssessment}</strong> assessment.</p>`;
      } else if (sessionStorage.getItem('isDanger') === 'true') {
        resultInfo.innerHTML = `<p>Thanks for taking the <strong>${this.selectedAssessment}</strong>.</p>`;
      }
      leftSection.appendChild(resultInfo);

      mainRow.appendChild(leftSection);

      // Right section: QR Code
      const rightSection = document.createElement('div');
      rightSection.style.display = 'flex';
      rightSection.style.flexDirection = 'column';
      rightSection.style.alignItems = 'center';  // Center align QR code

      const qrSpan = document.createElement('span');
      qrSpan.style.display = 'inline-block';
      qrSpan.style.textAlign = 'center';

      const qrLabel = document.createElement('p');
      qrLabel.innerText = 'Here is your QR Code.';
      qrLabel.style.marginBottom = '10px';
      qrSpan.appendChild(qrLabel);

      const qrCanvas = this.qrCodeElement?.qrcElement?.nativeElement.querySelector('canvas');
      if (qrCanvas) {
        const qrImg = document.createElement('img');
        qrImg.src = qrCanvas.toDataURL('image/png');
        qrImg.style.width = '128px';
        qrImg.style.height = '128px';
        qrSpan.appendChild(qrImg);

        const fixedUrl = this.QrcodeUrl.replace(/\\/g, '/');
        const urlObj = new URL(fixedUrl);
        const code = new URLSearchParams(urlObj.search).get('code');
        const codeInfo = document.createElement('p');
        codeInfo.innerText = `Code: ${code}`;
        codeInfo.style.marginTop = '10px';
        qrSpan.appendChild(codeInfo);
      }

      rightSection.appendChild(qrSpan);
      mainRow.appendChild(rightSection);
      container.appendChild(mainRow);

      // 4. Create row for score info and risk meter
      const scoreRiskRow = document.createElement('div');
      scoreRiskRow.style.display = 'flex';
      scoreRiskRow.style.justifyContent = 'space-between';
      scoreRiskRow.style.alignItems = 'flex-start';
      scoreRiskRow.style.margin = '20px 0';

      // Add score info to the new row
      const scoreInfo = document.createElement('span');
      scoreInfo.style.display = 'inline-block';
      if (sessionStorage.getItem('isHits') === 'true') {
        scoreInfo.innerHTML = `
          ${this.riskValue ? `<p><strong>Your score:</strong> <span><strong>${this.riskValue}</span></strong></p>` : ''}
          ${this.guidedType === 'staff-guided' ? 
            `<p><strong>Note:</strong> ${this.note || ''}.</p>
             <p><strong>Caution:</strong> ${this.caution || ''}</p>` : ''}
        `;
      }
      if (sessionStorage.getItem('isDanger') === 'true') {
        scoreInfo.innerHTML = `
          ${this.riskValue ? `<p><strong>Your score:</strong> <span><strong>${this.riskValue}</span></strong></p>` : ''}
          ${this.guidedType === 'staff-guided' ? 
            `<p><strong>Level of Danger:</strong> ${this.levelofdanger || ''}</p>` : ''}
          ${this.guidedType === 'self-guided' ? 
              `<p><strong>Please talk to your service provider about what the Danger Assessment means in your situation.</p>` : ''}
        `;
      }
      if (sessionStorage.getItem('isSSripa') === 'true') {
        scoreInfo.innerHTML = `
          ${this.guidedType === 'staff-guided' ? 
            `<p><strong>Please expediate action.</strong></p>` : ''}
          ${this.guidedType === 'self-guided' ? 
              `<p><strong>Take action immediately; talk to your service providers for assistance.</p>` : ''}
        `;
      }

      if(this.isWeb) {
        scoreInfo.innerHTML = `
          ${this.riskValue ? `<p><strong>Your score:</strong> <span><strong>${this.riskValue}</span></strong></p>` : ''}
        `;
      }

      scoreRiskRow.appendChild(scoreInfo);

      // Add risk meter to the new row
      this.isSSripa = sessionStorage.getItem('isSSripa') === 'true';
      const riskMeterContainer = !this.isSSripa ? this.summaryPage?.riskMeterComponent?.gaugeComponent?.gaugeContainerRef?.nativeElement : null;

      if (riskMeterContainer && !this.isWeb) {
        const scoreDisplayContainer = riskMeterContainer.querySelector('.score-display');
        if (scoreDisplayContainer) {
          scoreDisplayContainer.remove();
        }
        const meterSpan = document.createElement('span');
        meterSpan.style.display = 'inline-block';
        meterSpan.style.textAlign = 'center';

        const meterLabel = document.createElement('p');
        meterLabel.innerText = 'Risk Meter';
        meterLabel.style.marginBottom = '10px';
        meterSpan.appendChild(meterLabel);

        const gaugeClone = riskMeterContainer.cloneNode(true);
        const hiddenElements = gaugeClone.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach((el:any) => (el.style.display = 'block'));

        gaugeClone.style.width = '200px';
        gaugeClone.style.height = '128px';
        meterSpan.appendChild(gaugeClone);

        scoreRiskRow.appendChild(meterSpan);
      }

      container.appendChild(scoreRiskRow);

      // 5. Function to generate PDF
      const generatePDF = async (containerElement:any) => {
        const table = document.createElement('table');
table.style.cssText = `
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;
table.innerHTML = `
  <thead>
    <tr>
      <th style="border: 1px solid #ccc; padding: 8px; width: 80px; text-align: center; box-sizing: border-box;">S.No</th>
      <th style="border: 1px solid #ccc; padding: 8px; width: 470px; box-sizing: border-box;">Question</th>
      <th style="border: 1px solid #ccc; padding: 8px; width: 250px; box-sizing: border-box;">Answer</th>
    </tr>
  </thead>
  <tbody>
    ${this.responseJson.map((item:any, index:any) => {
      // Parent row
      let rows = `
        <tr style="page-break-inside: avoid;">
          <td style="border: 1px solid #ccc; padding: 8px; width: 80px; text-align: center; box-sizing: border-box;">${index + 1}</td>
          <td style="border: 1px solid #ccc; padding: 8px; width: 470px; box-sizing: border-box;">${item.question}</td>
          <td style="border: 1px solid #ccc; padding: 8px; width: 250px; text-align: center; box-sizing: border-box; text-transform: capitalize;">${item.answer}</td>
        </tr>
      `;
      // Child rows (if DAChild exists and is non-empty)
      if (item.DAChild && Array.isArray(item.DAChild) && item.DAChild.length > 0) {
        rows += item.DAChild.map((child:any, childIndex:any) => `
          <tr style="page-break-inside: avoid;">
            <td style="border: 1px solid #ccc; padding: 8px; width: 80px; text-align: center; box-sizing: border-box; padding-left: 20px;">${index + 1}${this.getCharFromCode(97 + childIndex)}</td>
            <td style="border: 1px solid #ccc; padding: 8px; width: 470px; box-sizing: border-box;">${child.question}</td>
            <td style="border: 1px solid #ccc; padding: 8px; width: 250px; text-align: center; box-sizing: border-box; text-transform: capitalize;">${child.answer}</td>
          </tr>
        `).join('');
      }
      return rows;
    }).join('')}
  </tbody>
`;
containerElement.appendChild(table);
        document.body.appendChild(containerElement);

        const canvas = await html2canvas(containerElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          windowWidth: containerElement.scrollWidth,
          windowHeight: containerElement.scrollHeight,
          allowTaint: true,
          logging: true,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('[style*="display: none"]').forEach(el => ((el as HTMLElement).style.display = 'block'));
          }
        });

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = { top: 15, bottom: 20, left: 15, right: 15 };
        const contentWidth = pageWidth - margin.left - margin.right;
        const contentHeight = pageHeight - margin.top - margin.bottom;

        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const totalPages = Math.ceil(imgHeight / contentHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.floor((contentHeight * canvas.height) / imgHeight);
          const ctx = sliceCanvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get context for PDF page slice');

          ctx.drawImage(
            canvas,
            0,
            i * contentHeight * (canvas.height / imgHeight),
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          pdf.addImage({
            imageData: sliceCanvas.toDataURL('image/png'),
            format: 'PNG',
            x: margin.left,
            y: margin.top,
            width: imgWidth,
            height: (sliceCanvas.height * imgWidth) / canvas.width
          });

          if (totalPages > 1) {
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Page ${i + 1} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          }
        }

        pdf.save(`${this.selectedAssessment || 'Assessment'} Result.pdf`);
      };

      await generatePDF(container);
      this.exportCompleted.emit();
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.exportFailed.emit();
    }
}

getCharFromCode(code: number): string {
  return String.fromCharCode(code);
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
    try {
      this.hasFetchedData = false; // Reset the flag to allow reloading
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
  
  fetchDaResults() {
    this.apiService.getDAresultcalculation().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          // debugger;
          this.daResult = response.data;
  
  
          this.rangevalue = this.daResult?.map((option:any) => ({
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


  fetchHitResults() {
    this.apiService.getHitsResultCalculation().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          
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

  
  checkSelectedAssessment(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.fetchWebResults(code);
    } else if(code && code.toLowerCase().includes('hits-')) {
    } else if(code && code.toLowerCase().includes('da-')) {
    } else if(code && code.toLowerCase().includes('dai-')) {
    } else if(code && code.toLowerCase().includes('cts-')) {
    } else if(code && code.toLowerCase().includes('ssripa-')) {
    } else {
      this.selectedAssessment = '';
    }
  }
  

  fetchWebResults(code: string) {
    this.apiService.getRatsResult(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.responseJson = response.assessmentSummary;
          this.riskValue = this.ratAssessmentResult?.assessmentScore;
          this.caseNumber = response?.caseNumber;
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

  takeAnotherAssessment() {
    sessionStorage.removeItem('hitsAssessmentResult');
    sessionStorage.removeItem('ratsAssessmentResult');
    sessionStorage.removeItem('ssripaAssessmentResult');
    sessionStorage.removeItem('daAssessmentResult');
    sessionStorage.removeItem('isHits');
    sessionStorage.removeItem('isSSripa');
    sessionStorage.removeItem('isDanger');
    sessionStorage.removeItem('selectedAssessment');
    this.caseNumber = '';
    this.selectedAssessment = null;
    this.hasFetchedData = false;
    this.isDanger = false;
    this.responseJson = [];
    this.router.navigate(['/riskassessment']);
  }

}