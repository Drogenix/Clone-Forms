import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TuiDropdownModule, TuiHintModule } from '@taiga-ui/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TuiDropdownModule, TuiHintModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  openProfile = false;
  userName = this.userService.user?.login;
  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private router: Router,
  ) {}
  toggleProfile() {
    this.openProfile = !this.openProfile;
    this.cdr.markForCheck();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['sign-in']);
  }
}
