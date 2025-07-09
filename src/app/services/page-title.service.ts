import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { MenuService } from 'src/shared/menu.service';


@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private isWeb = !Capacitor.isNativePlatform();
  private gtagReady!: Promise<void>;
private gtagReadyResolver!: () => void;

  constructor(private sharedDataService:MenuService) {
    if (this.isWeb) {
    this.gtagReady = new Promise((resolve) => {
      this.gtagReadyResolver = resolve;
    });
  }
  }

  private pageTitles: { [key: string]: string } = {
    '/home': 'Home Page',
    '/peaceathome': 'Peace at Home',
    '/healthyrelationship': 'Healthy Relationship',
    '/nopeaceathome': 'No Peace at Home',
    '/contactus': 'Contact Us',
    '/supportservice': 'Support Service',
    '/unhealthyrelationship': 'Unhealthy Relationship',
    '/uslawsbystate': 'US Laws by State',
    '/federallaw': 'Federal Law',
    '/abusiverelationship': 'Abusive Relationship',
    '/typesofabuse': 'Types of Abuse',
    '/yourrights': 'Your Rights',
    '/ssripa': 'SSRIPA',
    '/quiz': 'Quiz',
    '/login': 'Login',
    '/riskassessment': 'Risk Assessment',
    '/setpassword': 'Set Password',
    '/riskassessmentsummary': 'Risk Assessment Summary',
    '/hitsassessment': 'HITS Assessment',
    '/webassessment': 'Web Assessment',
    '/dangerassessment': 'Danger Assessment',
    '/viewresult': 'View Result',
    '/ssripariskassessment': 'SSRIPA Risk Assessment'
  };

  async initializeGoogleAnalytics() {
     const configMap = await firstValueFrom(this.sharedDataService.config$);
        const gaId = configMap['googleAnalyticsId'];
  if (!this.isWeb || !gaId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date().toISOString());
    window.gtag('config', gaId);

    this.gtagReadyResolver(); // ✅ resolve readiness
  };
  document.head.appendChild(script);
}

  getPageTitle(url: string): string {
    const cleanUrl = url.split('?')[0].split('#')[0];
    return this.pageTitles[cleanUrl] || 'Unknown Page';
  }

  private async safeTrack(eventName: string, params: any = {}) {
  if (this.isWeb && typeof window !== 'undefined') {
    await this.gtagReady; // ✅ wait for gtag to be ready
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      return;
    }
  }

  // Fallback to native Firebase Analytics
  try {
    await FirebaseAnalytics.logEvent({ name: eventName, params });
  } catch (err) {
    console.warn('Analytics skipped (native fallback failed):', eventName, params);
  }
}

  trackPageView(path: string, title: string, module?: string, deviceType?: string) {
  this.safeTrack('page_view', {
    page_path: path,
    page_title: title,
    module: module || 'education',
    device_type: deviceType || 'unknown'
  });
}

  trackLogin(method = 'standard_login') {
    this.safeTrack('login', {
      event_category: 'User Action',
      event_label: 'Login Button',
      method
    });
  }

  trackLogout() {
    this.safeTrack('logout', {
      event_category: 'User Action',
      event_label: 'Logout Button'
    });
  }

  trackForgotPassword() {
    this.safeTrack('forgot_password', {
      event_category: 'User Action',
      event_label: 'Forgot Password'
    });
  }

  trackAssessmentStart(name: string) {
    this.safeTrack('start_assessment', {
      event_category: 'Assessment',
      event_label: name
    });
  }

  trackAssessmentSubmit(name: string, answeredCount?: number) {
  const params: any = {
    event_category: 'Assessment',
    event_label: name
  };

  // Only include number_answered if it’s provided
  if (answeredCount !== undefined) {
    params.number_answered = answeredCount;
  }

  this.safeTrack('submit_assessment', params);
}

  trackPdfDownload(module: string) {
    this.safeTrack('download_pdf', {
      event_category: 'Report',
      event_label: `${module}_PDF`
    });
  }

  trackFormSubmit(formName: string) {
    this.safeTrack('submit_form', {
      event_category: 'Form',
      event_label: formName
    });
  }

  trackCustomButtonClick(button: string, category = 'Button') {
    this.safeTrack('button_click', {
      event_category: category,
      event_label: button
    });
  }
}
