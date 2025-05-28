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
  //apiHost:'http://localhost:1337',
  apiHost:'https://cma-strapi-app-heecd3e6bwczakfu.eastus2-01.azurewebsites.net',
  secretKey:'0244387ac5f95d2f5ae4b5e560e4c617f4b59857378d6579041229fdbb44dee9',
  
apitoken:'5f03f10c686f18a1183aa54fd081b065b84682651bd7a08fa0d589b9df58e17da759ccd58f7f1a89c71d9f1583b07a1a157f8aa0ac8ef8efc77dfc8dd70dacd60b10a8d5df592eca6ff28a4098dc74b3cedbe8bd4f955508df647fd53b1a29999c3542f0678c151d45dc7f71e29bb52da1c8d8c840aedc3ffaf4d17a2b7e3c0b',
 // apitoken:'44d70090c411f259173515737d6723456c4505aad1d1cd3351e92dbd50791450a821801fa457ff1ebe2b67c1c2026131d1b0b9cb063f083c576254a88aef807ecf14c0e15bb2db0b15126ff99822a6cf43e94904787d0b0eb79119b030229d2c899ae31ca0e497ed945cb6cf2b5047be85064470a434f47fb4b0059a183dac09',
  logging: {
    enabled: true,
    storageType: 'local',
    maxLogAge: 30 // Keep logs for 30 days
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
