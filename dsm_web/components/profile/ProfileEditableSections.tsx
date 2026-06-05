"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { RootState } from "../../redux/store";
import { updateCredentials } from "../../redux/slices/authSlice";
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

export default function ProfileEditableSections() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);
    
    const [activeSection, setActiveSection] = useState<EditableSection>(null);
    const [addressMode, setAddressMode] = useState<"edit" | "add">("edit");
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() =>
        getInitialValue(PERSONAL_STORAGE_KEY, defaultPersonalInfo)
    );

    useEffect(() => {
        if (user) {
            setPersonalInfo(prev => ({
                ...prev,
                firstName: user.firstName || prev.firstName,
                lastName: user.lastName || prev.lastName,
                email: user.email || prev.email,
                mobileNumber: user.number || prev.mobileNumber,
            }));
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
        try {
            if (user && user._id) {
                const payload = {
                    firstName: nextPersonalInfo.firstName,
                    lastName: nextPersonalInfo.lastName,
                    email: nextPersonalInfo.email,
                    number: nextPersonalInfo.mobileNumber,
                };
                
                const response = await axiosInstance.put(`/auth/user/${user._id}`, payload);
                if (response.data) {
                    toast.success("Profile updated successfully!");
                    const updatedUser = { ...user, ...payload };
                    dispatch(updateCredentials({ user: updatedUser, token }));
                }
            } else {
                toast.error("You are not logged in!");
                return;
            }

            setPersonalInfo(nextPersonalInfo);
            window.localStorage.setItem(
                PERSONAL_STORAGE_KEY,
                JSON.stringify(nextPersonalInfo)
            );
            closeEditor();
        } catch (error: any) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile.");
        }
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
                fullName={formatFullName(personalInfo)}
                description="Manage your details with ease."
                address={displayAddress}
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
