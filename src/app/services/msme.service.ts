import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Msme, VendorTokenCheck } from '../models/msme';
import { catchError } from 'rxjs/operators';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsmeService {

  //baseAddress: string="http://localhost:6001/";
  baseAddress: string=environment.baseAddress;
  constructor(private _httpClient:HttpClient) { }

  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }


  CheckTokenValidity(VendorToken: VendorTokenCheck): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Registration/ChectTokenValidity`,
    VendorToken,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdateVendorOnBoarding(msme:Msme): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/Registration/UpdateVendorOnBoarding`,
    msme,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetMsmeByID(TransID: number): Observable<Msme> {
    return this._httpClient.get<any>(`${this.baseAddress}/api/Registration/GetVendorByID?TransID=${TransID}`)
      .pipe(catchError(this.errorHandler));
  }

  AddUserAttachment(TransID: number, CreatedBy: string, selectedFiles: File,perviousFileName=null): Observable<any> {
    const formData: FormData = new FormData();
    formData.append(selectedFiles.name,selectedFiles,selectedFiles.name);
    console.log("TransID",TransID.toString());
    const id=TransID.toString();
    formData.append('TransID', id);
    formData.append('PerviousFileName', perviousFileName);
    formData.append('CreatedBy', CreatedBy.toString());

    return this._httpClient.post<any>(`${this.baseAddress}api/Registration/AddUserAttachment`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }

}
