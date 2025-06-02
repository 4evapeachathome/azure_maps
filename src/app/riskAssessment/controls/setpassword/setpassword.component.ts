import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'app-setpassword',
  templateUrl: './setpassword.component.html',
  styleUrls: ['./setpassword.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class SetPasswordComponent implements OnInit {
  userForm: FormGroup;
  showPassword = false;
  showNewPassword = false;
  flowType: string | null = null;
  @Input() reloadFlag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
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
    this.flowType = this.route.snapshot.queryParamMap.get('flow'); 
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag']?.currentValue === true) {
      this.userForm.reset();
    }
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
if(this.flowType== 'onboarding' || this.flowType == 'forgetpassword') {
    const { username, password, newPassword } = this.userForm.value;
    const email = username.trim().toLowerCase();

    this.apiService.getUserLoginByEmailId(email).subscribe({
      next: async (user: any) => {
        console.log('User fetched by email:', user);
        if (!user) {
          this.userForm.get('username')?.setErrors({ userNotFound: true });
          return;
        }

        if (user.temp_password !== password) {
          this.userForm.get('password')?.setErrors({ incorrectPassword: true });
          return;
        }

        const updatePayload = {
          password: newPassword,
          sendInvite: true,
        };

        this.apiService.updateUserLogin(user.documentId, updatePayload).subscribe({
          next: async () => {
            await presentToast(this.toastController, 'Password updated successfully!', 2500, 'top');
            this.userForm.reset();
            this.router.navigate(['/login']);
            return;
          },
          error: async (err: any) => {
            console.error('Failed to update user login', err);
            await presentToast(this.toastController, 'Failed to update password. Please try again.', 3000, 'top');
          },
        });
      },
      error: (err) => {
        console.error('Failed to fetch user by email', err);
        this.userForm.get('username')?.setErrors({ userNotFound: true });
      },
    });
  }
  else
  {
    console.log('Please verify the flow type and contact the administrator for assistance.', this.flowType);
  }
  }
  }
