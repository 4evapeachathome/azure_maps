import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiRateLimiterService {
  private readonly MAX_REQUESTS_PER_HOUR = 200;
  private readonly TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private readonly STORAGE_KEY = 'google_api_requests';

  constructor() {}

  private loadTimestamps(): number[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveTimestamps(timestamps: number[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timestamps));
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    const timestamps = this.loadTimestamps().filter(ts => now - ts < this.TIME_WINDOW_MS);
    return timestamps.length < this.MAX_REQUESTS_PER_HOUR;
  }

  recordRequest(): void {
    const now = Date.now();
    const timestamps = this.loadTimestamps().filter(ts => now - ts < this.TIME_WINDOW_MS);
    timestamps.push(now);
    this.saveTimestamps(timestamps);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const timestamps = this.loadTimestamps().filter(ts => now - ts < this.TIME_WINDOW_MS);
    return this.MAX_REQUESTS_PER_HOUR - timestamps.length;
  }

  clearUsage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
