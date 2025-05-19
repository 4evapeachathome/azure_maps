import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import domtoimage from 'dom-to-image-more';
import { NgxGaugeModule } from 'ngx-gauge';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
          imports: [CommonModule, IonicModule, FormsModule,QRCodeComponent,NgxGaugeModule],
})
export class AssessmentsummaryComponent  implements OnInit, AfterViewInit, OnDestroy {
  hidePdfContainer = true;
  myAngularxQrCode = 'Your QR code data string';
  caseNumber: string='';
  caseNumberPlaceholder: string = 'Pick Assessment Results';
  loggedInUser: { username: string } = { username: '' };
  userName: string = 'Janet Molson';
  guidedType: string = 'Staff-Guided';
  assessmentTitle: string = 'Risk Assessment Results';
  testResultsTitle: string = 'Your Test results';
  testResultLabel: string = 'XXXXX'; // Replace with actual dynamic value
  riskValue: number = 65; // Dynamic risk value (0-100)
  recommendationIntro: string = 'We recommend a few courses of action:';
  recommendationText: string =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum fermentum odio id aliquet faucibus. Pellentesque et dictum purus.';
  riskLevelsTitle: string = 'Risk Levels';
  stressCurveLabel: string = 'Stress Curve';
  uniqueAccessLabel: string = 'This XXXX Unique Access'; // Replace XXXX with dynamic value
  accessCodeLabel: string = 'Access Code';
  accessCode: string = 'empathy-direction-potato-yankee';
  @ViewChild('qrcodeEl', { static: false }) qrcodeEl!: QRCodeComponent;
  @ViewChild('pdfExportContainer', { static: false }) pdfExportContainer!: ElementRef;
  @ViewChild('qrImage', { static: false }) qrImage!: ElementRef<HTMLImageElement>;
  @ViewChild('gaugeCanvas', { static: false }) gaugeCanvas!: ElementRef<HTMLCanvasElement>;
  private gauge: any;
  

  private updateSubscription!: Subscription; // For dynamic updates

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.calculateRiskValue(); // Initial calculation
    this.startDynamicUpdates(); // Start dynamic updates (optional, for demo)
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe(); // Clean up subscription
    }
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
  
  startDynamicUpdates() {
    this.updateSubscription = interval(5000).subscribe(() => {
      this.calculateRiskValue();
    });
  }
  
  calculateRiskValue() {
    const factor1 = Math.random() * 50;
    const factor2 = Math.random() * 50;
    this.riskValue = Math.round((factor1 + factor2) / 2);
  }

  viewUniqueAccess() {
    console.log('View Unique Access clicked');
  }

}
