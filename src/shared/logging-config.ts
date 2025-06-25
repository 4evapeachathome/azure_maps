export interface LoggingConfig {
    enabled: boolean;
    storageType: 'local' | 'remote';
    maxLogAge: number; // in days
    remoteUrl?: string; // Optional URL for remote logging
    remoteApiKey?: string; // Optional API key for remote logging
    logLevel?: 'info' | 'warn' | 'error'; // Optional log level to filter logs
}