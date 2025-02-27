# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.1.0](https://github.com/battis/partly-gcloudy/compare/v1.0.2...v1.1.0) (2025-02-27)


### Features

* add active `deployment` to result of `batch.appEnginePublish()` ([7962de8](https://github.com/battis/partly-gcloudy/commit/7962de875e3b99d1efb6028258ef32feca2c710a))
* publish on `batch.appEngineDeployAndCleanup()` if no active project ([a012993](https://github.com/battis/partly-gcloudy/commit/a01299373308912d6f2b3898484a4182f5cb2d07))

## [1.0.2](https://github.com/battis/partly-gcloudy/compare/v1.0.1...v1.0.2) (2025-02-23)


### Bug Fixes

* bump qui-cli to 2.x ([52cdd48](https://github.com/battis/partly-gcloudy/commit/52cdd48c353ff8b2c30e97f658c49236063137dd))
* need to await qui-cli register ([97e0393](https://github.com/battis/partly-gcloudy/commit/97e03935ebab6120e1b4edbd5232e8f13c884915))

## [1.0.1](https://github.com/battis/partly-gcloudy/compare/v1.0.0...v1.0.1) (2025-02-22)


### Bug Fixes

* mop up missed direct qui-cli dependency ([2f6aad2](https://github.com/battis/partly-gcloudy/commit/2f6aad2ac1cd828c554eeeba4249d8169e6f4623))

## [1.0.0](https://github.com/battis/partly-gcloudy/compare/v0.6.9...v1.0.0) (2025-02-22)


### Bug Fixes

* export gcloud as default ([3b09ba1](https://github.com/battis/partly-gcloudy/commit/3b09ba1457997996bebfec7c0099ef5ec546fcb2))
* qui-cli plugins as peers ([af030a8](https://github.com/battis/partly-gcloudy/commit/af030a884dfdc2a2dfb0c7c93f03a4e3d56a376e))

## [0.6.9](https://github.com/battis/partly-gcloudy/compare/v0.6.8...v0.6.9) (2025-02-09)


### Bug Fixes

* bump qui-cli to finally resolve .env loading issues ([d0df2b0](https://github.com/battis/partly-gcloudy/commit/d0df2b03ab66aacb4b4fdb3d168c13d4e59fe1d4))

## [0.6.8](https://github.com/battis/partly-gcloudy/compare/v0.6.7...v0.6.8) (2025-02-09)


### Bug Fixes

* bump qui-cli to re-re-re-fix appRoot() ([8e4293d](https://github.com/battis/partly-gcloudy/commit/8e4293daa8c26fbabec28d06d06384be808ede4f))

## [0.6.7](https://github.com/battis/partly-gcloudy/compare/v0.6.6...v0.6.7) (2025-02-09)


### Bug Fixes

* bump qui-cli peer to fix env appRoot caching ([e4cb67d](https://github.com/battis/partly-gcloudy/commit/e4cb67d42b9a486f2ccde92d6e59840bbb772399))

## [0.6.6](https://github.com/battis/partly-gcloudy/compare/v0.6.5...v0.6.6) (2025-02-09)


### Bug Fixes

* keep up qui-cli appRoot() changes ([5d7a480](https://github.com/battis/partly-gcloudy/commit/5d7a48055ced95f0c4f736b19ab299485a765fe2))

## [0.6.5](https://github.com/battis/partly-gcloudy/compare/v0.6.4...v0.6.5) (2025-02-09)


### Bug Fixes

* bump qui-cli to allow setting app root ([6ea63e3](https://github.com/battis/partly-gcloudy/commit/6ea63e34f3cd54e1922bdcf272d7f53df38b7838))

## [0.6.4](https://github.com/battis/partly-gcloudy/compare/v0.6.3...v0.6.4) (2025-02-09)


### Features

* restructure as qui-cli plugin ([dddb374](https://github.com/battis/partly-gcloudy/commit/dddb374e480dfd87d5f91650bbe7cca12d37b43e))

## [0.6.3](https://github.com/battis/partly-gcloudy/compare/v0.6.2...v0.6.3) (2025-02-04)


### Bug Fixes

* restore default export ([6415f71](https://github.com/battis/partly-gcloudy/commit/6415f718706b5dcc335382ff5bdc585b16f0a84a))

## [0.6.2](https://github.com/battis/partly-gcloudy/compare/v0.6.1...v0.6.2) (2025-02-04)

## [0.6.1](https://github.com/battis/partly-gcloudy/compare/v0.6.0...v0.6.1) (2025-02-04)

## 0.6.0

### Minor Changes

- 8f99c59: tweak build architecture

## 0.5.2

### Patch Changes

- f64f4c8: fix set secrets trailing }

## 0.5.1

### Patch Changes

- e6dfd1a: whoa, bucko

## 0.5.0

### Minor Changes

- 2395e69: gcloud.secrets.versions

  - Added `gcloud.secrets.versions` vocabulary (partial)
  - Added `retain` parameter to `gcloud.secrets.set()` to determine how many secret versions should be retained after setting the new value (default is all, suggested value is 1)

## 0.4.5

### Patch Changes

- 6d8f219: fix iam service-accounts project interpolation

## 0.4.4

### Patch Changes

- faster service enables

## 0.4.3

### Patch Changes

- Fixed IAP

## 0.4.2

### Patch Changes

- 12abbf0: Temporary fix for billing bug
