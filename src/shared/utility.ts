import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ToastController } from '@ionic/angular';

// Email Regex
export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Email Regex Validation
export function validateEmail(email: string): boolean {
  return emailPattern.test(email);
}

// Utility class
export class Utility {
  // New Password Validator
  static newPasswordValidator(getOldPassword: () => string | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.value;
      const oldPassword = getOldPassword();

      if (!newPassword) return null;

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

      if (newPassword === oldPassword) {
        return { sameAsOld: true };
      }

      if (!passwordRegex.test(newPassword)) {
        return { invalidPattern: true };
      }

      return null;
    };
  }

  // GUID generator with custom prefix
  static generateGUID(type: string): string {
    const uuid = Math.random().toString(36).substring(2, 8).toUpperCase();

    switch (type.toLowerCase()) {
      case 'web':
        return `WEB-${uuid}`;
      case 'hits':
        return `HITS-${uuid}`;
      case 'da':
        return `DA-${uuid}`;
      case 'dai':
        return `DAI-${uuid}`;
      case 'cts':
        return `CTS-${uuid}`;
      case 'ssripa':
        return `SSRIPA-${uuid}`;
      default:
        return `GEN-${uuid}`; // fallback generic prefix
    }
  }
}

// Utility function to present a toast message
export async function presentToast(
  toastController: ToastController,
  message: string,
  duration: number = 2000,
  position: 'top' | 'bottom' | 'middle' = 'bottom'
) {
  const toast = await toastController.create({
    message,
    duration,
    position
  });
  toast.present();
}
