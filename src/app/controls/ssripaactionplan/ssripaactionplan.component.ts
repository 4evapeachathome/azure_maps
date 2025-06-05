import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'pathome-ssripaactionplan',
  templateUrl: './ssripaactionplan.component.html',
  styleUrls: ['./ssripaactionplan.component.scss'],
  standalone: true,
      imports: [CommonModule, IonicModule, FormsModule,QRCodeComponent]
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

  pdfExport(){

  }
}
