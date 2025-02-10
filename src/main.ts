import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing.module';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { appEffects, appStore } from './app/store/store';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(appStore), provideEffects(appEffects), 
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(
      BrowserAnimationsModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      HttpClientModule
    )
  ]
}).catch(err => console.log(err));
