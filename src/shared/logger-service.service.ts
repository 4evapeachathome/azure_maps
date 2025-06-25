import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggingConfig } from './logging-config';
import { ApiService } from 'src/app/services/api.service';

export interface LogEntry {
    dateTime: string;
    requestedBy: string;
    activityType: string;
    response: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerServiceService {
    private config: LoggingConfig;
    private readonly LOG_PREFIX = 'NSF_';

    constructor(private http: HttpClient, private apiService: ApiService) {
        this.config = {
            enabled: false,
            storageType: 'local',
            maxLogAge: 30
        };
    }

    // Get log key for current 24-hour window (e.g., 2025-06-25_00)
    private get24HourLogKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // Always start at 00 hour for daily log
        return `${this.LOG_PREFIX}${year}${month}${day}_00`;
    }

    private formatLogEntry(entry: LogEntry): string {
        return `${entry.dateTime}, ${entry.requestedBy}, ${entry.activityType}, ${entry.response}`;
    }

    async logActivity(entry: LogEntry): Promise<void> {
      console.log('entry^^^^^^^', entry, this.config.storageType);
        if (!this.config.enabled) return;
        const formattedEntry = this.formatLogEntry(entry);
        const now = new Date();
        const logKey = this.get24HourLogKey(now);

        try {
            if (this.config.storageType === 'local') {
                const existingLogs = localStorage.getItem(logKey) || '';
                const newLogs = existingLogs ? `${existingLogs}\n${formattedEntry}` : formattedEntry;
                localStorage.setItem(logKey, newLogs);
            }
            console.log('Activity Log:', formattedEntry);
            this.apiService.uploadLogFile();
        } catch (error) {
            console.error('Error writing log:', error);
            console.log('Activity Log (Fallback):', formattedEntry);
        }
    }

    // Export current 24-hour log file
    exportCurrentLogFile(): { fileName: string, content: string } | null {
        const now = new Date();
        const logKey = this.get24HourLogKey(now);
        const content = localStorage.getItem(logKey);
        if (!content) return null;
        return { fileName: `${logKey}.txt`, content };
    }

    // Upload current log file to Azure Blob Storage
    uploadCurrentLogFileToAzure(blobBaseUrl: string, sasToken: string): Promise<any> {
        const logFile = this.exportCurrentLogFile();
        if (!logFile) return Promise.reject('No log file to upload');
        const url = `${blobBaseUrl}/${logFile.fileName}?${sasToken}`;
        const headers = new HttpHeaders({
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'text/plain'
        });
        return this.http.put(url, logFile.content, { headers, responseType: 'text' }).toPromise();
    }

    // Optionally, call this after upload to clear the log
    clearCurrentLogFile(): void {
        const now = new Date();
        const logKey = this.get24HourLogKey(now);
        localStorage.removeItem(logKey);
    }
}