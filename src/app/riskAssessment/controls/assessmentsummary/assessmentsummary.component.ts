import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, QRCodeComponent, NgxGaugeModule, SummarypageComponent]
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
  hasFetchedData: boolean = false; // Track if logins have been fetched


  constructor(private cookieService:CookieService,private router:Router,private apiService:ApiService, private alertController:AlertController, private activatedRoute: ActivatedRoute) { }

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
  
      const title = document.createElement('h5');
      title.innerText = `Assessment: ${this.selectedAssessment || 'N/A'}`;
      title.style.textAlign = 'center';
      title.style.marginBottom = '16px';
      container.appendChild(title);
  
      const userInfo = document.createElement('div');
      userInfo.innerHTML = `<p><strong>Case Number:</strong> ${this.caseNumber || 'N/A'}</p>`;
      container.appendChild(userInfo);
  
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
  
      const rowDiv = document.createElement('div');
      rowDiv.style.display = 'flex';
      rowDiv.style.justifyContent = 'center';
      rowDiv.style.alignItems = 'flex-start';
      rowDiv.style.gap = '30px';
      rowDiv.style.margin = '20px 0';
  
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
          windowHeight: containerElement.scrollHeight
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
            0, i * contentHeight * (canvas.height / imgHeight),
            canvas.width, sliceCanvas.height,
            0, 0,
            canvas.width, sliceCanvas.height
          );
  
          pdf.addImage({
            imageData: sliceCanvas.toDataURL('image/png'),
            format: 'PNG',
            x: margin.left,
            y: margin.top,
            width: imgWidth,
            height: (sliceCanvas.height * imgWidth) / canvas.width
          });
  
          // Page number
          if (totalPages > 1) {
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Page ${i + 1} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          }
        }
  
        pdf.save(`${this.selectedAssessment || 'Assessment'} Result.pdf`);
      };
  
      const riskMeterSVG = this.summaryPage?.riskMeterComponent?.gaugeComponent?.gaugeContainerRef?.nativeElement?.querySelector('svg');
      if (riskMeterSVG) {
        const meterSpan = document.createElement('span');
        meterSpan.style.display = 'inline-block';
        meterSpan.style.textAlign = 'center';
      
        // ✅ Use setTimeout to ensure SVG rendering completes
        setTimeout(async () => {
          try {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(riskMeterSVG);
            const cleanedSvg = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      
            // ✅ Convert SVG to Blob and then to Image
            const svgBlob = new Blob([cleanedSvg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
      
            const img = new Image();
            img.onload = async () => {
              URL.revokeObjectURL(url); // Clean up
              img.style.width = '200px';
              img.style.height = '128px';
              meterSpan.appendChild(img);
              rowDiv.appendChild(meterSpan);
              container.appendChild(rowDiv);
      
              await new Promise(r => setTimeout(r, 100)); // Small delay for DOM update
              await generatePDF(container);
            };
            img.onerror = () => {
              console.error('Failed to load risk meter SVG image');
              container.appendChild(rowDiv);
              generatePDF(container); // Fallback without risk meter
            };
            img.src = url;
          } catch (err) {
            console.error('Error processing SVG:', err);
            container.appendChild(rowDiv);
            await generatePDF(container);
          }
        }, 100); // Small delay to ensure SVG is ready
      }
  
 
  
    } catch (err) {
      console.error('Export to PDF failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      const elements = document.querySelectorAll('div[style*="left: -9999px"]');
      elements.forEach(el => el.remove());
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