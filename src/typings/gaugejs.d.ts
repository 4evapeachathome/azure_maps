declare module 'gauge.js' {
    export class Gauge {
      constructor(canvas: HTMLCanvasElement);
      setOptions(opts: any): Gauge;
      maxValue: number;
      setMinValue(val: number): void;
      animationSpeed: number;
      set(val: number): void;
    }
  }
  