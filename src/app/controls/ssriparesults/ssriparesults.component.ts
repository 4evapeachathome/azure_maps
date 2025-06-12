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
  @Input() myAngularxQrCode: string = ''; // QR code content
  @ViewChild('resultContent', { static: false }) resultContent!: ElementRef;
  @ViewChild('qrCodeElement', { static: false }) qrCodeElement!: QRCodeComponent;
  qrcodeUrl: string = '';

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
      const title = document.createElement('h5');
    title.innerText = this.quizTitle;
    title.style.textAlign = 'center';
    title.style.marginBottom = '16px';
    title.style.fontWeight = 'bold';
    container.appendChild(title);

    // 3. Create a flex container for the thank-you message and QR code section
    const topSection = document.createElement('div');
    topSection.style.display = 'flex';
    topSection.style.justifyContent = 'space-between';
    topSection.style.alignItems = 'center';
    topSection.style.marginBottom = '20px';

    // Left side: Thank-you message
    const leftContent = document.createElement('div');
    leftContent.style.flex = '1';

    const thanks = document.createElement('p');
    thanks.innerText = 'Thank you for completing the assessment.';
    thanks.style.marginLeft = '25px'; // Add margin-left to shift the text
    leftContent.appendChild(thanks);

    // Right side: QR code and text
    const rightContent = document.createElement('div');
    rightContent.style.textAlign = 'center';
    rightContent.style.width = '128px';

    // QR code text (above the QR code)
    const qrtext = document.createElement('p');
    qrtext.innerText = 'Here is your QR code';
    qrtext.style.marginBottom = '10px';
    rightContent.appendChild(qrtext);

    // QR code image
    const qrCanvas = this.qrCodeElement?.qrcElement?.nativeElement.querySelector('canvas');
    if (!qrCanvas) throw new Error('QR code rendering failed.');
    const qrImg = document.createElement('img');
    qrImg.src = qrCanvas.toDataURL('image/png');
    qrImg.style.width = '128px';
    qrImg.style.height = '128px';
    qrImg.style.display = 'block';
    rightContent.appendChild(qrImg);

    // QR code link/text (below the QR code)
    const link = document.createElement('div');
    link.innerText = this.myAngularxQrCode || '';
    link.style.marginTop = '10px';
    link.style.wordBreak = 'break-word';
    link.style.fontSize = '12px';
    rightContent.appendChild(link);

    topSection.appendChild(leftContent);
    topSection.appendChild(rightContent);
    container.appendChild(topSection);
  
      // Table
      const table = document.createElement('table');
      table.style.width = '800px';  // Match the container's max-width
      table.style.borderCollapse = 'collapse';
      table.style.tableLayout = 'fixed';  // Enforce fixed layout
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px; width: 80px; text-align: center; box-sizing: border-box;">S.No</th>
            <th style="border: 1px solid #ccc; padding: 8px; width: 700px; box-sizing: border-box;">Question</th>
            <th style="border: 1px solid #ccc; padding: 8px; width: 100px; box-sizing: border-box;">Answer</th>
          </tr>
        </thead>
        <tbody>
          ${this.sripa.map((q, i) => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px; width: 50px; text-align: center; box-sizing: border-box;">${i + 1}</td>
              <td style="border: 1px solid #ccc; padding: 8px; width: 500px; box-sizing: border-box;">${q.text}</td>
              <td style="border: 1px solid #ccc; padding: 8px; width: 250px; text-align: center; box-sizing: border-box;">
  ${this.selectedOptions[i] ? 
    this.selectedOptions[i].charAt(0).toUpperCase() + this.selectedOptions[i].slice(1).toLowerCase() : 
    ''
  }
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
      pdf.save('SRRIPA Result.pdf');
  
      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF export failed:', error);
      // Optionally show an alert or toast
      alert('Failed to export PDF. Please try again.');
    }
  }

  checkHighSeverity(): void {
    this.qrcodeUrl =`${window.location.origin}/viewresult?${this.myAngularxQrCode}`
    this.highSeverityTriggered = this.sripa.some((q, idx) =>
      this.selectedOptions[idx] === 'yes' && q.severity?.toLowerCase() === 'high'
    );
  }
}
