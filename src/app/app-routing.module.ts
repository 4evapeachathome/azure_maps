import { LoginPagePageModule } from './riskAssessment/login-page/login-page.module';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';

const educationModule: Routes =  [
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'peaceathome', loadChildren: () => import('./peaceathome/peaceathome.module').then(m => m.PeaceathomePageModule) },
  { path: 'healthyrelationship', loadChildren: () => import('./healthyrelationship/healthyrelationship.module').then(m => m.HealthyrelationshipPageModule) },
  { path: 'nopeaceathome', loadChildren: () => import('./nopeaceathome/nopeaceathome.module').then(m => m.NopeaceathomePageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'contactus', loadChildren: () => import('./contactus/contactus.module').then(m => m.ContactusPageModule) },
  { path: 'supportservice', loadChildren: () => import('./supportservice/supportservice.module').then(m => m.SupportservicePageModule) },
  { path: 'unhealthyrelationship', loadChildren: () => import('./unhealthyrelationship/unhealthyrelationship.module').then(m => m.UnhealthyrelationshipPageModule) },
  { path: 'uslawsbystate', loadChildren: () => import('./legalrights/legalrights.module').then(m => m.LegalrightsPageModule) },
  { path: 'federallaw', loadChildren: () => import('./federallaw/federallaw.module').then(m => m.FederallawPageModule) },
  {
    path: 'partnerviolence',
    loadChildren: () => import('./partnerviolence/partnerviolence.module').then( m => m.PartnerviolencePageModule)
  },
  {
    path: 'typesofabuse',
    loadChildren: () => import('./typesofabuses/typesofabuses.module').then( m => m.TypesofabusesPageModule)
  },
  {
    path: 'legalrights',
    loadChildren: () => import('./legalrightshome/legalrightshome.module').then( m => m.LegalrightshomePageModule)
  },
  {
    path: 'sripaa',
    loadChildren: () => import('./sripaa/sripaa.module').then( m => m.SripaaPageModule)
  },
  {
    path: 'quiz',
    loadChildren: () => import('./quiz/quiz.module').then( m => m.QuizPageModule)
  }
];

const riskAssessmentModule: Routes = [
  { path: '', redirectTo: 'loginPage', pathMatch: 'full' },
  { path: 'loginPage', loadChildren: () => import('./riskAssessment/login-page/login-page.module').then(m => m.LoginPagePageModule) },
  { path: 'assessment', loadChildren: () => import('./riskAssessment/assessment-page/assessment-page.module').then(m => m.AssessmentPagePageModule) }

];

export const routes: Routes = environment.isRiskassessment ? riskAssessmentModule : educationModule;
