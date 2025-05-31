import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
  @Input() max: number = 15;
  @Input() ranges: GaugeRange[] = [
    { min: 0, max: 5, color: '#4CAF50', label: 'Low Risk' },
    { min: 5, max: 10, color: '#FFA500', label: 'Medium Risk' },
    { min: 10, max: 15, color: '#FF0000', label: 'High Risk' }
  ];

  rotation: string = '0deg';
  gaugeColor: string = '#4CAF50';
  segments: GaugeSegment[] = [];
  markers: { value: number; color: string }[] = [];

  constructor() { }

  ngOnInit() {
    this.calculateSegments();
    this.updateGauge();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ranges']) {
      this.calculateSegments();
    }
    this.updateGauge();
  }

  private calculateSegments() {
    this.segments = [];
    this.markers = [];

    // Sort ranges by min value to ensure proper order
    const sortedRanges = [...this.ranges].sort((a, b) => a.min - b.min);

    // Calculate total angle range (180 degrees from -90 to 90)
    const totalAngle = 180;
    const startAngle = -90;

    // Add markers for all range boundaries
    sortedRanges.forEach(range => {
      this.markers.push({ value: range.min, color: range.color });
      if (range === sortedRanges[sortedRanges.length - 1]) {
        this.markers.push({ value: range.max, color: range.color });
      }
    });

    // Calculate SVG paths for each segment
    sortedRanges.forEach((range, index) => {
      const rangeSize = range.max - range.min;
      const totalSize = this.max - this.min;
      const angleSize = (rangeSize / totalSize) * totalAngle;
      
      const segmentStartAngle = startAngle + ((range.min - this.min) / totalSize) * totalAngle;
      const segmentEndAngle = segmentStartAngle + angleSize;

      // Calculate SVG arc path
      const path = this.describeArc(50, 50, 40, segmentStartAngle, segmentEndAngle);
      
      this.segments.push({
        path,
        color: range.color
      });
    });
  }

  private updateGauge() {
    // Calculate rotation (-90 to 90 degrees)
    const percentage = (this.value - this.min) / (this.max - this.min);
    const degrees = -90 + (percentage * 180);
    this.rotation = `${degrees}deg`;

    // Update color based on current value
    const currentRange = this.ranges.find(range => 
      this.value >= range.min && this.value <= range.max
    );
    this.gaugeColor = currentRange?.color || this.ranges[0].color;
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
}
