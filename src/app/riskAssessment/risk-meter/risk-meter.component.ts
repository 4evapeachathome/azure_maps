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
  @Input() greenRange: number = 5;
  @Input() orangeRange: number = 10;

  // Risk score value and thresholds
  value = 0;
  min = 0;
  max = 15;
  greenThreshold = 5;
  orangeThreshold = 10;

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
