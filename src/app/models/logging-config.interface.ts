export interface LoggingConfig {
    enabled: boolean;
    storageType: 'local' | 'console';
    maxLogAge?: number; // Maximum age of logs in days
}
