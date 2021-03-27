# coverage-badge

Generate a coverage badge from a github status.

[![Coverage](https://coverage-badge.samuelcolvin.workers.dev/samuelcolvin/pydantic.svg)](https://github.com/samuelcolvin/coverage-badge)

_(This is the actual coverage badge from [pydantic](https://github.com/samuelcolvin/pydantic))_

## Badge Usage

```
https://coverage-badge.samuelcolvin.workers.dev/samuelcolvin/pydantic.svg
```

Repo `owner` and `repo` are taken from the URL path.

The following `GET` arguments are used to find the status to extract coverage from:
* `branch` - defaults to `master`, the git ref to lookup
* `match` - defaults to `^coverage`, case-insensitive regex to use when finding the status description to extract
  coverage from

Once the status has been found, the coverage figure is extracted from its `description` field, and used in the
SVG image returned.

A summary of how the SVG coverage was found can be seen by found in a comment at the end of the SVG file.

## Redirect Usage

You can also use this service as the link for badges as shown above, the following endpoint will
redirect to the `target_url` of the status used to generate the equivilant badge:

```
https://coverage-badge.samuelcolvin.workers.dev/redirct/samuelcolvin
```
