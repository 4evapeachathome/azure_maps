import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { getConstant } from 'src/shared/constants';
import { presentToast, validateEmail } from 'src/shared/utility';

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
    name: '',
    email: '',
    feedback: ''
  };

 

  constructor(private apiService: ApiService,private toastController: ToastController) { }

  ngOnInit() {
  }


  async onSubmit() {
    if (this.validateForm()) {
      this.apiService.sendContactData(this.formData).subscribe(
        async response => {
          console.log('Contact data sent successfully', response);
          const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
          await presentToast(this.toastController, successMessage);
          this.onClear();
          this.ContactForm.resetForm();
        },
        async error => {
          console.error('Error sending contact data', error);
          const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
          await presentToast(this.toastController, errorMessage);
        }
      );
    } else {
      console.error('Form validation failed');
    }
  }



  validateForm(): boolean {
    return (
      this.formData.name.length >= 3 &&
      validateEmail(this.formData.email) &&
      this.formData.feedback.length >= 3
    );
  }

  onClear() {
    this.formData = {
      name: '',
      email: '',
      feedback: ''
    };
  }

}
