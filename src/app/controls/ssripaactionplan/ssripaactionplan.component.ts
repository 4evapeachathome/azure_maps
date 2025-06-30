import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'pathome-ssripaactionplan',
  templateUrl: './ssripaactionplan.component.html',
  styleUrls: ['./ssripaactionplan.component.scss'],
  standalone: true,
      imports: [CommonModule, IonicModule, FormsModule]
})
export class SsripaactionplanComponent  implements OnInit {
  @Input() sripa: any[] = [];
  @Input() quizTitle: string = '';
  @Input() selectedOptions: string[] = [];
  myAngularxQrCode: string = 'https://http://localhost:8100/login'; // QR code content
  @Output() hideloader = new EventEmitter<void>();
  @Output() showloader = new EventEmitter<void>();
  constructor() { }



  actionItems: any[] = [];

  ngOnInit(): void {
    this.actionItems = this.sripa
      .map((q, idx) => {
        if (this.selectedOptions[idx] === 'yes') {
          return {
            text: q.text,
            severity: q.severity,
            actions: q.actions || [],
          };
        }
        return null;
      })
      .filter(item => item !== null);
  }

  renderRichText(blocks: any[]): string {
    if (!blocks) return '';
  
    const html = blocks.map((block: any) => {
      if (block.type === 'paragraph') {
        const text = block.children.map((child: any) => this.renderText(child)).join('');
        return `<p>${text}</p>`;
      }
  
      if (block.type === 'list') {
        const items = block.children.map((item: any) =>
          `<li>${item.children.map((child: any) => this.renderText(child)).join('')}</li>`
        ).join('');
        return `<ul>${items}</ul>`;
      }
  
      return '';
    }).join('');
  
    return html;
  }
  
  renderText(child: any): string {
  let text = child.text || '';

  // Handle links
  if (child.type === 'link' && child.url && child.children) {
    let url = child.url.trim();

    // Add protocol if missing
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    const innerText = child.children.map((c: any) => this.renderText(c)).join('');
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${innerText}</a>`;
  }

  // Handle bold
  if (child.bold) {
    text = `<strong>${text}</strong>`;
  }

  return text;
}

  async exportAsPDF() {
    try {
      // Create container with proper styling
      this.showloader.emit();
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        padding: 20px;
        font-family: Arial;
        max-width: 800px;
        background: white;
        box-sizing: border-box;
      `;
  
      // Add title
      const title = document.createElement('h2');
      title.innerText = this.quizTitle || 'Action Plan';
      title.style.textAlign = 'center';
      title.style.marginBottom = '16px';
      title.style.fontWeight = 'bold';
      container.appendChild(title);
  
      // Build table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      `;
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">Question</th>
            <th style="border: 1px solid #ccc; padding: 8px; background: #f5f5f5;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.actionItems.map(item => `
          <tr style="page-break-inside: avoid;">
            <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${item.text}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              ${item.actions.map((action: any) => {
                const html = this.renderRichText(action.description);
                return `<div style="margin-bottom: 8px;">${html}</div>`;
              }).join('')}
            </td>
          </tr>
        `).join('')}
        </tbody>
      `;
      container.appendChild(table);
      document.body.appendChild(container);
  
      // PDF configuration
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = { top: 15, right: 15, bottom: 20, left: 15 };
      const contentWidth = pageWidth - margin.left - margin.right;
      const contentHeight = pageHeight - margin.top - margin.bottom;
  
      // Render to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      });
  
      // Calculate image dimensions
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / contentHeight);
  
      // Add image slices for each page
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
  
        // Calculate slice parameters
        const sliceHeight = Math.min(contentHeight, imgHeight - (i * contentHeight));
        const sliceY = i * contentHeight;
  
        // Create canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight * canvas.height) / imgHeight;
        const ctx = sliceCanvas.getContext('2d');
        
        if (!ctx) throw new Error('Could not get canvas context');
        
        // Draw slice
        ctx.drawImage(
          canvas,
          0, sliceY * (canvas.height / imgHeight),
          canvas.width, sliceCanvas.height,
          0, 0,
          canvas.width, sliceCanvas.height
        );
  
        // Add to PDF
        pdf.addImage({
          imageData: sliceCanvas.toDataURL('image/png'),
          format: 'PNG',
          x: margin.left,
          y: margin.top,
          width: imgWidth,
          height: sliceHeight
        });
  
        // Add page number
        if (totalPages > 1) {
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(
            `Page ${i + 1} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      }
      this.hideloader.emit();
      pdf.save('SSRIPA Action Plan.pdf');
    } catch (error: any) {
      console.error('PDF export failed:', error);
      this.hideloader.emit();
      alert(`PDF export failed: ${error.message || 'Unknown error'}`);
    } finally {
      // Clean up
      this.hideloader.emit();
      const elements = document.querySelectorAll('div[style*="left: -9999px"]');
      elements.forEach(el => el.remove());
    }
  }
  

}
