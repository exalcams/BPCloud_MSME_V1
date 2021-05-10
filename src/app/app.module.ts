import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MsmeComponent } from './pages/msme/msme.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsmeService } from './services/msme.service';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSpinnerModule } from "ngx-spinner";
import { NotificationSnackBarComponent } from './notifications/notification-snack-bar/notification-snack-bar.component';
import { AttachmentDialogComponent } from './notifications/attachment-dialog/attachment-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationDialogComponent } from './notifications/notification-dialog/notification-dialog.component';
import { ConfirmedComponent } from './pages/confirmed/confirmed.component';
import { DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    MsmeComponent,
    NotificationSnackBarComponent,
    AttachmentDialogComponent,
    NotificationDialogComponent,
    ConfirmedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSnackBarModule,
    NgxSpinnerModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [MsmeService, DatePipe, MatDatepickerModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [AttachmentDialogComponent, NotificationDialogComponent]
})
export class AppModule { }
