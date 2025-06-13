import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RiskMeterComponent } from '../../risk-meter/risk-meter.component';

@Component({
  selector: 'app-summarypage',
  templateUrl: './summarypage.component.html',
  styleUrls: ['./summarypage.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RiskMeterComponent]
})
export class SummarypageComponent implements OnInit {
  loggedInUser: any = null;
  @Input() riskScore: number = 12;
  @ViewChild(RiskMeterComponent) riskMeterComponent!: RiskMeterComponent;
  loaded: boolean = false;
  @Input() range: Array<{ min: number; max: number; color: string; label: string }> = [
    { min: 0, max: 5, color: 'yellow', label: 'Low Risk' },
    { min: 5, max: 10, color: 'orange', label: 'Medium Risk' },
    { min: 10, max: 15, color: 'red', label: 'High Risk' }
  ];
  @Input() isRiskRed: boolean = false;

  rClassMap: { [key: string]: string } = {
    yellow: 'yellow',
    orange: 'orange',
    red: 'red'
  };

  constructor(
  ) { }

  ngOnInit() {
    this.loaded = true;
    debugger;
  }

  
  public getCanvasFromGauge(): HTMLCanvasElement | null {
    return this.riskMeterComponent?.getGaugeCanvas();
  }

  getRiskCategory(score: number): { color: string; label: string } | null {
    if (!this.range) return null;
  
    const matched = this.range.find(r => score >= r.min && score <= r.max);
  
    // If forceHighRiskLabel is true, return a category with "High risk" label
    if (this.isRiskRed) {
      const highRiskRange = this.range.find(r => r.label.toLowerCase() === 'high risk');
      return {
        color: matched?.color ? this.rClassMap[matched.color.toLowerCase()] || '' : '',
        label: highRiskRange?.label || 'High risk' // Use the "High risk" label
      };
    }
  
    return matched ? { color: this.rClassMap[matched.color.toLowerCase()] || '', label: matched.label } : null;
  }

}
