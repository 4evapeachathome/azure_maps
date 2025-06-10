import { LoginPagePageModule } from './riskAssessment/login-page/login-page.module';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RiskAssessmentGuard } from './guards/risk-assessment.guard';
import { LoginGuard } from './guards/login-assessment.gaurd';
import { viewResultGuard } from './guards/view-result.guard';
//import { UserCreationAuthGuard } from './guards/setpassoword-auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'peaceathome', loadChildren: () => import('./peaceathome/peaceathome.module').then(m => m.PeaceathomePageModule) },
  { path: 'healthyrelationship', loadChildren: () => import('./healthyrelationship/healthyrelationship.module').then(m => m.HealthyrelationshipPageModule) },
  { path: 'nopeaceathome', loadChildren: () => import('./nopeaceathome/nopeaceathome.module').then(m => m.NopeaceathomePageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  //{ path: '**', redirectTo: 'home', pathMatch: 'full' },
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
  },
  //Risk Assessment
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./riskAssessment/login-page/login-page.module').then(m => m.LoginPagePageModule),canActivate: [LoginGuard] },  
  { path: 'riskassessment', loadChildren: () => import('./riskAssessment/assessment-page/assessment-page.module').then(m => m.AssessmentPagePageModule),canActivate: [RiskAssessmentGuard] },
  { path: 'setpassword', loadChildren: () => import('./riskAssessment/set-password/set-password.module').then(m => m.AssessmentResultPageModule) },
  { path: 'riskassessmentsummary', loadChildren: () => import('./riskAssessment/assessment-summary/assessment-summary.module').then(m => m.AssessmentSummaryPageModule),canActivate: [RiskAssessmentGuard] },
  {
    path: 'hitsassessment',
    loadChildren: () => import('./riskAssessment/hits-assessment-page/hits-assessment-page.module').then( m => m.HitsAssessmentPagePageModule),canActivate: [RiskAssessmentGuard]
  },
  {
    path: 'webassessment',
    loadChildren: () => import ('../app/riskAssessment/rat-assessment-page/risk-assessment/risk-assessment.module').then(m => m.RiskAssessmentModule),canActivate: [RiskAssessmentGuard]
  },
  {
    path: 'dangerassessment',
    loadChildren: () => import ('../app/riskAssessment/da-assessment-page/da-assessment/da-assessment.module').then(m => m.DaAssessmentModule),canActivate: [RiskAssessmentGuard]
  },
  {
    path: 'viewresult',
    loadChildren: () => import ('../app/riskAssessment/view-result-page/view-result-page/view-result-page.module').then(m => m.ViewResultPageModule),
    canActivate: [viewResultGuard]
  },
  {
    path: 'ssripariskassessment',
    loadChildren: () => import('./riskAssessment/risk-assessment-ssripa/risk-assessment-ssripa.module').then( m => m.RiskAssessmentSSripaPageModule),canActivate: [RiskAssessmentGuard]
  },

  

];

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }