import { Component, OnInit, ViewChild } from '@angular/core';
import { SripacompComponent } from '../controls/sripacomp/sripacomp.component';

@Component({
  selector: 'app-sripaa',
  templateUrl: './sripaa.page.html',
  styleUrls: ['./sripaa.page.scss'],
  standalone: false,
})
export class SripaaPage implements OnInit {
  @ViewChild(SripacompComponent) sripaCompRef!: SripacompComponent;
  constructor() { }

  ngOnInit() {
  }

  onFinalAnswerClick() {
    if (this.sripaCompRef?.hasAnyAnswer) {
      const mockApiResponse = {
        answer: `I'm really sorry to hear that you're going through such a difficult time right now. It's incredibly brave of you to reach out and talk about this. It's clear from your questions that you're dealing with serious issues in your relationship, specifically involving physical harm and feelings of threat from your partner, both of which are of high severity. 
  
  In instances of physical harm, your safety is the utmost priority. Please consider reaching out to emergency services immediately if you're in immediate danger - you can call 911 or a dedicated hotline, like the National Domestic Violence Hotline at 1-800-799-SAFE (7233). They can provide immediate assistance and guide you through this difficult time. 
  
  Creating a personalized safety plan is also crucial. This includes planning for emergency escape options and considering the possibility of staying at a safe location if needed. It's also advisable to seek legal assistance for obtaining a Restraining Order to ensure your safety in the longer term.
  
  Your feelings of being threatened also indicate a need for protective measures. If you feel comfortable, seek legal advice and consider reaching out to law enforcement. They can guide you through obtaining a Restraining Order and understanding court procedures, which can offer some additional security.
  
  In both situations, it's extremely important to keep a private journal where you can record any instances of physical harm or threats. This can serve as crucial evidence if legal action is needed.
  
  Please remember, you're not alone in this. Reach out to trusted friends, family, or professional counselors who can provide emotional support and practical advice. And don't underestimate the value of self-care during this time, as it's important to maintain your physical and emotional well-being.
  
  I want to emphasize again that what you're experiencing is not your fault, and you have every right to feel safe and secure. Please don't hesitate to reach out for help, whether to loved ones or professional services. You're showing immense strength by addressing these issues, and there are resources and people ready to support you through this.`
      };
  
      this.sripaCompRef.setFinalAnswer(mockApiResponse.answer);
    }
  }
}
