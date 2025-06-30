# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.2.1](https://github.com/battis/partly-gcloudy/compare/v1.2.0...v1.2.1) (2025-06-30)

## [1.2.0](https://github.com/battis/partly-gcloudy/compare/v1.1.5...v1.2.0) (2025-06-18)


### Features

* simplified plugin use ([5688c76](https://github.com/battis/partly-gcloudy/commit/5688c76c4d54017c135ece147d150640e6e1f21f))
* update service list ([8e362b9](https://github.com/battis/partly-gcloudy/commit/8e362b9e57c4a868477e9de9d677b6001baabd41))
* update to rword@4 ([3392588](https://github.com/battis/partly-gcloudy/commit/3392588b35d250f5ddeaebbb678ccf5a6f410000))


### Bug Fixes

* remove extraneous output from gcloud.batch.appEnginePublish ([53191de](https://github.com/battis/partly-gcloudy/commit/53191de4231f3d23e99694ae664d10a8f60d1fef))

## [1.1.5](https://github.com/battis/partly-gcloudy/compare/v1.1.4...v1.1.5) (2025-04-19)

## [1.1.4](https://github.com/battis/partly-gcloudy/compare/v1.1.3...v1.1.4) (2025-04-18)


### Bug Fixes

* ensure that gcloud is ready before being invoked ([4b9273d](https://github.com/battis/partly-gcloudy/commit/4b9273d1601c3a45c7fd43e506f750c418f9661b))
* remove redundant tests for readiness ([af4ff13](https://github.com/battis/partly-gcloudy/commit/af4ff13e40a5441a89ed3b8cdbdb7d5d8a1b4ce4))

## [1.1.3](https://github.com/battis/partly-gcloudy/compare/v1.1.1...v1.1.3) (2025-04-18)


### Bug Fixes

* return project, appEngine, deployment from appEngineDeployAndCleanup() as expected ([b9eb10e](https://github.com/battis/partly-gcloudy/commit/b9eb10ea6dd1eaef0fc0dbe6e63d95d36b521261))

## [1.1.2](https://github.com/battis/partly-gcloudy/compare/v1.1.1...v1.1.2) (2025-04-18)

## [1.1.1](https://github.com/battis/partly-gcloudy/compare/v1.1.0...v1.1.1) (2025-04-17)


### Bug Fixes

* appEngineDeployAndCleanUp() and appEnginePublish() should succeed on first attempt ([be15c74](https://github.com/battis/partly-gcloudy/commit/be15c74384acea10b792a9fd10918bbaeaf99488)), closes [#42](https://github.com/battis/partly-gcloudy/issues/42)
* update API names ([26fd87a](https://github.com/battis/partly-gcloudy/commit/26fd87a2991786bb5d64a6979c6906011d7a8ed1))

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
