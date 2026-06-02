"use client";

import { useState } from "react";
import { Building2, Edit } from "lucide-react";
import ProfileCardWrapper from "./ProfileCardWrapper";
import ProfileFormField from "./ProfileFormField";
import type { CompanyInfo } from "./profileTypes";

interface CompanyInfoCardProps {
    data: CompanyInfo;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: (nextCompanyInfo: CompanyInfo) => void;
}

const buttonClassName =
    "rounded-xl px-5 py-3 text-sm font-medium transition sm:px-7 sm:text-base";

interface CompanyInfoFormProps {
    initialData: CompanyInfo;
    onCancel: () => void;
    onSave: (nextCompanyInfo: CompanyInfo) => void;
}

function CompanyInfoForm({
    initialData,
    onCancel,
    onSave,
}: CompanyInfoFormProps) {
    const [formData, setFormData] = useState<CompanyInfo>(initialData);

    return (
        <form
            id="company-info-form"
            onSubmit={(event) => {
                event.preventDefault();
                onSave(formData);
            }}
            className="space-y-5"
        >
            <div className="grid grid-cols-1 gap-4">
                <ProfileFormField
                    id="company-gst-number"
                    label="GST Number"
                    value={formData.gstNumber}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            gstNumber: value,
                        }))
                    }
                    placeholder="Enter GST number"
                    showEditIcon
                />
                <ProfileFormField
                    id="company-name"
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            companyName: value,
                        }))
                    }
                    placeholder="Enter company name"
                    showEditIcon
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm font-medium text-[#8f8590] transition hover:text-heading"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function CompanyInfoCard({
    data,
    isEditing,
    onEdit,
    onCancel,
    onSave,
}: CompanyInfoCardProps) {
    if (isEditing) {
        return (
            <ProfileCardWrapper
                title="Company Details"
                description="Update only the company name and GST details here."
                action={
                    <button
                        type="submit"
                        form="company-info-form"
                        className={`bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg px-6 py-1.5 text-[0.65rem] font-bold shadow-sm hover:shadow-md sm:rounded-xl sm:px-7 sm:py-3 sm:text-base`}
                    >
                        Save
                    </button>
                }
            >
                <CompanyInfoForm
                    key={`${data.gstNumber}-${data.companyName}`}
                    initialData={data}
                    onCancel={onCancel}
                    onSave={onSave}
                />
            </ProfileCardWrapper>
        );
    }

    return (
        <ProfileCardWrapper
            title="Company Details"
            description="Manage your details with ease."
            action={
                <button
                    type="button"
                    onClick={onEdit}
                    className={`bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg px-4 py-1.5 text-[0.65rem] font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md sm:rounded-xl sm:px-7 sm:py-3 sm:text-base`}
                >
                    <span>Edit</span>
                    <Edit size={10} className="sm:h-3.5 sm:w-3.5" />
                </button>
            }
        >
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <Building2 size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">GST Number</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.gstNumber}
                    </p>
                </div>

                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <Building2 size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">Company Name</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.companyName}
                    </p>
                </div>
            </div>
        </ProfileCardWrapper>
    );
}
