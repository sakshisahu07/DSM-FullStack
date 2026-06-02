export type EditableSection = "personal" | "company" | "address" | null;

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
}

export interface CompanyInfo {
    gstNumber: string;
    companyName: string;
}

export interface AddressInfo {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    street: string;
    saveForNextTime: boolean;
}

export const defaultPersonalInfo: PersonalInfo = {
    firstName: "Aisha",
    lastName: "Sheikh",
    email: "aishasheikh@gmail.com",
    mobileNumber: "+91 2118 35624",
};

export const defaultCompanyInfo: CompanyInfo = {
    gstNumber: "2345-3564-82YSD566",
    companyName: "ABC Firm Pvt. ltd",
};

export const defaultAddressInfo: AddressInfo = {
    country: "India",
    state: "Madhya Pradesh",
    city: "Bhopal",
    zipCode: "462001",
    street: "2118 Satya Kabeer E solution indrapuri C sector",
    saveForNextTime: true,
};

export const emptyAddressInfo: AddressInfo = {
    country: "",
    state: "",
    city: "",
    zipCode: "",
    street: "",
    saveForNextTime: true,
};
