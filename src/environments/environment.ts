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
  
apitoken:'c89ab7a4dbd55774a68917bad3cc8831555f0900b71b8a6f4348d1b4c5efc038e9a6a5819287f284317162832bf882f5a13f579279832f9edf94e77b2531e0aa061b015f3fc6e7219277d7ae5f7b518a8914e2717c1baada97d62a190f2c43e067fca79884acd422b9d7830faeef3924d1515a27a4434da25336e1b0e2717ed9',
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
