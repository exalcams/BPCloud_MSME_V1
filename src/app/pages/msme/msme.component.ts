import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Msme, VendorTokenCheck } from 'src/app/models/msme';
import { SnackBarStatus } from 'src/app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MsmeService } from 'src/app/services/msme.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NotificationSnackBarComponent } from 'src/app/notifications/notification-snack-bar/notification-snack-bar.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AttachmentDetails } from 'src/app/models/attachment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AttachmentDialogComponent } from 'src/app/notifications/attachment-dialog/attachment-dialog.component';
import { NotificationDialogComponent } from 'src/app/notifications/notification-dialog/notification-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-msme',
  templateUrl: './msme.component.html',
  styleUrls: ['./msme.component.scss']
})
export class MsmeComponent implements OnInit {
  Message: string = null;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  msmeFormGroup: FormGroup;
  Msme: Msme = new Msme();
  VendorTokenCheck: VendorTokenCheck;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isAttachmentEnabled = false;
  submitStatus = true;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _msmeService: MsmeService,
    public snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private _datePipe: DatePipe,
  ) {
    this.msmeFormGroup = this.fb.group({
      vendorCode: [''],
      name: [''],
      email: [''],
      msmeType: ['', Validators.required],
      uanNumber: [''],
      expiryDate: [''],
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    this.spinner.show();
    this.VendorTokenCheck = new VendorTokenCheck();
    this.route.queryParams.subscribe(params => {
      this.VendorTokenCheck.token = params.token;
      this.VendorTokenCheck.transID = params.Id;
      this.VendorTokenCheck.emailAddress = params.Email;
    });
    // console.log(this.VendorTokenCheck);
    this._msmeService.CheckTokenValidity(this.VendorTokenCheck).subscribe((data) => {
      // console.log('Token Validatiy', data);
      if (data) {
        this._msmeService.GetMsmeByID(this.VendorTokenCheck.transID).subscribe((msme) => {
          this.Msme = msme;
          this.msmeFormGroup.get('vendorCode').patchValue(this.Msme.vendorCode);
          this.msmeFormGroup.get('name').patchValue(this.Msme.name);
          this.msmeFormGroup.get('email').patchValue(this.Msme.email);
          if (this.Msme.vendorCode != null) {
            this.msmeFormGroup.get('vendorCode').disable();
          }
          if (this.Msme.name != null) {
            this.msmeFormGroup.get('name').disable();
          }
          if (this.Msme.email != null) {
            this.msmeFormGroup.get('email').disable();
          }
          if (this.Msme.vendorCode != null) {
            this.msmeFormGroup.get('vendorCode').disable();
          }
          if (this.Msme.uanNumber != null) {
            this.msmeFormGroup.get('uanNumber').disable();
          }
          if (this.Msme.expiryDate != null) {
            this.msmeFormGroup.get('expiryDate').disable();
          }
        });
        this.spinner.hide();
      }
      else {
        this.openSnackBar('Token might have already used or wrong token', SnackBarStatus.danger, 6000);
        this.msmeFormGroup.disable();
        this.submitStatus = false;
        this.Message = '**Token might have already used or wrong token**';
        this.spinner.hide();
        console.log('Else');
        // this.router.navigate(['/auth/login']);
      }
    },
      (err) => {
        this.spinner.hide();
        console.log('Err', err);
        this.openSnackBar('Token might have already used or wrong token', SnackBarStatus.danger, 6000);
        this.msmeFormGroup.disable();
        this.submitStatus = false;
        this.Message = '**Token might have already used or wrong token**';
        // this.router.navigate(['/auth/login']);
      });
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
    }
  }

  MsmeTypeSelection(type: string): void {
    if (type === 'OTH') {
      this.isAttachmentEnabled = false;
      this.fileToUpload = null;
    }
    else {
      this.isAttachmentEnabled = true;
    }
  }

  handleSubmit(): void {
    if (this.msmeFormGroup.valid) {
      if (this.isAttachmentEnabled && (this.fileToUpload === undefined || this.fileToUpload == null)) {
        this.openSnackBar('Attachment Required!!', SnackBarStatus.danger);
        this.Msme.attachment = null;
      }
      else {
        this.OpenConfirmationDialog('Confirm', 'MSME');
      }
    }
    else {
      this.ShowValidationErrors();
    }

  }

  ConfirmMsme(): void {
    this.spinner.show();
    this.Msme.msmeType = this.msmeFormGroup.get('msmeType').value;
    this.Msme.uanNumber = this.msmeFormGroup.get('uanNumber').value;
    const expDate = this.msmeFormGroup.get('expiryDate').value;
    let expiryDate = '';
    if (expDate) {
      expiryDate = this._datePipe.transform(expDate, 'yyyy-MM-dd');
    }
    this.Msme.expiryDate = expiryDate;
    this.Msme.token = this.VendorTokenCheck.token;
    this.Msme.status = 'confirmed';

    if (this.Msme.msmeType === 'OTH') {
      this._msmeService.UpdateVendorOnBoarding(this.Msme).subscribe((x) => {
        this.msmeFormGroup.setValue({
          vendorCode: [''],
          name: [''],
          email: [''],
          msmeType: ['', Validators.required],
          uanNumber: [''],
          expiryDate: ['']
        });
        this.msmeFormGroup.disable();
        this.submitStatus = false;
        this.isAttachmentEnabled = false;
        this.spinner.hide();
        this.openSnackBar('Confirmed', SnackBarStatus.success, 6000);
        this.Message = '**MSME Vendor Confirmed Successfully**';
      },
        err => {
          this.spinner.hide();
          this.openSnackBar('Something went wrong!', SnackBarStatus.danger);
        });
    }
    else {
      this.Msme.attachment = this.fileToUpload.name;
      this._msmeService.AddUserAttachment(this.Msme.transID, this.Msme.name, this.fileToUpload).subscribe((data) => {
        if (data != null) {
          this.fileToUpload = null;
          this._msmeService.UpdateVendorOnBoarding(this.Msme).subscribe((x) => {
            this.msmeFormGroup.setValue({
              vendorCode: [''],
              name: [''],
              email: [''],
              msmeType: ['', Validators.required],
              uanNumber: [''],
              expiryDate: [''],
            });
            this.msmeFormGroup.disable();
            this.submitStatus = false;
            this.isAttachmentEnabled = false;
            this.spinner.hide();
            this.openSnackBar('Confirmed', SnackBarStatus.success, 6000);
            this.Message = '**MSME Vendor Confirmed Successfully**';
          },
            err => {
              this.spinner.hide();
              this.openSnackBar('Something went wrong!', SnackBarStatus.danger);
            });
        }
        else {
          this.spinner.hide();
          this.openSnackBar('Attachment uploading failed!', SnackBarStatus.danger);
        }
      });

    }

  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype,
        Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.ConfirmMsme();
        }
      });
  }

  openSnackBar(Message: string, status: SnackBarStatus, duration = 2000): void {
    this.snackBar.open(Message, '', {
      duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: status === SnackBarStatus.success ? 'success' : status === SnackBarStatus.danger ? 'danger' :
        status === SnackBarStatus.warning ? 'warning' : 'info'
    });
  }

  ShowValidationErrors(): void {
    Object.keys(this.msmeFormGroup.controls).forEach(key => {
      this.msmeFormGroup.get(key).markAsTouched();
      this.msmeFormGroup.get(key).markAsDirty();
    });
  }

  GetAttachment(): void {
    const fileName = this.fileToUpload.name;
    const file = this.fileToUpload;
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    }
  }
  OpenAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName,
      blob
    };
    console.log(FileName, 'filee--------', blob);
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

}
