import { ToastController } from '@ionic/angular';

//Email Regex
export const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//Email Regex Validation
export function validateEmail(email: string): boolean {
  return emailPattern.test(email);
}

// Utility function to present a toast message
export async function presentToast(toastController: ToastController, message: string, duration: number = 2000, position: 'top' | 'bottom' | 'middle' = 'bottom') {
  const toast = await toastController.create({
    message,
    duration,
    position
  });
  toast.present();
}