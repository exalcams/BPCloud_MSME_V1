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

declare function getTxtFrmPdf(url: any, invoicenum: any): any;
declare var Tesseract;
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
  array: any = ['msmeType', 'uanNumber', 'expiryDate'] ;
  // tslint:disable-next-line:variable-name
  array_value: any = [];
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
  inputkey()
  {
    this.fileToUpload = null;

  }
  // tslint:disable-next-line:typedef
  async handleFileInput(evt) {
    if (evt.target.files && evt.target.files.length > 0) {
      // this.fileToUpload = evt.target.files[0];
      // tslint:disable-next-line:comment-format
      //change
      const files = evt.target.files;
      this.array_value = [];
      // tslint:disable-next-line:variable-name
     // tslint:disable-next-line:align
     this.array_value.push(this.msmeFormGroup.get('msmeType').value) ;
     // tslint:disable-next-line:align
     this.array_value.push(this.msmeFormGroup.get('uanNumber').value);
     // tslint:disable-next-line:align
     const date=
     this.array_value.push(( this._datePipe.transform( this.msmeFormGroup.get('expiryDate').value, 'MM/dd/yyyy')));
      const count = 0; 
      // Create a Blog object for selected file & define MIME type
      const blob = new Blob(evt.target.files, { type: evt.target.files[0].type });
    // tslint:disable-next-line:no-trailing-whitespace
    // Create Blog URL  
      const url = window.URL.createObjectURL(blob);

      if (files.item(0).type === 'application/pdf') {
        for(let i = 0; i < this.array.length; i++)
        {
        getTxtFrmPdf(url, this.array_value[i]).then((z) => {

          console.log('textfromts:', z);
          if (z < 1) {
            if (this.array_value[i])
            {
              this.fileToUpload = null;
              this.msmeFormGroup.get(this.array[i]).setErrors({ error: true });
              this.msmeFormGroup.get(this.array[i]).markAsTouched();
            }
          }
          else {
            this.fileToUpload = evt.target.files[0];
            // tslint:disable-next-line:no-unused-expression
            this.msmeFormGroup.get(this.array[i]).valid;
            this.msmeFormGroup.get(this.array[i]).setErrors(null);
            this.msmeFormGroup.get(this.array[i]).markAsUntouched();
            // this.fileToUpload = evt.target.files[0];
          }
        });
      }

    }
    else{
      this.spinner.show();
      const tes = await this.Tesseract(url);

      for(let i = 0; i < this.array.length; i++)
      {
        this.spinner.hide();
      let x = 0;
      let y = 0;

      // tslint:disable-next-line:align
      const text = tes.text;
      const word = this.array_value[i];
      console.log("text", text);

      // tslint:disable-next-line:no-shadowed-variable
      // tslint:disable-next-line:align
      for (let i = 0; i < text.length; i++) {

        if (text[i] === word[0]) {
          for (let j = i; j < i + word.length; j++) {

            if (text[j] === word[j - i]) {
              y++;
            }
            if (y === word.length) {
              x++;
            }
          }
          y = 0;
        }
      }
      // tslint:disable-next-line:align
      if (x < 1) {
        // this.isProgressBarVisibile = false;

   

        // tslint:disable-next-line:whitespace
        if(this.array_value[i])
        {
          this.fileToUpload = null;
          this.msmeFormGroup.get(this.array[i]).setErrors({ error: true });
          this.msmeFormGroup.get(this.array[i]).markAsTouched();
        }
        // this.event_file = "";
      } 

      else {
        // this.isProgressBarVisibile = false;

        this.fileToUpload = evt.target.files[0];

        // this.flipFormGroup.get('InvoiceNumber').valid;

        // tslint:disable-next-line:no-unused-expression
        this.msmeFormGroup.get(this.array[i]).valid;
        this.msmeFormGroup.get(this.array[i]).setErrors(null);
        this.msmeFormGroup.get(this.array[i]).markAsUntouched();

      }
    }
    }
    }
  }


  Tesseract(url): any {
    let x = 0;
    let y = 0;
    // tslint:disable-next-line:typedef
    // tslint:disable-next-line:only-arrow-functions
    // tslint:disable-next-line:typedef
    return Tesseract.recognize(url).then(function (result) {

// alert(result)
    }).then(() => {

      return x;
    });
  }





  MsmeTypeSelection(type: string): void {
    if (type === 'OTH') {
      this.isAttachmentEnabled = false;
      this.fileToUpload = null;
    }
    else {
      this.isAttachmentEnabled = true;
      this.fileToUpload = null;
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
