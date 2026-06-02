"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressCard from "./AddressCard";
import CompanyInfoCard from "./CompanyInfoCard";
import PersonalInfoCard from "./PersonalInfoCard";
import ProfileHeaderCard from "./ProfileHeaderCard";
import {
    type AddressInfo,
    type CompanyInfo,
    type EditableSection,
    type PersonalInfo,
    defaultAddressInfo,
    defaultCompanyInfo,
    defaultPersonalInfo,
} from "./profileTypes";

const PERSONAL_STORAGE_KEY = "dsm-profile-personal-info";
const COMPANY_STORAGE_KEY = "dsm-profile-company-info";
const ADDRESS_STORAGE_KEY = "dsm-profile-address-info";

function getStoredValue<T>(key: string): T | null {
    if (typeof window === "undefined") {
        return null;
    }

    const value = window.localStorage.getItem(key);
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function getInitialValue<T>(key: string, fallback: T): T {
    const storedValue = getStoredValue<T>(key);
    if (!storedValue) {
        return fallback;
    }

    if (
        typeof fallback === "object" &&
        fallback !== null &&
        typeof storedValue === "object" &&
        storedValue !== null
    ) {
        return {
            ...fallback,
            ...storedValue,
        };
    }

    return storedValue;
}

function formatFullName(personalInfo: PersonalInfo) {
    return `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
}

function formatAddress(addressInfo: AddressInfo) {
    return [
        addressInfo.street,
        addressInfo.city,
        addressInfo.state,
        addressInfo.country,
        addressInfo.zipCode,
    ]
        .filter(Boolean)
        .join(", ");
}

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { updateUserProfile } from "@/redux/slices/authSlice";

export default function ProfileEditableSections() {
    const router = useRouter();
    const dispatch = useDispatch<any>();
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeSection, setActiveSection] = useState<EditableSection>(null);
    const [addressMode, setAddressMode] = useState<"edit" | "add">("edit");
    
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() => {
        if (user) {
            return {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                mobileNumber: user.number || "",
            };
        }
        return { firstName: "", lastName: "", email: "", mobileNumber: "" };
    });

    // Update personalInfo when user loads
    useEffect(() => {
        if (user) {
            setPersonalInfo({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                mobileNumber: user.number || "",
            });
        }
    }, [user]);

    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() =>
        getInitialValue(COMPANY_STORAGE_KEY, defaultCompanyInfo)
    );
    const [addresses, setAddresses] = useState<AddressInfo[]>(() => {
        const val = getStoredValue<any>(ADDRESS_STORAGE_KEY);
        if (Array.isArray(val) && val.length > 0) return val;
        if (val && typeof val === "object" && !Array.isArray(val)) return [val as AddressInfo];
        return [defaultAddressInfo];
    });

    // The index of the address being edited
    const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

    const closeEditor = () => {
        setActiveSection(null);
        setAddressMode("edit");
        setEditingAddressIndex(null);
    };

    const handlePersonalSave = async (nextPersonalInfo: PersonalInfo) => {
        if (user && user._id) {
            try {
                await dispatch(updateUserProfile({
                    id: user._id,
                    data: {
                        firstName: nextPersonalInfo.firstName,
                        lastName: nextPersonalInfo.lastName,
                        email: nextPersonalInfo.email,
                        number: nextPersonalInfo.mobileNumber
                    }
                })).unwrap();
                // Update local state only on success
                setPersonalInfo(nextPersonalInfo);
            } catch (err) {
                console.error("Failed to update user profile", err);
                // Optionally add a toast error here
            }
        }
        closeEditor();
    };

    const handleCompanySave = (nextCompanyInfo: CompanyInfo) => {
        setCompanyInfo(nextCompanyInfo);
        window.localStorage.setItem(
            COMPANY_STORAGE_KEY,
            JSON.stringify(nextCompanyInfo)
        );
        closeEditor();
    };

    const handleAddressSave = (nextAddressInfo: AddressInfo) => {
        let newAddresses = [...addresses];
        if (addressMode === "add") {
            newAddresses.push(nextAddressInfo);
        } else if (editingAddressIndex !== null) {
            newAddresses[editingAddressIndex] = nextAddressInfo;
        }

        setAddresses(newAddresses);
        window.localStorage.setItem(
            ADDRESS_STORAGE_KEY,
            JSON.stringify(newAddresses)
        );
        closeEditor();
    };

    // To prevent formatAddress from throwing an error if it expects a single object
    const displayAddress = addresses.length > 0 ? formatAddress(addresses[0]) : "";

    return (
        <div className="space-y-4 md:space-y-6">
            <ProfileHeaderCard
                fullName={formatFullName(personalInfo) || "User"}
                description="Manage your details with ease."
                address={displayAddress || "No address added"}
            />

            <PersonalInfoCard
                data={personalInfo}
                isEditing={activeSection === "personal"}
                onEdit={() => setActiveSection("personal")}
                onCancel={closeEditor}
                onSave={handlePersonalSave}
            />

            <CompanyInfoCard
                data={companyInfo}
                isEditing={activeSection === "company"}
                onEdit={() => setActiveSection("company")}
                onCancel={closeEditor}
                onSave={handleCompanySave}
            />

            {addresses.map((addr, index) => (
                <AddressCard
                    key={index}
                    data={addr}
                    index={index + 1}
                    isEditing={activeSection === "address" && editingAddressIndex === index}
                    mode="edit"
                    onEdit={() => {
                        setAddressMode("edit");
                        setEditingAddressIndex(index);
                        setActiveSection("address");
                    }}
                    onAddAddress={() => {
                        setAddressMode("add");
                        setEditingAddressIndex(null);
                        setActiveSection("address");
                    }}
                    onCancel={closeEditor}
                    onSave={handleAddressSave}
                />
            ))}

            {/* If adding an address, show an empty address card in edit mode */}
            {activeSection === "address" && addressMode === "add" && (
                <AddressCard
                    data={defaultAddressInfo}
                    index={addresses.length + 1}
                    isEditing={true}
                    mode="add"
                    onEdit={() => {}}
                    onAddAddress={() => {}}
                    onCancel={closeEditor}
                    onSave={handleAddressSave}
                />
            )}
        </div>
    );
}
