import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';
import * as Gauge from 'gauge.js';
import html2pdf from 'html2pdf.js'; 
import { QRCodeComponent  } from 'angularx-qrcode';
import domtoimage from 'dom-to-image-more';


@Component({
  selector: 'app-assessmentsummary',
  templateUrl: './assessmentsummary.component.html',
  styleUrls: ['./assessmentsummary.component.scss'],
  standalone: true,
          imports: [CommonModule, IonicModule, FormsModule,QRCodeComponent],
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
  riskValue: number = 0; // Dynamic risk value (0-100)
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

  private gauge: any; // Store the gauge instance
  private updateSubscription!: Subscription; // For dynamic updates

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.initGauge();
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
  

  initGauge() {
    const canvas = document.getElementById('risk-gauge') as HTMLCanvasElement;
    if (!canvas) return;

    const opts = {
      angle: 0, // Semi-circle
      lineWidth: 0.44, // Thickness of the gauge
      radiusScale: 1.0, // Relative radius
      pointer: {
        length: 0.6, // Pointer length
        strokeWidth: 0.035, // Pointer thickness
        color: '#000000', // Pointer color
      },
      limitMax: false,
      limitMin: false,
      colorStart: '#6FADCF',
      colorStop: '#8FC0DA',
      strokeColor: '#E0E0E0',
      generateGradient: true,
      highDpiSupport: true,
      staticZones: [
        { strokeStyle: '#00FF00', min: 0, max: 33 }, // Green zone
        { strokeStyle: '#FFFF00', min: 33, max: 66 }, // Yellow zone
        { strokeStyle: '#FF0000', min: 66, max: 100 }, // Red zone
      ],
      staticLabels: {
        font: '10px sans-serif',
        labels: [0, 33, 66, 100],
        color: '#000000',
        fractionDigits: 0,
      },
    };

    this.gauge = new Gauge.Gauge(canvas).setOptions(opts);
    this.gauge.maxValue = 100;
    this.gauge.setMinValue(0);
    this.gauge.animationSpeed = 32;
    this.gauge.set(this.riskValue); // Set initial value
  }

  calculateRiskValue() {
    // Example algorithm: Replace with your actual risk calculation logic
    const factor1 = Math.random() * 50; // Simulate a factor (e.g., stress level)
    const factor2 = Math.random() * 50; // Simulate another factor (e.g., anxiety level)
    this.riskValue = Math.round((factor1 + factor2) / 2); // Average of the factors (0-100)

    // Update the gauge with the new value
    if (this.gauge) {
      this.gauge.set(this.riskValue);
    }
  }

  startDynamicUpdates() {
    // Simulate dynamic updates every 5 seconds (for demo purposes)
    this.updateSubscription = interval(5000).subscribe(() => {
      this.calculateRiskValue();
    });
  }

  viewUniqueAccess() {
    console.log('View Unique Access clicked');
  }

}
