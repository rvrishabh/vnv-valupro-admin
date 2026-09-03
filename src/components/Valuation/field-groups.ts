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
  /**
   * Save a typed value back to the option group. Only for open-ended registers
   * of places, which no workbook can list exhaustively.
   */
  persist?: boolean;
  type?: "text" | "number" | "textarea" | "date" | "money";
  /** Short note shown under the field — for a unit, a caveat, or why it matters. */
  description?: string;
  /** Cell reference in the master workbook, for traceability. */
  cell?: string;
  /**
   * Value a draft starts on before the valuer touches this field — either
   * "N.A." (most select fields; also the specific free-text cells the master
   * workbook's own filled-out examples consistently leave at N.A.) or a real
   * answer the book's example uses so consistently it's effectively the
   * standard one (e.g. "Available" for road facilities).
   */
  defaultValue?: string;
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
  {
    key: "tehsilForCircleRates",
    label: "Tehsil for Circle Rates",
    group: "tehsil",
    creatable: true,
    persist: true,
    cell: "C48",
  },
  { key: "district", label: "District", cell: "C49" },
  {
    key: "wardTehsilRegistration",
    label: "Ward / Tehsil for registration",
    group: "wardTehsilRegistration",
    creatable: true,
    persist: true,
    cell: "C50",
  },
  {
    key: "mohalla",
    label: "Local body / Mohalla",
    description: "The circle-rate register is keyed on this, not the tehsil above.",
    group: "circleRateMohalla",
    creatable: true,
    persist: true,
  },
  {
    key: "roadWidthMeters",
    label: "Road width (metres)",
    description: "Required to submit — picks the circle-rate band (<=9m / 9-18m / >18m).",
    type: "number",
  },
];

/** M-Doc!C63:C69 — shown only when the tenure is Leasehold. */
export const LEASE_FIELDS: FieldDef[] = [
  { key: "lessor", label: "Lessor", cell: "C63" },
  { key: "lessee", label: "Lessee", cell: "C64" },
  { key: "dateOfCommencement", label: "Date of Commencement", type: "date", cell: "C65" },
  { key: "periodOfLease", label: "Period of lease", cell: "C66" },
  { key: "initialPremium", label: "Initial Premium", type: "money", cell: "C67" },
  { key: "groundRent", label: "Ground Rent payable p.a.", type: "money", cell: "C68" },
  { key: "easementAgreements", label: "Are there any agreements of easement?", cell: "C69" },
];

/** M-Doc!C115:C118 — accommodation counts, summarised into C120 on the report. */
export const ROOM_FIELDS: FieldDef[] = [
  { key: "livingRooms", label: "Living Rooms", type: "number", cell: "C115" },
  { key: "bedRooms", label: "Bed rooms", type: "number", cell: "C116" },
  { key: "waterClosets", label: "Water Closets", type: "number", cell: "C117" },
  { key: "kitchen", label: "Kitchen", type: "number", cell: "C118" },
];

/** M-Doc!C122:C124 — floor details. */
export const FLOOR_DETAIL_FIELDS: FieldDef[] = [
  { key: "totalFloors", label: "Total No. of Floors", group: "totalFloors", cell: "C122" },
  {
    key: "floorSituated",
    label: "Floor on which flat/shop is situated",
    group: "floorSituated",
    cell: "C123",
  },
  { key: "flatType", label: "Flat Type", group: "flatType", cell: "C124" },
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
    key: "propertyFacing",
    label: "Which side is the property facing",
    group: "propertyFacing",
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
  { key: "typeOfConstruction", label: "Type of Construction", group: "typeOfConstruction", creatable: true, cell: "C4" },
  { key: "foundation", label: "Type of foundations", group: "foundation", creatable: true, cell: "C5" },
  { key: "compoundWall", label: "Compound Wall — Height & Length", group: "compoundWall", creatable: true, cell: "C6" },
  { key: "lifts", label: "Lifts", group: "lifts", creatable: true, cell: "C7" },
  { key: "quality", label: "Quality of Building Construction", group: "qualityOfConstruction", creatable: true, cell: "C12" },
  { key: "stage", label: "Stage of Construction", group: "stageOfConstruction", creatable: true, cell: "C13" },
  { key: "roofingTerracing", label: "Roofing / Terracing", group: "roofingTerracing", creatable: true, cell: "C16" },
  { key: "waterSupply", label: "Municipal / underground water?", group: "waterSupply", creatable: true, cell: "C19" },
  { key: "sewerage", label: "Sewerage?", group: "sewerage", creatable: true, cell: "C20" },
  { key: "typeOfRoad", label: "Type of road", group: "typeOfRoad", creatable: true, cell: "C21" },
  { key: "widthOfRoad", label: "Width of road", group: "widthOfRoad", creatable: true, cell: "C22" },
  { key: "maintenance", label: "General maintenance of building", group: "maintenance", creatable: true, cell: "C23" },
  { key: "exterior", label: "Exterior", group: "exterior", creatable: true, cell: "C24" },
  { key: "interior", label: "Interior", group: "interior", creatable: true, cell: "C25" },
  { key: "appearance", label: "Appearance of Building", group: "appearanceOfBuilding", creatable: true, cell: "C26" },
];

/**
 * M-Gen — approval, occupancy, locational, rate-factor and facility details.
 * Split to match the sheet's own five blocks (rows 3-11, 13-21, 23-35, 37-58,
 * 60-79) rather than one long list — a card per block is what the sheet's own
 * blank-row separators are already telling us. `defaultValue` is set to
 * "N.A." on every dropdown (a safe unset state to start a select on) and on
 * the free-text fields a filled-out example of this sheet consistently
 * leaves at N.A.; a few fields default to a real answer the sheet's example
 * uses so consistently it's effectively the standard one.
 */
export const APPROVAL_FIELDS: FieldDef[] = [
  { key: "approvedColony", label: "Whether approved or unapproved colony", group: "approvedColony", creatable: true, defaultValue: "N.A.", cell: "C3" },
  { key: "buildingPlanApproved", label: "Is building plan approved", group: "buildingPlanApproved", creatable: true, defaultValue: "N.A.", cell: "C4" },
  { key: "approvingAuthority", label: "Name of approving authority", group: "approvingAuthority", creatable: true, defaultValue: "N.A.", cell: "C5" },
  // Printed twice in the report — as clause 18's "Approval No." and again as
  // the drawing-approval date/validity line in Annexure-01 Part B.
  {
    key: "buildingPlanApprovalNo",
    label: "Approved plan no. & validity",
    description: "As printed on the sanctioned plan, e.g. \"Approved vide Plan No. 1452/BFT/12/12-13\".",
    defaultValue: "N.A.",
  },
  {
    key: "planAuthenticityVerified",
    label: "Genuineness / authenticity of the approved plan verified",
    group: "buildingPlanApproved",
    creatable: true,
    defaultValue: "N.A.",
  },
  {
    key: "constructionAsPerLayout",
    label: "Construction as per approved layout",
    group: "constructionAsPerLayout",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C8",
  },
  {
    key: "natureOfViolations",
    label: "Nature & extent of violations",
    group: "natureOfViolations",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C9",
  },
  { key: "propertyTaxPaid", label: "Property tax paid", group: "propertyTaxPaid", creatable: true, defaultValue: "N.A.", cell: "C10" },
  // Free text in the sheet — a single cell the valuer fills in by hand, no dropdown.
  { key: "taxReceiptNumberDate", label: "Latest tax receipt number & date", cell: "C11" },
];

export const OCCUPANCY_FIELDS: FieldDef[] = [
  // No defaultValue — this is the one field in the section the valuer must
  // actively pick, not one that's usually N.A. for a real property.
  { key: "occupancyStatus", label: "Owner occupied / tenanted / both", group: "occupancyStatus", creatable: true, cell: "C13" },
  {
    key: "yearsOfOccupancy",
    label: "No. of years of occupancy",
    group: "yearsOfOccupancy",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C14",
  },
  {
    key: "occupantsRelatedToOwner",
    label: "Are any occupants related to or close business associates of the owner",
    group: "occupantsRelatedToOwner",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C15",
  },
  {
    key: "portionUnderOccupation",
    label: "Portion & extent under owner-occupation and under tenants' occupation",
    defaultValue: "N.A.",
    cell: "C16",
  },
  { key: "tenantNames", label: "Names of tenants / licensees", defaultValue: "N.A.", cell: "C17" },
  { key: "rentPaid", label: "Monthly or annual rent / compensation / licence fee paid", defaultValue: "N.A.", cell: "C18" },
  {
    key: "disputePending",
    label: "Any landlord-tenant rent dispute pending in court",
    group: "disputePending",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C19",
  },
  {
    key: "tenantBearsCost",
    label: "Does the tenant bear electricity, water, maintenance etc.",
    group: "tenantBearsCost",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C20",
  },
  { key: "approxRent", label: "Approx. rent p.m. for 100% complete property", defaultValue: "N.A.", cell: "C21" },
];

export const LOCATION_FIELDS: FieldDef[] = [
  { key: "cityTownVillage", label: "City / Town / Village", group: "cityTownVillage", creatable: true, defaultValue: "N.A.", cell: "C24" },
  { key: "approvedLandUse", label: "Approved land use / classification", group: "approvedLandUse", creatable: true, defaultValue: "N.A.", cell: "C25" },
  { key: "purposeOfUse", label: "Purpose for which property is used", group: "purposeOfUse", creatable: true, defaultValue: "N.A.", cell: "C26" },
  { key: "classOfLocality", label: "Middle / Lower / Upper class people", group: "classOfLocality", creatable: true, defaultValue: "N.A.", cell: "C27" },
  { key: "urbanSemiUrbanRural", label: "Urban / Semi-urban / Rural", group: "urbanSemiUrbanRural", creatable: true, defaultValue: "N.A.", cell: "C28" },
  { key: "corporationLimit", label: "Corporation limit / Village Panchayat", group: "corporationLimit", creatable: true, defaultValue: "N.A.", cell: "C29" },
  {
    key: "restrictiveCovenant",
    label: "Any restrictive covenant",
    group: "restrictiveCovenant",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C30",
  },
  {
    key: "usedForSanctionedPurpose",
    label: "Used for the sanctioned purpose?",
    group: "usedForSanctionedPurpose",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C31",
  },
  { key: "proximityToAmenities", label: "Proximity to civic amenities", group: "proximityToAmenities", creatable: true, defaultValue: "N.A.", cell: "C32" },
  { key: "distanceFromBusStand", label: "Distance from nearest bus stand", cell: "C33" },
  { key: "distanceFromRailwayStation", label: "Distance from nearest railway station", cell: "C34" },
  { key: "distanceFromBranch", label: "Distance from branch", cell: "C35" },
];

/** Development of the surrounding area and factors affecting land rates. */
export const DEVELOPMENT_FIELDS: FieldDef[] = [
  { key: "developmentOfArea", label: "Development of surrounding area", group: "developmentOfArea", creatable: true, defaultValue: "Developed Area", cell: "C37" },
  { key: "levelOfLand", label: "Level of land with topographical conditions", group: "levelOfLand", creatable: true, defaultValue: "In level with road", cell: "C38" },
  { key: "roadFacilities", label: "Road facilities", group: "roadFacilities", creatable: true, defaultValue: "Available", cell: "C39" },
  { key: "positiveFactors", label: "Positive factors affecting rates of property", defaultValue: "None", cell: "C41" },
  { key: "negativeFactors", label: "Negative factors affecting rates of property", defaultValue: "None", cell: "C42" },
  { key: "marketability", label: "How is marketability of property", group: "marketability", creatable: true, defaultValue: "O.K.", cell: "C43" },
  { key: "floodingProne", label: "Locality subject to frequent flooding?", group: "floodingProne", creatable: true, defaultValue: "N.A.", cell: "C44" },
  {
    key: "knownDispute",
    label: "Any known dispute in regard to the property",
    group: "knownDispute",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C45",
  },
  {
    key: "landAcquisitionRoadWidening",
    label: "Land situated in an area where road-widening acquisition is evident",
    group: "landAcquisitionRoadWidening",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C46",
  },
  { key: "plotShape", label: "Shape of plot", group: "plotShape", creatable: true, defaultValue: "N.A.", cell: "C47" },
  {
    key: "townPlanningScheme",
    label: "Falls under any Town Planning / development scheme?",
    group: "townPlanningScheme",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C49",
  },
  {
    key: "agriculturalConversion",
    label: "Conversion to house-site plots contemplated (if agricultural land)",
    group: "agriculturalConversion",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C50",
  },
  {
    key: "developmentContribution",
    label: "Contribution made, or demand outstanding, towards development",
    group: "developmentContribution",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C51",
  },
  {
    key: "noticedForAcquisition",
    label: "Notified for acquisition by Govt. or any statutory body",
    group: "noticedForAcquisition",
    creatable: true,
    defaultValue: "None",
    cell: "C52",
  },
  {
    key: "buildingInsured",
    label: "Is the building insured — policy no., amount, annual premium",
    defaultValue: "No details available.",
    cell: "C53",
  },
  {
    key: "standardRentFixed",
    label: "Standard rent fixed for the premises under any law",
    group: "standardRentFixed",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C54",
  },
  {
    key: "possessionWithoutLitigation",
    label: "Bank can take possession without litigation",
    group: "possessionWithoutLitigation",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C55",
  },
  {
    key: "salesInstances",
    label: "Instances of sales of IPs in the locality",
    defaultValue: "No such instance has been noticed.",
    cell: "C56",
  },
  {
    key: "rateBasis",
    label: "Basis of arriving at the land rate, if no sales instances relied on",
    defaultValue: "Rates have been arrived at on the basis of market survey.",
    cell: "C57",
  },
  {
    key: "govtEnactments",
    label: "Covered under State/Central Govt. enactments (e.g. Urban Land Ceiling Act)",
    group: "govtEnactments",
    creatable: true,
    defaultValue: "N.A.",
    cell: "C58",
  },
  // Clauses 21.1-21.3 of the issued report. The bank asks for these three
  // explicitly and they have no cell in the workbook — the valuer used to type
  // them straight into the document.
  {
    key: "waqfOrTrustProperty",
    label: "Does the property belong to a Waqf / Temple Trust",
    group: "boundariesMatching",
    creatable: true,
    defaultValue: "None",
  },
  {
    key: "proximityToHazards",
    label: "Near a highway, under an HT line, or adjoining a railway track or cemetery",
    defaultValue: "None",
  },
  {
    key: "landCondition",
    label: "Is the land swampy, marshy, reclaimed or garden land",
    group: "boundariesMatching",
    creatable: true,
    defaultValue: "No",
  },
];

/**
 * M-Gen rows 60-65 — the sheet's own "Facilities for Flats/Multistorey" box.
 * Defaults match that box's own filled-out example exactly, not just N.A.
 */
export const FACILITIES_FIELDS: FieldDef[] = [
  { key: "facilitiesAvailable", label: "Facilities available", defaultValue: "Common parking", cell: "C60" },
  {
    key: "protectedWaterSupply",
    label: "Protected water supply",
    group: "protectedWaterSupply",
    creatable: true,
    defaultValue: "Yes",
    cell: "C61",
  },
  {
    key: "carParking",
    label: "Car parking — open / covered",
    group: "carParking",
    creatable: true,
    defaultValue: "Open",
    cell: "C62",
  },
  {
    key: "compoundWallExisting",
    label: "Is compound wall existing?",
    group: "compoundWallExisting",
    creatable: true,
    defaultValue: "None",
    cell: "C63",
  },
  {
    key: "pavementLaid",
    label: "Is pavement laid around the building?",
    group: "pavementLaid",
    creatable: true,
    defaultValue: "Yes",
    cell: "C64",
  },
  {
    key: "powerSupply",
    label: "Power supply available on site",
    defaultValue: "Yes, power supply is available on site",
    cell: "C65",
  },
];

export const GENERAL_FIELDS: FieldDef[] = [
  ...APPROVAL_FIELDS,
  ...OCCUPANCY_FIELDS,
  ...LOCATION_FIELDS,
  ...DEVELOPMENT_FIELDS,
  ...FACILITIES_FIELDS,
];
