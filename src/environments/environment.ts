// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { LoggingConfig } from '../app/models/logging-config.interface';

interface Environment {
  production: boolean;
  apiUrl: string;
  logging: LoggingConfig;
}

export const environment = {
  production: false,
  // apiHost:'http://localhost:1337',
  apiHost:'https://cma-strapi-app-heecd3e6bwczakfu.eastus2-01.azurewebsites.net',
  secretKey:'0244387ac5f95d2f5ae4b5e560e4c617f4b59857378d6579041229fdbb44dee9',
  
apitoken:'7373db1f8f56a18cfe86001d6949493e1568012a775fec6dec9261ddc28ee713acfca2064683e3bc0882862d49882651d277d6ddeca9bd7d1e90a551b79270afb520727e3bc45e821c5495221b8fdb58b5a84f2ee90df75e51d5b573e6dc295f566400c932bb814299d8330adabf7da0918672709ab72a15c2123d2c37df1471',
 // apitoken:'44d70090c411f259173515737d6723456c4505aad1d1cd3351e92dbd50791450a821801fa457ff1ebe2b67c1c2026131d1b0b9cb063f083c576254a88aef807ecf14c0e15bb2db0b15126ff99822a6cf43e94904787d0b0eb79119b030229d2c899ae31ca0e497ed945cb6cf2b5047be85064470a434f47fb4b0059a183dac09',
  logging: {
    enabled: true,
    storageType: 'local',
    maxLogAge: 30 // Keep logs for 30 days
  },
  UIurl: 'http://localhost:8100'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
