# coverage-badge

Generate a coverage badge from a github status.

[![Coverage](https://coverage-badge.samuelcolvin.workers.dev/samuelcolvin/pydantic.svg)](https://github.com/samuelcolvin/coverage-badge)

_(This is the actual coverage badge from [pydantic](https://github.com/samuelcolvin/pydantic))_

## Usage

```
https://coverage-badge.samuelcolvin.workers.dev/samuelcolvin/pydantic.svg
```

The `owner` and `repo` name are taken from the URL path. In additional, the following `GET` arguments 
are used to find the status to extract coverage from:
* `branch` - defaults to `master`, the git ref to lookup
* `context` - defaults to `smokeshow`, the `context` of the status to look for

Once the status has been found, the coverage figure is extracted from its `description` field, and used in the
SVG image returned.
