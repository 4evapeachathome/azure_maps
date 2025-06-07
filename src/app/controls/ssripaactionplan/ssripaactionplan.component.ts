import { Component, Input, OnInit } from '@angular/core';
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
    if (child.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (child.type === 'text' && text.includes('http')) {
      text = `<a href="${text}" target="_blank">${text}</a>`;
    }
    return text;
  }

  async exportAsPDF() {
    try {
      // Create an off-screen HTML container
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial';
      container.style.maxWidth = '800px';
  
      // Title
      const title = document.createElement('h2');
      title.innerText = this.quizTitle || 'Action Plan';
      container.appendChild(title);
  
      // Build action items table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Question</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.actionItems.map(item => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${item.text}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">
              ${item.actions.map((action: any) => {
                const html = this.renderRichText(action.description);
                return `<div>${html}</div>`;
              }).join('')}
            </td>
          </tr>
        `).join('')}
        </tbody>
      `;
      container.appendChild(table);
  
      // Hide off-screen and append
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
  
      // Render to canvas
      const canvas = await html2canvas(container, { scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
      pdf.save('SRRIPA Action Plan.pdf');
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export Action Plan PDF. Please try again.');
    }
  }
  

}
