import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  subscription!: Subscription;
  isAuth = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.authChange.subscribe((data) => {
      this.isAuth = data;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
