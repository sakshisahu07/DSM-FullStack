"use client";

import { useState } from "react";
import { Check, Edit, MapPin, PlusSquare } from "lucide-react";
import ProfileCardWrapper from "./ProfileCardWrapper";
import ProfileFormField from "./ProfileFormField";
import { emptyAddressInfo, type AddressInfo } from "./profileTypes";

interface AddressCardProps {
    data: AddressInfo;
    index?: number;
    isEditing: boolean;
    mode: "edit" | "add";
    onEdit: () => void;
    onAddAddress: () => void;
    onCancel: () => void;
    onSave: (nextAddressInfo: AddressInfo) => void;
}

// ... unchanged until function definition ...
const buttonClassName =
    "rounded-xl px-5 py-3 text-sm font-medium transition sm:px-7 sm:text-base";

const countryOptions = [
    { label: "India", value: "India" },
    { label: "United States", value: "United States" },
    { label: "United Kingdom", value: "United Kingdom" },
];

const stateOptions = [
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Delhi", value: "Delhi" },
];

interface AddressFormProps {
    initialData: AddressInfo;
    onCancel: () => void;
    onSave: (nextAddressInfo: AddressInfo) => void;
}

function AddressForm({ initialData, onCancel, onSave }: AddressFormProps) {
    const [formData, setFormData] = useState<AddressInfo>(initialData);

    return (
        <form
            id="address-info-form"
            onSubmit={(event) => {
                event.preventDefault();
                onSave(formData);
            }}
            className="space-y-5"
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ProfileFormField
                    id="address-country"
                    label="Country"
                    value={formData.country}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            country: value,
                        }))
                    }
                    placeholder="Select country"
                    type="select"
                    options={countryOptions}
                    className="lg:col-span-2"
                />
                <ProfileFormField
                    id="address-state"
                    label="State"
                    value={formData.state}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            state: value,
                        }))
                    }
                    placeholder="Select state"
                    type="select"
                    options={stateOptions}
                    className="lg:col-span-2"
                />
                <ProfileFormField
                    id="address-city"
                    label="City"
                    value={formData.city}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            city: value,
                        }))
                    }
                    placeholder="Enter city"
                    className="lg:col-span-1"
                />
                <ProfileFormField
                    id="address-zip-code"
                    label="Zip Code"
                    value={formData.zipCode}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            zipCode: value,
                        }))
                    }
                    placeholder="Enter zip code"
                    className="lg:col-span-1"
                />
                <ProfileFormField
                    id="address-street"
                    label="Street Address"
                    value={formData.street}
                    onChange={(value) =>
                        setFormData((current) => ({
                            ...current,
                            street: value,
                        }))
                    }
                    placeholder="Enter street address"
                    multiline
                    className="lg:col-span-2"
                />
            </div>

            <label className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 text-[0.65rem] sm:text-base font-bold sm:font-medium text-gray-800 sm:text-[#4b454b] cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.saveForNextTime}
                    onChange={(event) =>
                        setFormData((current) => ({
                            ...current,
                            saveForNextTime: event.target.checked,
                        }))
                    }
                    className="peer sr-only"
                />
                <span className={`flex h-4 w-4 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded sm:rounded-md text-white shadow-sm transition-colors ${formData.saveForNextTime ? 'bg-gradient-to-r from-[#E47B25] to-[#B3520A]' : 'bg-gray-100 border border-gray-200'}`}>
                    {formData.saveForNextTime ? <Check size={12} className="sm:h-4 sm:w-4" strokeWidth={3} /> : null}
                </span>
                Save this information for next time
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-[#E47B25] to-[#B3520A] px-5 py-3 text-sm font-medium text-white transition hover:shadow-md sm:px-7 sm:text-base"
                >
                    Save
                </button>
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

export default function AddressCard({
    data,
    index,
    isEditing,
    mode,
    onEdit,
    onAddAddress,
    onCancel,
    onSave,
}: AddressCardProps) {
    if (isEditing) {
        return (
            <ProfileCardWrapper
                title={mode === "add" ? "Add Address" : `Edit Address ${index || ''}`.trim()}
                description="Update only your address details in this section."
            >
                <AddressForm
                    key={`${mode}-${data.city}-${data.zipCode}-${data.street}`}
                    initialData={mode === "add" ? emptyAddressInfo : data}
                    onCancel={onCancel}
                    onSave={onSave}
                />
            </ProfileCardWrapper>
        );
    }

    return (
        <ProfileCardWrapper
            title={`Address ${index || ''}`.trim()}
            description="Manage your details with ease."
            action={
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onAddAddress}
                        className={`bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg px-3 py-1.5 text-[0.65rem] font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md sm:rounded-xl sm:px-7 sm:py-3 sm:text-base`}
                    >
                        <PlusSquare size={10} className="sm:h-3.5 sm:w-3.5" />
                        <span>Add Address</span>
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        className={`bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg px-4 py-1.5 text-[0.65rem] font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md sm:rounded-xl sm:px-7 sm:py-3 sm:text-base`}
                    >
                        <span>Edit</span>
                        <Edit size={10} className="sm:h-3.5 sm:w-3.5" />
                    </button>
                </div>
            }
        >
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <MapPin size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">Country</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.country}
                    </p>
                </div>

                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <MapPin size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">State</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.state}
                    </p>
                </div>

                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <MapPin size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">City</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.city}
                    </p>
                </div>

                <div className="col-span-1">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <MapPin size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">Zip Code</p>
                    </div>
                    <p className="text-heading text-xs font-bold sm:font-medium sm:text-lg">
                        {data.zipCode}
                    </p>
                </div>

                <div className="col-span-2">
                    <div className="mb-1 sm:mb-2 flex items-center gap-1.5 text-muted">
                        <MapPin size={12} className="shrink-0 text-gray-400 sm:text-inherit sm:h-4 sm:w-4" />
                        <p className="text-[0.65rem] sm:text-sm text-gray-400 sm:text-inherit">Street</p>
                    </div>
                    <p className="text-heading break-words text-xs font-bold sm:font-medium sm:text-lg">
                        {data.street}
                    </p>
                </div>
            </div>
        </ProfileCardWrapper>
    );
}
