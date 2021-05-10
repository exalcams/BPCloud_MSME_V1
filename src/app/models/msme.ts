
export class VendorTokenCheck {
    transID: number;
    emailAddress: string;
    token: string;
    isValid: boolean;
    message: string;
}

export class Msme {
    transID: number;
    name: string;
    vendorCode: string;
    token: string;
    email: string;
    status: string;
    panNumber: string;
    uanNumber: string;
    expiryDate: Date | string | null;
    msmeType: string;
    attachment: string;
    submittedOn?: Date;
}
