import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';

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
  pdfExport(){
    
  }

  checkHighSeverity(): void {
    this.highSeverityTriggered = this.sripa.some((q, idx) =>
      this.selectedOptions[idx] === 'yes' && q.severity?.toLowerCase() === 'high'
    );
  }
}
