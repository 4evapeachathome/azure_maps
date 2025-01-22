import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule]
})
export class ContactUsFormComponent  implements OnInit {

  formData = {
    name: '',
    email: '',
    feedback: '',
  };

  constructor() { }

  ngOnInit() {}
  onClear() {
    this.formData = {
      name: '',
      email: '',
      feedback: '',
    };
  }

  onSubmit() {
    console.log('Form Submitted:', this.formData);
    alert('Thank you for your feedback!');
    this.onClear();
  }

}
