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
  //apiHost:'https://cms.findpeaceathome.org',
  apiHost:'http://localhost:1337',
  secretKey:'0244387ac5f95d2f5ae4b5e560e4c617f4b59857378d6579041229fdbb44dee9',
  findLocationAPIKey:'75ebf63531cd411e8d1f848ead39c63a',
//apitoken:'c89ab7a4dbd55774a68917bad3cc8831555f0900b71b8a6f4348d1b4c5efc038e9a6a5819287f284317162832bf882f5a13f579279832f9edf94e77b2531e0aa061b015f3fc6e7219277d7ae5f7b518a8914e2717c1baada97d62a190f2c43e067fca79884acd422b9d7830faeef3924d1515a27a4434da25336e1b0e2717ed9',
  apitoken:'6061cb2233624f1c7a89753da41ac2f7ae22bb085b9cbbd42015b5aac391d4076d2ae493193a745c7f1eeba6d1e7fa136ad0a46f9f56f724ee1de81605e83632ba4294e6005092bc28992a9d5166d047bf589dc5539a266fba5e1938299a4a34582fc6bf2fafed6a8ab9a95eb87f0bfa72a653210cf7666990b99fba500220ad',
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
