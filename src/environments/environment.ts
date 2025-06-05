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
  
apitoken:'dd9a8d6f22e0f32871ca0edacae7e4fac505f20515a479c9f40cfc580ca14ee7f5ac9cc2679595927048047c514f26dffb865876027dd352d94cdf35788d74753ab6a89de902d0af50819d4045d09b75b15292a74f74f148a8a8352d9fa0f851b4923134b3efb70dce008d8dd2ba61d627711dc2cfaaa521bdc316fb2181bd51',
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
