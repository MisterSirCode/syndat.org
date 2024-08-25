<p align="center">
  <img src="./public/content/icons/large_graphic.png" />
  <h1>A Material Science Database</h1>
</p>

A work in progress pairing to Mindat.org, but for material science / synthesis in-general

## How to use
If you want to contribute or test things on your own, you can fork the repository and run the various commands below in the root of the project:

* `generate` - Automatically generates all pages for materials / synthesis
* `genmats` - Only regenerates material pages
* `gensyns` - Only regenerates synthesis pages

`deploy` - Deploys the site to firebase (Only for my use. It won't do anything)

## How to edit constant info
The main "database" is stored in two json files:

* [data/json/materials.json](data/json/materials.json)
* [data/json/synthesis.json](data/json/synthesis.json)

Editing these and running the `generate` command will update the pages with any changes.

## API Structure and Specialty Values

### Material API

This embed will explain how everything works:
```javascript
{
    // Next Available ID. Used as reference to know when it was created / Which came before and after it.
    // If there are 30 materials in the api, then the highest ID is 29. Next ID will be 30.
    // This is because it starts at 0. 0 being corundum, the first material.
    "id": #, 
    "label": "Display Name",
    "aliases": "Trade Name, Historical Name, or Variety Name",
    "desc": "This is a long article displayed in the page.",
    // Synthesis IDs coorespond to types in Synthesis.json
    "synthesis": ["czok", "vern"],
    // Chemical and Physical properties
    "chem_prop": {
        "chemical": "Chemical Name Here",
        // Formula Example: Al2O3 = Al_2_O_3_
        "formula": "Element _Subscript_ Spaces",
        // Mohs Hardness. All min/max values share properties.
        // Make both the same value to display it singular.
        // Different values will display a range on the site.
        // Values that support "?" are always used if expected.
        // The question mark denotes that it's needed but not known.
        "mohs_min": "?" or #,
        "mohs_max": "?" or #,
        // Specific Gravity.
        "grav_min": "?" or #,
        "grav_max": "?" or #,
        // Use melting point or decomposition point.. Not both.
        // Exclude if not known. Only use celcius.
        "melt_pnt": #,
        "decp_pnt": #,
    },
    // Optical Properties.
    // You may remove all properties and input "opt": "opaque"
    // if the material is opaque in the visible spectrum.
    "optic_prop": {
        // Optical Type. Related to Crystal System
        "type": "Uniaxial (+ or - or ?), Isometric, Biaxial, etc",
        // Refractive index.
        // Use arrays for non-isometric materials with axis-specific RIs
        // For unixial and co. [x, y] coorespond to [nω, nε] // Ordinary and Extraordinary
        // For biaxial and co. [x, y, z] coorespond to [nα, nβ, nγ] // Alpha Beta Gamma
        "ref_min": "?" or # or [#, #] or [#, #, #],
        "ref_max": "?" or # or [#, #] or [#, #, #],
        // Dispersion Factor.
        "disp_min": "?" or #,
        "disp_max": "?" or #,
        // Birefringence Factor. Exclude for Isometric materials.
        "bir_min": "?" or #,
        "bir_max": "?" or #
    },
    // Crystal Properties.
    "cry_prop": {
        // Crystal System. Related to Optical Type.
        "system": "Isotropic, Hexagonal, Orthrombic, etc",
        // ONLY FOR MINERALOGICAL MATERIALS.
        // Use if mineral species has a parent group / series / etc
        "parent": "Example Mineral Group"
    },
    // Additional Properties of Significance.
    // Use Single Values or Arrays.
    // OPTIONAL.
    "add_prop": [
        "Piezoelectric",
        "Pyroelectric",
        "Paramagnetic",
        // Can use tiny description or values for arrays.
        ["Fluorescent", "Blue (XRay-UVB)"] 
    ],
    // Mindat minID. ONLY USE FOR MINERALOGICAL MATERIALS.
    // This will change the page slightly.
    // Also creates a link to the mindat page of that ID.
    "minID": ####,
    // Neutral Variant / Default Material State. Optional if not known.
    "neutral": {
        // All properties below are optional. 
        "color": "Colorless", // Material Color
        "fluor": "Red (UVC)", // Fluorescence (NOT doped)
        // Only use if a `neut.jpg` exists in the material's content folder.
        "imgsrc": "Persons Name, URL" or "Unknown"
    },
    // All doped Variants / Colors. Optional if not known.
    // Similar structure to neutral... just as an array of them.
    // VARIANTS ARE ORDER DEPENDANT. ALWAYS ADD NEW ONES AT THE END!
    "variants": [
        {
            // Label must be a trade or industry name... Or Mineral Variety...
            // Or an otherwise important label for the variant.
            // All properties below are optional.
            "label": "Variant One",
            "color": "Red", // Material Color
            "fluor": "Blue (UVA-UVB)", // Fluorescence
            // Cause is the direct reason the variant exists / differs.
            "cause": "<Element> Ions, Vacancies, Inclusions, etc",
            // Include Effect only if its significant.
            "effect": "Asterism, Pleochroism, etc",
            // Significant Industrial Use.
            "usage": "Specialty Lasers",
            // Only use if a `var#.jpg` exists in the material's content folder.
            // `var#.jpg` cooresponds to this variant's position in the array.
            // Since this is the first variant, itd be `var0.jpg`
            "imgsrc": "Persons Name, URL" or "Unknown"
        }
    ]
}