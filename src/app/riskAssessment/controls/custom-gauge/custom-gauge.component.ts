import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface GaugeRange {
  min: number;
  max: number;
  color: string;
  label?: string;
}

interface GaugeSegment {
  path: string;
  color: string;
}

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
  @Input() max: number = 20;
  @ViewChild('gaugeContainer', { static: true }) gaugeContainerRef!: ElementRef;
  @Input() ranges: GaugeRange[] = [
    { min: 1, max: 7, color: 'Yellow', label: 'Low risk' },
    { min: 8, max: 10, color: 'Orange', label: 'Medium risk' },
    { min: 11, max: 20, color: 'Red', label: 'High risk' }
  ];
  normalisedRanges: GaugeRange[] = [];
  rotation: string = '0deg';
  gaugeColor: string = '#FFFF00';
  segments: GaugeSegment[] = [];
  markers: { value: number; color: string }[] = [];
  @Input() forceRedNeedle: boolean = false;

  constructor() {}

  ngOnInit() {
    this.normaliseRanges();
    this.calculateSegments();
    this.updateGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ranges']) {
      this.normaliseRanges();
      this.calculateSegments();
    }
  
    if (changes['value'] || changes['min'] || changes['max'] || changes['ranges'] || changes['forceRedNeedle']) {
      this.updateGauge();
    }
  }

  public getCanvasElement(): HTMLCanvasElement | null {
    return this.gaugeContainerRef?.nativeElement?.querySelector('canvas') || null;
  }

  public mapColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'Yellow': '#FFFF99',
      'Orange': '#FFA500',
      'Red': '#FF0000',
    };
    return colorMap[color] || color;
  }

  private normaliseRanges() {
    if (!Array.isArray(this.ranges) || this.ranges.length === 0) {
      this.normalisedRanges = [];
      this.min = 0;
      this.max = 100;
      return;
    }
  
    this.normalisedRanges = [...this.ranges]
      .sort((a, b) => a.min - b.min)
      .map(range => ({
        ...range,
        color: this.mapColor(range.color)
      }));
  
    // Set min to the first range's min, not the input min
    this.min = this.normalisedRanges[0]?.min ?? 0;
    this.max = this.normalisedRanges[this.normalisedRanges.length - 1]?.max ?? 100;
  }

  private calculateSegments() {
    this.segments = [];

    const span = this.max - this.min;
    let lastEndDeg = -90;

    this.normalisedRanges.forEach((r, idx) => {
      const startPct = (r.min - this.min) / span;
      let endPct = (r.max - this.min) / span;

      const startDeg = -90 + startPct * 180;
      let endDeg = -90 + endPct * 180;

      if (idx < this.normalisedRanges.length - 1) {
        const nextRange = this.normalisedRanges[idx + 1];
        const nextStartPct = (nextRange.min - this.min) / span;
        const nextStartDeg = -90 + nextStartPct * 180;

        if (nextStartDeg > endDeg) {
          endDeg = nextStartDeg;
        }
      }

      this.segments.push({
        path: this.describeArc(100, 100, 80, startDeg, endDeg),
        color: r.color
      });

      lastEndDeg = endDeg;
    });
  }

  private updateGauge() {
    if (!Array.isArray(this.normalisedRanges) || this.normalisedRanges.length === 0) {
      this.rotation = '-90deg';
      this.gaugeColor = '#ccc';
      return;
    }
  
    let adjustedValue = this.value;
    const redRange = this.normalisedRanges.find(r => r.min === 11 && r.max === 20);
  
    if (this.forceRedNeedle) {
      this.gaugeColor = '#FF0000';
      adjustedValue = redRange?.min || 11;
    } else {
      const hit = this.normalisedRanges.find(r => this.value >= r.min && this.value <= r.max);
      this.gaugeColor = hit?.color ?? this.normalisedRanges[0].color;
    }
  
    const pct = (adjustedValue - this.min) / (this.max - this.min);
    this.rotation = `${-90 + pct * 180}deg`;
  }


  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  public describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
}