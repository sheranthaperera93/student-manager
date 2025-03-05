import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DrawerItem, DrawerSelectEvent } from '@progress/kendo-angular-layout';
import {
  inboxIcon,
  menuIcon,
  SVGIcon,
  userIcon,
} from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Student Manager';
  public menuSvg: SVGIcon = menuIcon;
  public items: Array<DrawerItem> = [
    {
      text: 'Students',
      svgIcon: userIcon,
      selected: true,
    },
    { separator: true },
    { text: 'Courses', svgIcon: inboxIcon },
  ];

  constructor(private readonly router: Router) {}

  public handleToggleDrawer(ev: DrawerSelectEvent): void {
    this.router.navigate([ev.item.text.toLowerCase()]);
  }
}
