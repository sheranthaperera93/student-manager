import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { GraphQLModule } from './core/graphql/graphql.module';
import { SocketService } from './services/socket.service';
import { KendoUIModule } from './theme/kendo-ui/kendo-ui.module';
import { SharedModule } from './shared/shared.module';
import { StudentModule } from './student/student.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    GraphQLModule,
    SharedModule,
    KendoUIModule,
    StudentModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()), SocketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
