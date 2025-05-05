import { Component, inject } from '@angular/core'; // inject ajouté
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from './services/auth.service'; // Chemin vérifié
// Import CommonModule pour @if/@else

@Component({
  selector: 'app-root',
  standalone: true, // Assure-toi que ton composant est standalone si tu utilises cette structure
  imports: [
    RouterOutlet,
    MatToolbar,
    MatButton,
    RouterLink,
    MatIcon,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  router = inject(Router);
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
