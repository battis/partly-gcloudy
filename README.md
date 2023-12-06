# @battis/partly-gcloudy

Idiosyncratic collection of interactions with `gcloud` CLI tool

[![npm version](https://badge.fury.io/js/@battis%2Fpartly-gcloudy.svg)](https://badge.fury.io/js/@battis%2Fpartly-gcloudy)
[![Module type: ESM](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://nodejs.org/api/esm.html)

## Install

`npm i @battis/partly-gcloudy`

## Usage

This is an ESM module that depends on other ESM modules, and so really can only feasibly be imported by ESM modules.

```js
import gcloud from '@battis/partly-gcloudy';
await gcloud.init();
await gcloud.app.deploy();
```

## Design

This is really designed to meet my needs (type-safe, fat-finger-preventative, repetitive interactions with Google Cloud). There are a few basic principles:

- Property names match up with the `gcloud` CLI verbs.
  `gcloud projects describe` becomes `gcloud.projects.describe()`
- Method parameters are the names used in the corresponding `gcloud` CLI tool documentation, camelCased.
  `gcloud projects describe PROJECT_ID_OR_NUMBER` becomes
  `gcloud.projects.describe({ projectId: 'flim-flam-1234' })`
- Methods are typed to hint their parameters, which are passed as object arguments to facilitate hyper-aggressive type-checking in a loosey-goosey manner. Argument order is too much to worry about.
  `gcloud.projects.describe({ projectId: 'flim-flam-1234' })`
- Methods are information-agnostic -- if you don't pass some or all of the arguments, they'll interactively ask the user for what they need.
  `gcloud.projects.create()` works. If it really can't be done, it will fail with a demonstrative error.
- All "verb" methods are asynchronous.
- All input is validated to the extent possible.

#### `gcloud.*.input*()` and `gcloud.*.select*()`

Where user input may be required (or validated) the different types of input relevant to a `gcloud` verb are grouped within the property.

```js
let projectId = '_$argle-bargle';
projectId = await gcloud.projects.inputProjectId({ projectId });
```

The initial `projectId` value is invalid, will fail the validation, and result in interactive user-input to choose a valid project ID.

## Batch operations

As I need them, I am packaging up modular batches of operations in the `gcloud.batch` namespace.

```js
import gcloud from '@battis/partly-gcloudy';
await gcloud.batch.appEnginePublish();
```

This will create a Google Cloud project (or reuse an existing one, if you enter an existing project ID or have your environment variable `PROJECT` set), configure an App Engine Instance in that project, if necessary, and deploy the current project to that App Engine instance.
