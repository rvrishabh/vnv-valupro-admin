/**
 * Declarative field definitions for the valuation form.
 *
 * Each entry names the JSON section it belongs to, its label as printed in the
 * workbook, and the option group backing it. A field with a `group` renders as
 * a dropdown; one without renders as a text input. Keeping these as data means
 * a field added to the book is a one-line change here, not new JSX.
 */
export interface FieldDef {
  key: string;
  label: string;
  /** Option group name; omit for a free-text field. */
  group?: string;
  /**
   * Offer the group's options but also accept a typed-in value. For fields
   * where the book's list is a starting point rather than an exhaustive one.
   */
  creatable?: boolean;
  type?: "text" | "number" | "textarea";
  /** Cell reference in the master workbook, for traceability. */
  cell?: string;
}

/** M-Doc!C41:C50 — the address as observed on site. */
export const SITE_ADDRESS_FIELDS: FieldDef[] = [
  { key: "propertyNumber", label: "Property Number / Flat No.", cell: "C41" },
  { key: "municipalNo", label: "Municipal No.", cell: "C42" },
  { key: "subStreet", label: "Sub-Street / Apartment Building", cell: "C43" },
  { key: "colony", label: "Colony / Locality", cell: "C44" },
  { key: "mainConnectingRoad", label: "Main Connecting Road", cell: "C45" },
  {
    key: "cityVillageTown",
    label: "City / Village / Town Name with Tehsil & District",
    cell: "C46",
  },
  { key: "landmark", label: "Land Mark if any", cell: "C47" },
  { key: "tehsilForCircleRates", label: "Tehsil for Circle Rates", group: "tehsil", cell: "C48" },
  { key: "district", label: "District", cell: "C49" },
  {
    key: "wardTehsilRegistration",
    label: "Ward / Tehsil for registration",
    group: "wardTehsilRegistration",
    cell: "C50",
  },
];

/** M-Doc!C63:C69 — shown only when the tenure is Leasehold. */
export const LEASE_FIELDS: FieldDef[] = [
  { key: "lessor", label: "Lessor", cell: "C63" },
  { key: "lessee", label: "Lessee", cell: "C64" },
  { key: "dateOfCommencement", label: "Date of Commencement", cell: "C65" },
  { key: "periodOfLease", label: "Period of lease", cell: "C66" },
  { key: "initialPremium", label: "Initial Premium", cell: "C67" },
  { key: "groundRent", label: "Ground Rent payable p.a.", cell: "C68" },
  { key: "easementAgreements", label: "Are there any agreements of easement?", cell: "C69" },
];

/** M-Doc!C80:C87 — discrepancy checks and road frontage. */
export const DISCREPANCY_FIELDS: FieldDef[] = [
  {
    key: "boundariesMatching",
    label: "Boundaries matching with the docs",
    group: "boundariesMatching",
    cell: "C80",
  },
  {
    key: "mismatchReason",
    label: "Reason for mismatch of boundaries",
    group: "boundaryMismatchReason",
    // The book lists three stock reasons; real mismatches rarely match one, so
    // the valuer can describe what they actually found.
    creatable: true,
    cell: "C81",
  },
  { key: "plotDemarcated", label: "Plot demarcated", group: "plotDemarcated", cell: "C82" },
  {
    key: "ownershipVerified",
    label: "Present ownership verified",
    group: "ownershipVerified",
    cell: "C83",
  },
  {
    key: "roadSide",
    label: "Roads/streets the land abuts",
    type: "textarea",
    cell: "C85",
  },
  {
    key: "landLocked",
    label: "Is it a land-locked land?",
    group: "boundariesMatching",
    cell: "C87",
  },
];

/** M-Rate building specifications (rows 4-26). */
export const BUILDING_SPEC_FIELDS: FieldDef[] = [
  { key: "typeOfConstruction", label: "Type of Construction", group: "typeOfConstruction", cell: "C4" },
  { key: "foundation", label: "Type of foundations", group: "foundation", cell: "C5" },
  { key: "compoundWall", label: "Compound Wall — Height & Length", cell: "C6" },
  { key: "quality", label: "Quality of Building Construction", group: "qualityOfConstruction", cell: "C12" },
  { key: "stage", label: "Stage of Construction", group: "stageOfConstruction", cell: "C13" },
  { key: "roofingTerracing", label: "Roofing / Terracing", group: "roofingTerracing", cell: "C16" },
  { key: "waterSupply", label: "Municipal / underground water?", group: "waterSupply", cell: "C19" },
  { key: "sewerage", label: "Sewerage?", group: "sewerage", cell: "C20" },
  { key: "typeOfRoad", label: "Type of road", group: "typeOfRoad", cell: "C21" },
  { key: "widthOfRoad", label: "Width of road", group: "widthOfRoad", cell: "C22" },
  { key: "maintenance", label: "General maintenance of building", group: "maintenance", cell: "C23" },
  { key: "exterior", label: "Exterior", group: "exterior", cell: "C24" },
  { key: "interior", label: "Interior", group: "interior", cell: "C25" },
  { key: "appearance", label: "Appearance of Building", group: "appearanceOfBuilding", cell: "C26" },
];

/** M-Gen — approval, occupancy, locational and miscellaneous details. */
export const GENERAL_FIELDS: FieldDef[] = [
  { key: "approvedColony", label: "Whether approved or unapproved colony", group: "approvedColony", cell: "C3" },
  { key: "buildingPlanApproved", label: "Is building plan approved", group: "buildingPlanApproved", cell: "C4" },
  { key: "approvingAuthority", label: "Name of approving authority", group: "approvingAuthority", cell: "C5" },
  {
    key: "constructionAsPerLayout",
    label: "Construction as per approved layout",
    group: "constructionAsPerLayout",
    cell: "C6",
  },
  { key: "natureOfViolations", label: "Nature & extent of violations", group: "natureOfViolations", cell: "C8" },
  { key: "propertyTaxPaid", label: "Property tax paid", group: "propertyTaxPaid", cell: "C9" },
  { key: "occupancyStatus", label: "Owner occupied / tenanted / both", group: "occupancyStatus", cell: "C10" },
  { key: "tenancy", label: "Tenancy", group: "tenancy", cell: "C14" },
  { key: "cityTownVillage", label: "City / Town / Village", group: "cityTownVillage", cell: "C24" },
  { key: "approvedLandUse", label: "Approved land use / classification", group: "approvedLandUse", cell: "C25" },
  { key: "purposeOfUse", label: "Purpose for which property is used", group: "purposeOfUse", cell: "C26" },
  { key: "classOfLocality", label: "Middle / Lower / Upper class people", group: "classOfLocality", cell: "C27" },
  { key: "urbanSemiUrbanRural", label: "Urban / Semi-urban / Rural", group: "urbanSemiUrbanRural", cell: "C28" },
  { key: "corporationLimit", label: "Corporation limit / Village Panchayat", group: "corporationLimit", cell: "C29" },
  { key: "restrictiveCovenant", label: "Any restrictive covenant", group: "restrictiveCovenant", cell: "C30" },
  {
    key: "usedForSanctionedPurpose",
    label: "Used for the sanctioned purpose?",
    group: "usedForSanctionedPurpose",
    cell: "C31",
  },
  { key: "proximityToAmenities", label: "Proximity to civic amenities", group: "proximityToAmenities", cell: "C32" },
  { key: "developmentOfArea", label: "Development of surrounding area", group: "developmentOfArea", cell: "C37" },
  { key: "levelOfLand", label: "Level of land with topographical conditions", group: "levelOfLand", cell: "C38" },
  { key: "roadFacilities", label: "Road facilities", group: "roadFacilities", cell: "C39" },
  { key: "floodingProne", label: "Locality subject to frequent flooding?", group: "floodingProne", cell: "C44" },
  { key: "plotShape", label: "Shape of plot", group: "plotShape", cell: "C47" },
  { key: "powerSupply", label: "Power supply available on site", group: "powerSupply", cell: "C68" },
];
