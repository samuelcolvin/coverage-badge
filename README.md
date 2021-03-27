# coverage-badge

Generate a coverage badge from a github status.

## Usage

```
https://coverage-badge.samuelcolvin.workers.dev/badge.svg?owner=samuelcolvin&repo=smokeshow
```

The following get arguments are used to find the status to extract coverage from:
* `owner` - the owner of the github repo
* `repo` - the github repo name
* `branch` - defaults to `master`, the git ref to lookup
* `context` - defaults to `smokeshow`, the `context` of the status to look for

Once the status has been found, the coverage figure is extracted from its `description` field, and used in the
SVG image returned.
