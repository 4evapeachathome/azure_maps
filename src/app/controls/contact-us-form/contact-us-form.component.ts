import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule]
})
export class ContactUsFormComponent  implements OnInit {
  @ViewChild('contactForm') ContactForm!: NgForm;
  feedbackEmail: string = '';
  contactForm: any;
  formData = {
    ContactName: '',
    ContactEmail: '',
    ContactFeedback: ''
  };

 

  constructor(private apiService: ApiService,private alertController: AlertController) { }

  ngOnInit() {
  }

  // onSubmit() {
  //   if (this.validateForm()) {
  //     this.apiService.sendContactData(this.formData).subscribe(
  //       response => {
  //         console.log('Contact data sent successfully', response);
  //       },
  //       error => {
  //         console.error('Error sending contact data', error);
  //       }
  //     );
  //   } else {
  //     console.error('Form validation failed');
  //   }
    
  // }

  async onSubmit() {
    if (this.validateForm()) {
      this.apiService.sendContactData(this.formData).subscribe(
        async response => {
          console.log('Contact data sent successfully', response);
          await this.presentAlert('Success', 'Your feedback has been sent successfully.');
          this.onClear();
          this.ContactForm.resetForm();
        },
        async error => {
          console.error('Error sending contact data', error);
          await this.presentAlert('Error', 'There was an error sending your feedback. Please try again later.');
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

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  validateForm(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      this.formData.ContactName.length >= 3 &&
      emailPattern.test(this.formData.ContactEmail) &&
      this.formData.ContactFeedback.length >= 3
    );
  }

  onClear() {
    this.formData = {
      ContactName: '',
      ContactEmail: '',
      ContactFeedback: ''
    };
  }

}
