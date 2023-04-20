# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - (2023-04-20)

### Changed

- Updated license copyright to be in line with SaaSquatch open-source policy.

## [1.3.0] - (2022-09-13)

### Added

- Added Gherkin JSON types to library exports so they can be consumed by other code

### Changed

- Changed Gherkin parser from `gherkin` to `@cucumber/gherkin`
- Enabled NodeJS sourcemaps for CLI executable
- Updated license copyright years
- Upgraded to NodeJS 16
- Improved error messages while parsing feature files

### Removed

- Removed TypeScript `preprocessor.js`

## [1.2.1] - (2021-05-27)

### Changed

- Greatly improved line spacing and indentation in LaTeX output to make editing the
  output by hand easier
- Added aliases for common LaTeX commands to make the output size smaller and improve
  editing by hand

## [1.2.0] - (2021-05-25)

### Added

- Added support for generating LaTeX documents out of Gherkin specs

### Removed

- Removed `Unreleased` section from CHANGELOG.md

## [1.1.2] - (2021-05-24)

### Added

- Added README installation instructions, usage, and examples

### Fixed

- Fix crash caused by duplicate sheet slug names

### Security

- Updated package versions to resolve CVEs

## [1.1.1] - (2020-02-20)

### Added

- Add location data to JSON type definitions

## [1.1.0] - (2020-02-20)

### Added

- Add location data for feature elements to JSON output

## [1.0.0] - (2019-12-03)

### Added

- Initial release

[1.3.1]: https://github.com/saasquatch/picklesdoc/compare/v1.2.1...v1.3.1
[1.3.0]: https://github.com/saasquatch/picklesdoc/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/saasquatch/picklesdoc/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/saasquatch/picklesdoc/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/saasquatch/picklesdoc/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/saasquatch/picklesdoc/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/saasquatch/picklesdoc/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/saasquatch/picklesdoc/releases/tag/v1.0.0
