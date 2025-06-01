import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CustomGaugeComponent } from '../controls/custom-gauge/custom-gauge.component';

@Component({
  selector: 'app-risk-meter',
  templateUrl: './risk-meter.component.html',
  styleUrls: ['./risk-meter.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, CustomGaugeComponent]
})
export class RiskMeterComponent implements OnInit, OnChanges {
  @Input() score: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 15;
  @Input() ranges: Array<{ min: number; max: number; color: string; label: string }> = [
    { min: 0, max: 5, color: '#4CAF50', label: 'Risk' },
    { min: 5, max: 10, color: '#FFA500', label: 'Medium Risk' },
    { min: 10, max: 15, color: '#FF0000', label: 'High Risk' }
  ];

  value = 0;

  constructor() { }

  ngOnInit() {
    this.updateGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateGauge();
  }

  private updateGauge() {
    this.value = this.score;
  }
}
