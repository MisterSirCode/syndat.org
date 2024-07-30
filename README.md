<p align="center">
  <img src="./public/content/icons/large_graphic.png" />
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