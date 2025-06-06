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
  apiHost:'http://localhost:1337',
  UIurl:'http://localhost:8100',
  //apiHost:'https://cma-strapi-app-heecd3e6bwczakfu.eastus2-01.azurewebsites.net',
  secretKey:'0244387ac5f95d2f5ae4b5e560e4c617f4b59857378d6579041229fdbb44dee9',
  
apitoken:'f0cb8e433a47700cb201e8e9d59ae2603e8d9a7f54352de093b3f1e7b3df2bb7f63362f4e950ece375d708bffa6939aae7b7939294c3d256f031cd94d1468d87bfcae030056773a58027c3d538863db5f9061a5e01cc6d792fdf13547aa7b748894a8ee0c0d9641e87b580800c7fc48055a9f54aefe206fa3a9c25d87d4652f7',
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
