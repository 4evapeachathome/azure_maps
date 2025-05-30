import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'app-usercreation',
  templateUrl: './usercreation.component.html',
  styleUrls: ['./usercreation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule,ReactiveFormsModule ],
})
export class UserCreationComponent implements OnInit {
  userForm: FormGroup;
  userLogins: any[] = [];
  showPassword = false;
  showNewPassword = false;
  @Input() reloadFlag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.userForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.matchPasswordsValidator,
      }
    );
  }

  ngOnInit() {
    this.userForm.reset();
    this.getUserLogins();
  }

   ngOnChanges(changes: SimpleChanges) {
      if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true) {
        this.userForm.reset();
        this.getUserLogins()  // Call your API or logic
      }
    }

  getUserLogins() {
    this.apiService.getUserLogins().subscribe({
      next: (data: any) => {
        this.userLogins = data || [];
      },
      error: (error: any) => {
        console.error('Failed to fetch user logins', error);
      },
    });
  }

  matchPasswordsValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { username, password, newPassword } = this.userForm.value;
    const user = this.userLogins.find(
      (u) => u.username?.toLowerCase() === username.trim()?.toLowerCase()
    );

    if (!user) {
      this.userForm.get('username')?.setErrors({ userNotFound: true });
      return;
    }

    if (user.temp_password !== password) {
      this.userForm.get('password')?.setErrors({ incorrectPassword: true });
      return;
    }

    // Proceed to update password
    const updatePayload = {
      password: newPassword,
      sendInvite: true,
    };

    this.apiService.updateUserLogin(user.id, updatePayload).subscribe({
      next: async () => {
        await presentToast(this.toastController, 'Password updated successfully!', 2500, 'top');
        this.router.navigate(['/login']);
        this.userForm.reset();
      },
      error: async (err: any) => {
        console.error('Failed to update user login', err);
        await presentToast(this.toastController, 'Failed to update password. Please try again.', 3000, 'top');
      },
    });
  }
}
