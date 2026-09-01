import { DatePicker } from "@/components/date-picker";
import FormDropdown from "@/components/Form/FormDropdown";
import FormInput from "@/components/Form/FormInput";
import { FormNumberInput } from "@/components/Form/FormNumberInput";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { CreatableSelect } from "@/components/Valuation/CreatableSelect";
import { LEASE_FIELDS } from "@/components/Valuation/field-groups";
import { LocationMap } from "@/components/Valuation/LocationMap";
import { OptionSelect } from "@/components/Valuation/OptionSelect";
import { FIELD_LABEL_CLASS, SectionFields } from "@/components/Valuation/SectionFields";
import {
  METHODS,
  TITLE_DEED_TEXT_FIELDS,
  type FormState,
} from "@/components/Valuation/valuation-form.utils";
import type { ValuationOptions } from "@/types";
import type { Control } from "react-hook-form";

export function PropertyTitleTab({
  control,
  options,
  disabled,
  isLeasehold,
  gpsCoordinatesValue,
}: {
  control: Control<FormState>;
  options?: ValuationOptions;
  disabled: boolean;
  isLeasehold: boolean;
  gpsCoordinatesValue: string;
}) {
  return (
    <TabsContent value="property" className="mt-4 flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basic / Office Data</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormDropdown
            control={control}
            name="method"
            label="Method of valuation"
            options={METHODS}
            allowClear={false}
            disabled={disabled}
          />

          <FormInput
            control={control}
            name="reportYear"
            label="Report year"
            labelClassName={FIELD_LABEL_CLASS}
            hint="Ages are measured against this year."
            type="number"
            disabled={disabled}
          />

          <FormNumberInput
            control={control}
            name="advanceReceived"
            label="Advance received (₹)"
            labelClassName={FIELD_LABEL_CLASS}
            disabled={disabled}
          />

          <CreatableSelect
            control={control}
            name="propertyType"
            label="Specify type of property"
            description="Pick from the list, or type a value that isn't there."
            group="propertyType"
            options={options}
            disabled={disabled}
          />

          <FormInput
            control={control}
            name="gpsCoordinates"
            label="GPS co-ordinates"
            labelClassName={FIELD_LABEL_CLASS}
            placeholder="27.565146, 78.652088"
            disabled={disabled}
          />

          <div className="sm:col-span-2">
            <LocationMap coordinates={gpsCoordinatesValue} />
          </div>

          <div className="sm:col-span-2">
            <FormTextArea
              control={control}
              name="documentsReceived"
              label="Documents received"
              labelClassName={FIELD_LABEL_CLASS}
              rows={2}
              placeholder="Title Deed, Sale Deed & Legal Report"
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ownership &amp; Title Deed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="titleDeed.ownerName"
            label="Name of the owner(s)"
            labelClassName={FIELD_LABEL_CLASS}
            disabled={disabled}
          />

          <OptionSelect
            control={control}
            name="titleDeed.ownershipType"
            label="Type of ownership"
            group="ownershipType"
            options={options}
            disabled={disabled}
          />

          <OptionSelect
            control={control}
            name="titleDeed.sharesDivided"
            label="Are shares divided, then proportion"
            group="sharesDivided"
            options={options}
            disabled={disabled}
          />

          <OptionSelect
            control={control}
            name="assetsSoldAsPerDeed"
            label="Assets sold as per title deed"
            group="assetsSoldAsPerDeed"
            options={options}
            disabled={disabled}
          />

          <FormTextArea
            control={control}
            name="titleDeed.addressAsPerDeed"
            label="Address of property mentioned in the deed"
            labelClassName={FIELD_LABEL_CLASS}
            containerClassName="sm:col-span-2"
            rows={2}
            disabled={disabled}
          />

          {TITLE_DEED_TEXT_FIELDS.map((field) => {
            if (field.key === "purchaseDate") {
              return (
                <DatePicker
                  key={field.key}
                  control={control}
                  name={`titleDeed.${field.key}`}
                  label={field.label}
                  disabled={disabled}
                />
              );
            }

            if (field.key === "purchasePrice") {
              return (
                <FormNumberInput
                  key={field.key}
                  control={control}
                  name={`titleDeed.${field.key}`}
                  label={field.label}
                  labelClassName={FIELD_LABEL_CLASS}
                  disabled={disabled}
                />
              );
            }

            return (
              <FormInput
                key={field.key}
                control={control}
                name={`titleDeed.${field.key}`}
                label={field.label}
                labelClassName={FIELD_LABEL_CLASS}
                disabled={disabled}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Freehold / Leasehold</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <OptionSelect
            control={control}
            name="tenure"
            label="Leasehold / Freehold"
            group="tenure"
            options={options}
            disabled={disabled}
          />

          {/* The sheet strikes these through for a freehold property, so
              they are hidden here rather than shown as N.A. */}
          {isLeasehold ? (
            <SectionFields
              control={control}
              section="leaseDetails"
              fields={LEASE_FIELDS}
              options={options}
              disabled={disabled}
            />
          ) : null}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
