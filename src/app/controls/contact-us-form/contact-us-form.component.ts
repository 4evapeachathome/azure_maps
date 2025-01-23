import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule]
})
export class ContactUsFormComponent  implements OnInit {
  feedbackEmail: string = '';
  contactForm: any;
  formData = {
    ContactName: '',
    ContactEmail: '',
    ContactFeedback: ''
  };

 

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  onSubmit() {
    if (this.validateForm()) {
      debugger;
      this.apiService.sendContactData(this.formData).subscribe(
        response => {
          console.log('Contact data sent successfully', response);
        },
        error => {
          console.error('Error sending contact data', error);
        }
      );
    } else {
      console.error('Form validation failed');
    }
    // if (this.formData.ContactName.length >= 3 && this.validateEmail(this.formData.ContactEmail) && this.formData.ContactFeedback.length >= 3) {
    //   const emailSubject = `Feedback from ${this.formData.ContactName}`;
    //   const emailContent = `
    //     Name: ${this.formData.ContactName}
    //     Email: ${this.formData.ContactEmail}
    //     Feedback: ${this.formData.ContactFeedback}
    //   `;
    //   const emailData = {
    //     to: this.feedbackEmail,
    //     subject: emailSubject,
    //     text: emailContent
    //   };

    //   // Send email api service call
    //   this.apiService.sendEmail(emailData).subscribe(
    //     response => {
    //       console.log('Email sent successfully', response);
    //     },
    //     error => {
    //       console.error('Error sending email', error);
    //     }
    //   );
    // } else {
    //   console.error('Form validation failed');
    // }
  }

  validateForm(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      this.formData.ContactName.length >= 3 &&
      emailPattern.test(this.formData.ContactEmail) &&
      this.formData.ContactFeedback.length >= 3
    );
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
 

  onClear() {
    this.formData = {
      ContactName: '',
      ContactEmail: '',
      ContactFeedback: ''
    };
  }

}
