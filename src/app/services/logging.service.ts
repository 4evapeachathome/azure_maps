import { Injectable } from '@angular/core';
import { LoggingConfig } from '../models/logging-config.interface';
import { ApiService } from './api.service';
import { CookieService } from 'ngx-cookie-service';
import { presentToast } from 'src/shared/utility';
import { ToastController } from '@ionic/angular';

export interface LogEntry {
    dateTime: string;
    requestedBy: string;
    activityType: string;
    errorFunction: string;
    errorMessage: any;
    requestURL: any;
    requestParams: any;
    statusCode?: number;
    device: any;
}

@Injectable({
    providedIn: 'root'
})
export class LoggingService {
    private config: LoggingConfig;
    private readonly LOG_PREFIX = 'NSF_';
    loggedInUser:any = null;

    constructor(private apiService: ApiService, private cookieService:CookieService, private toastController: ToastController) {
        // Default configuration - should be overridden by environment settings
        this.config = {
            enabled: false,
            storageType: 'local',
            maxLogAge: 30 // 30 days default retention
        };

        const encodedUser = this.cookieService.get('userdetails');
        if (encodedUser) {
            this.loggedInUser = JSON.parse(atob(encodedUser));
        }
    }

    setConfig(config: LoggingConfig) {
        this.config = {
            ...config,
            maxLogAge: config.maxLogAge || 30
        };
        this.cleanOldLogs();
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }

    enable() {
        this.config.enabled = true;
    }

    disable() {
        this.config.enabled = false;
    }

    private formatLogEntry(entry: LogEntry): string {
        return `${entry.dateTime}, ${entry.requestedBy}, ${entry.activityType}, ${entry.errorFunction}, ${entry.errorMessage}, ${entry.requestURL}, ${entry.requestParams} ${entry.statusCode ? `, ${entry.statusCode}` : ''}`;
    }

    private getLogKey(date: Date): string {
        const dateStr = date.toISOString().split('T')[0];
        return `${this.LOG_PREFIX}${dateStr}`;
    }

    private cleanOldLogs() {
        try {
            const now = new Date();
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.LOG_PREFIX)) {
                    const dateStr = key.replace(this.LOG_PREFIX, '');
                    const logDate = new Date(dateStr);
                    const ageDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (ageDays > (this.config.maxLogAge || 30)) {
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Error cleaning old logs:', error);
        }
    }

    async logActivity(entry: LogEntry): Promise<void> {
        if (!this.config.enabled) return;

        const formattedEntry = this.formatLogEntry(entry);
        const logKey = this.getLogKey(new Date());

        try {
            if (this.config.storageType === 'local') {
                // Get existing logs for today
                const existingLogs = localStorage.getItem(logKey) || '';
                const newLogs = existingLogs ? `${existingLogs}\n${formattedEntry}` : formattedEntry;
                
                // Store in localStorage
                localStorage.setItem(logKey, newLogs);
            }
            this.apiService.errorLogger(entry).subscribe({
                next: () => console.log('Log entry sent to server:', formattedEntry),
                error: (err: any) => console.error('Failed to send log entry to server:', err)
            });
            // Always log to console for debugging
            console.log('Activity Log:@@@@@@@@@@@@@@@@@@@', formattedEntry);
            
        } catch (error) {
            console.error('Error writing log:', error);
            // If localStorage fails, fallback to console only
            console.log('Activity Log (Fallback):', formattedEntry);
        }
    }

    // Utility method to get logs for a specific date
    getLogs(date: Date): string[] {
        try {
            const logKey = this.getLogKey(date);
            const logs = localStorage.getItem(logKey);
            return logs ? logs.split('\n') : [];
        } catch (error) {
            console.error('Error reading logs:', error);
            return [];
        }
    }

    // Utility method to get all logs within a date range
    getLogsInRange(startDate: Date, endDate: Date): { [date: string]: string[] } {
        const result: { [date: string]: string[] } = {};
        try {
            const current = new Date(startDate);
            while (current <= endDate) {
                const logs = this.getLogs(current);
                if (logs.length > 0) {
                    result[current.toISOString().split('T')[0]] = logs;
                }
                current.setDate(current.getDate() + 1);
            }
        } catch (error) {
            console.error('Error reading logs in range:', error);
        }
        return result;
    }

    // Clear all logs
    clearAllLogs(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.LOG_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    }

    
   handleApiError(
    activityType: string,
    errorFunction: string,
    url: string,
    requestParams: any,
    errorMessage: string,
    errorStatus: number,
    device: any
) {
    this.enable();
    this.logActivity({
      dateTime: new Date().toString(),
      requestedBy: this.loggedInUser?.username || 'Unknown User',
      activityType,
      errorFunction: errorFunction,
      errorMessage: errorMessage || 'Unknown error',
      requestURL: url,
      requestParams: requestParams,
      statusCode: errorStatus,
      device: device || 'Unknown Device'
    }).catch(err => {
      console.error('Logging error:', err);
      this.showToast('Failed to log activity.', 3000, 'top');
    });
  }

    private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
        await presentToast(this.toastController, message, duration, position);
    }

}
