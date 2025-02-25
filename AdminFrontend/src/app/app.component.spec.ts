import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AppBarModule } from '@progress/kendo-angular-navigation';
import { SVGIconModule } from '@progress/kendo-angular-icons';
import { BadgeModule } from '@progress/kendo-angular-indicators';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ApolloTestingModule,
        AppBarModule,
        SVGIconModule,
        BadgeModule,
      ],
      providers: [provideHttpClientTesting(), provideHttpClient()],
      declarations: [AppComponent, HeaderComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Student Manager'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Student Manager');
  });
});
