import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import { NgxGaugeModule } from 'ngx-gauge';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SummarypageComponent } from "../summarypage/summarypage.component";
import { AssessmentTableComponent } from '../assessment-table/assessment-table.component';
import { presentToast } from 'src/shared/utility';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, QRCodeComponent, NgxGaugeModule, SummarypageComponent, AssessmentTableComponent]
})
export class AssessmentsummaryComponent  implements OnInit, AfterViewInit {
  @Input() reloadFlag: boolean = false;
  hidePdfContainer = true;
  caseNumber: string='';
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
  assessmentNumber: string = '';
  hasFetchedData: boolean = false; // Track if logins have been fetched


  constructor(private cdRef:ChangeDetectorRef,private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute, private toastController: ToastController) { }

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
    console.log('this.selectedAssessment =', this.selectedAssessment);

    if(this.isSSripa) {
      const resultStr = sessionStorage.getItem('ssripaAssessmentResult');
      if (resultStr) {
        const result = JSON.parse(resultStr);
        // debugger;
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
    
    if(this.activatedRoute.snapshot.queryParamMap.get('code')) {
      this.assessmentNumber = this.activatedRoute.snapshot.queryParamMap.get('code') || '';
    } else {
      let ratResult = sessionStorage.getItem('ratsAssessmentResult');
      if(ratResult) {
        this.ratAssessmentResult = JSON.parse(ratResult || '');
        this.assessmentNumber = this.ratAssessmentResult.asssessmentNumber;
      }
    }
    this.checkSelectedAssessment(this.assessmentNumber);
  }

  ngAfterViewInit(): void {
    let ratResult = sessionStorage.getItem('ratsAssessmentResult');
    if(ratResult) {
      this.ratAssessmentResult = JSON.parse(ratResult || '')
      if(this.ratAssessmentResult) {
        this.ratQrCodeValue = `${window.location.origin}/viewresult?code=${this.ratAssessmentResult?.asssessmentNumber}`
      }
    }
    setTimeout(() => {
      this.tryLoadRiskMeterImage();
    }, 100);
  }

  tryLoadRiskMeterImage() {
    const canvasEl = this.summaryPage?.riskMeterComponent?.gaugeComponent?.gaugeContainerRef?.nativeElement?.querySelector('svg.gauge-segments');
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
      title.innerText = `Assessment: ${this.selectedAssessment || 'N/A'}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '16px';
      container.appendChild(title);

      // 3. Add user info
      const userInfo = document.createElement('div');
      userInfo.innerHTML = `<p><strong>Case Number:</strong> ${this.caseNumber || 'N/A'}</p>`;
      container.appendChild(userInfo);

      // 4. Add result info
      const resultInfo = document.createElement('div');
      if (sessionStorage.getItem('isHits') === 'true') {
        resultInfo.innerHTML = `<p>Thanks for taking the <strong>${this.selectedAssessment}</strong> assessment.</p>
          ${this.riskValue ? `<p><strong>Here is your score:</strong> <span>${this.riskValue}</span></p>` : ''}
          ${this.guidedType === 'staff-guided' ? `
            <p><strong>Note:</strong> ${this.note || ''}</p>
            <p><strong>Caution:</strong> ${this.caution || ''}</p>` : ''}`;
      } else if (sessionStorage.getItem('isSSripa') === 'true') {
        resultInfo.innerHTML = `
          <p>Thanks for taking the <strong>${this.selectedAssessment}</strong> assessment.</p>`;
      }
      container.appendChild(resultInfo);

      // 5. Create row for QR code and gauge
      const rowDiv = document.createElement('div');
      rowDiv.style.display = 'flex';
      rowDiv.style.justifyContent = 'center';
      rowDiv.style.alignItems = 'flex-start';
      rowDiv.style.gap = '30px';
      rowDiv.style.margin = '20px 0';

      // 6. Add QR code
      const qrCanvas = this.qrCodeElement?.qrcElement?.nativeElement.querySelector('canvas');
      if (qrCanvas) {
        const qrSpan = document.createElement('span');
        qrSpan.style.display = 'inline-block';
        qrSpan.style.textAlign = 'center';

        const qrLabel = document.createElement('p');
        qrLabel.innerText = 'Here is your QR Code.';
        qrLabel.style.marginBottom = '10px';
        qrSpan.appendChild(qrLabel);

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

        rowDiv.appendChild(qrSpan);
      }

      // 7. Function to generate PDF
      const generatePDF = async (containerElement: HTMLElement) => {
        const table = document.createElement('table');
        table.style.cssText = `
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        `;
        table.innerHTML = `
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px;">Question</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Answer</th>
            </tr>
          </thead>
          <tbody>
            ${this.responseJson.map((item: any) => `
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #ccc; padding: 8px;">${item.question}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${item.answer}</td>
              </tr>
            `).join('')}
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
            // Ensure all elements are visible in the cloned document
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

      // 8. Capture the risk meter (gauge)
      this.isSSripa = sessionStorage.getItem('isSSripa') === 'true';
      const riskMeterContainer = !this.isSSripa ? this.summaryPage?.riskMeterComponent?.gaugeComponent?.gaugeContainerRef?.nativeElement : null;

      if (riskMeterContainer) {

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

        // Clone the gauge container to preserve styles and structure
        const gaugeClone = riskMeterContainer.cloneNode(true) as HTMLElement;

        // Make sure all hidden elements are visible for capture
        const hiddenElements = gaugeClone.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach((el) => ((el as HTMLElement).style.display = 'block'));

        // Set dimensions for the cloned gauge
        gaugeClone.style.width = '200px';
        gaugeClone.style.height = '128px';

        // Append the cloned gauge to the meter span
        meterSpan.appendChild(gaugeClone);
        rowDiv.appendChild(meterSpan);
        container.appendChild(rowDiv);

        // Force Angular to update the view
        this.cdRef.detectChanges();
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for rendering

        // Generate the PDF
        await generatePDF(container);
      } else {
        // Fallback: Generate PDF without the gauge if it's not found
        console.error('Gauge container not found');
        container.appendChild(rowDiv);
        await generatePDF(container);
      }

    } catch (err) {
      console.error('Export to PDF failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      // Clean up temporary elements
      const elements = document.querySelectorAll('div[style*="left: -9999px"]');
      elements.forEach((el) => (el as HTMLElement).remove());
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

  
  checkSelectedAssessment(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.fetchWebResults(code);
    } else if(code && code.toLowerCase().includes('hit-')) {
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
          console.log('response!!!!!', response);
          this.responseJson = response.assessmentSummary;
          this.showToast(response?.message || 'Assessment summary fetch successfully.', 3000, 'top');
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

}