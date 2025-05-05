import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [
    MatButton,
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);
}
