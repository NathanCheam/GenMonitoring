import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService, RegisterRequest} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatError,
    MatFormField,
    MatInput,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  form: FormGroup = this.fb.group({
    nom: new FormControl("", [Validators.required]),
    prenom: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
  });

  constructor() {
  }

  get nom() {
    return this.form.get('nom');
  }

  get prenom() {
    return this.form.get('prenom');
  }

  get password() {
    return this.form.get('password');
  }

  async register() {
    const payload: RegisterRequest = {...this.form.value}
    try {
      await this.authService.register(payload);
      await this.router.navigate(['/']);
      this.snackBar.open(`Bienvenue, ${this.authService.user().name}`, 'Close', {
        duration: 2000, horizontalPosition: 'left', verticalPosition: 'top'
      })
    } catch (error) {
      console.error(`Error while logging in`, error);
      this.snackBar.open('Création du compte invalide', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      })
    }
  }

}
