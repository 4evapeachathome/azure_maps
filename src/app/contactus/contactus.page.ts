import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
  standalone: false
})
export class ContactusPage implements OnInit {
  @ViewChild(ContactUsFormComponent) contactUs!: ContactUsFormComponent;

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.contactUs) {
      this.contactUs.renderReCaptcha();
    }    
}


ionViewDidLeave() {
  if (this.contactUs) {
     // Reset form data and controls on initialization
  this.contactUs.onClear();
  if (this.contactUs.ContactForm) {
    this.contactUs.ContactForm.resetForm();
  }
  }
}

}
