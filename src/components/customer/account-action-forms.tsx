import {
  AddressManager,
  type CustomerAddressFormModel
} from "@/components/customer/address-manager";
import {
  ProfileForm,
  type CustomerProfileFormModel
} from "@/components/customer/profile-form";
import { PasswordForm } from "@/components/customer/password-form";

type AccountActionFormsProps = {
  customer: CustomerProfileFormModel;
  addresses: CustomerAddressFormModel[];
};

export function AccountActionForms({ customer, addresses }: AccountActionFormsProps) {
  return (
    <div className="grid gap-6">
      <ProfileForm customer={customer} />
      <AddressManager addresses={addresses} />
      <PasswordForm />
    </div>
  );
}
