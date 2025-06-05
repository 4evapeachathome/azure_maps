import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'pathome-ssriparesults',
  templateUrl: './ssriparesults.component.html',
  styleUrls: ['./ssriparesults.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule, FormsModule,QRCodeComponent]
})
export class SsriparesultsComponent  implements OnInit {
  @Input() quizTitle: string = '';
  @Input() sripa: any[] = [];
  @Input() selectedOptions: string[] = [];
  myAngularxQrCode: string = 'https://http://localhost:8100/login'; // QR code content
  @ViewChild('resultContent', { static: false }) resultContent!: ElementRef;
  @ViewChild('qrCodeElement', { static: false }) qrCodeElement!: QRCodeComponent;

  highSeverityTriggered = false;

  constructor() {}
  // This component receives the quiz title, questions, and selected options as inputs

  ngOnInit() {
    this.checkHighSeverity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-run severity check when inputs change
    if (changes['sripa'] || changes['selectedOptions']) {
      this.checkHighSeverity();
    }
  }

  async exportToPDF() {
    try {
      // Generate basic export content
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial';
  
      // Title
      const title = document.createElement('h2');
      title.innerText = this.quizTitle;
      container.appendChild(title);
  
      // Thank you message
      const thanks = document.createElement('p');
      thanks.innerText = 'Thank you for completing the assessment.';
      container.appendChild(thanks);
  
      // QR Code image
      const qrCanvas = this.qrCodeElement?.qrcElement?.nativeElement.querySelector('canvas');
      if (!qrCanvas) throw new Error('QR code rendering failed.');
      const qrImg = document.createElement('img');
      qrImg.src = qrCanvas.toDataURL('image/png');
      qrImg.style.width = '128px';
      qrImg.style.height = '128px';
      qrImg.style.display = 'block';
      qrImg.style.margin = '20px auto';
      container.appendChild(qrImg);
  
      // Table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Question</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Yes</th>
            <th style="border: 1px solid #ccc; padding: 8px;">No</th>
          </tr>
        </thead>
        <tbody>
          ${this.sripa.map((q, i) => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">
                ${q.text}
                <div>Rating: ${q.severity}</div>
              </td>
              <td style="text-align: center; border: 1px solid #ccc; padding: 8px;">
                ${this.selectedOptions[i] === 'yes' ? '✔' : ''}
              </td>
              <td style="text-align: center; border: 1px solid #ccc; padding: 8px;">
                ${this.selectedOptions[i] === 'no' ? '✔' : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
      container.appendChild(table);
  
      // Warning message
      if (this.highSeverityTriggered) {
        const warning = document.createElement('div');
        warning.innerHTML = `<strong style="color: red; margin-top: 20px; display: block;">
          Take action immediately; talk to your service providers for assistance.
        </strong>`;
        container.appendChild(warning);
      }
  
      // Append to body off-screen
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
  
      // Convert to canvas
      const canvas = await html2canvas(container, { scale: 2 });
  
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ssripa-results.pdf');
  
      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF export failed:', error);
      // Optionally show an alert or toast
      alert('Failed to export PDF. Please try again.');
    }
  }

  checkHighSeverity(): void {
    this.highSeverityTriggered = this.sripa.some((q, idx) =>
      this.selectedOptions[idx] === 'yes' && q.severity?.toLowerCase() === 'high'
    );
  }
}
