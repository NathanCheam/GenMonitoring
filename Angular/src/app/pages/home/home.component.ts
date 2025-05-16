import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {RouterLink, RouterLinkActive} from "@angular/router";

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

}
