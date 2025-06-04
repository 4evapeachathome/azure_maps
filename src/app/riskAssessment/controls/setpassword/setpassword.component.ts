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
  userLogins: any[] = [];
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
    this.resetFormAndFetchUsers();
    this.flowType = this.route.snapshot.queryParamMap.get('flow');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true) {
      this.resetFormAndFetchUsers();
    }
  }

  private resetFormAndFetchUsers() {
    this.userForm.reset();
    this.getUserLogins();
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

  getUserLogins() {
    this.apiService.getUserLogins().subscribe({
      next: (data: any) => {
        this.userLogins = data || [];
      },
      error: (error: any) => {
        console.error('Failed to fetch user logins', error);
        this.showToast('Failed to fetch user logins.', 3000, 'top');
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
      await this.showToast('Please fill all required fields correctly.', 3000, 'top');
      return;
    }

    if (this.flowType === 'onboarding' || this.flowType === 'forgetpassword') {
      await this.handlePasswordUpdate();
    }
  }
  private async handlePasswordUpdate() {
    const { username, password, newPassword } = this.userForm.value;
    const updatePayload = {
      Username: username,
      password: newPassword,
      temp_password: password
    };
    this.apiService.updateUserLogin(updatePayload).subscribe({
      next: async (res: any) => {
        await this.showToast(res?.message, 2500, 'top');
        this.router.navigate(['/login']);
        this.userForm.reset();
      },
      error: async (err: any) => {
        await this.showToast(err.error.error.message, 3000, 'top');
      },
    });
  }
}
