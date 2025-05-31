import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-custom-gauge',
  templateUrl: './custom-gauge.component.html',
  styleUrls: ['./custom-gauge.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CustomGaugeComponent implements OnInit, OnChanges {
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 15;
  @Input() greenThreshold: number = 5;
  @Input() orangeThreshold: number = 10;

  rotation: string = '0deg';
  gaugeColor: string = '#4CAF50';

  constructor() { }

  ngOnInit() {
    this.updateGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateGauge();
  }

  private updateGauge() {
    // Calculate rotation (-90 to 90 degrees)
    const percentage = (this.value - this.min) / (this.max - this.min);
    const degrees = -90 + (percentage * 180);
    this.rotation = `${degrees}deg`;

    // Update color based on value
    if (this.value <= this.greenThreshold) {
      this.gaugeColor = '#4CAF50'; // Green
    } else if (this.value <= this.orangeThreshold) {
      this.gaugeColor = '#FFA500'; // Orange
    } else {
      this.gaugeColor = '#FF0000'; // Red
    }
  }
}
