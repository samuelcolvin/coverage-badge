# coverage-badge

Generate a coverage badge from a GitHub status.

[![Coverage](https://coverage-badge.samuelcolvin.workers.dev/pydantic/pydantic.svg)](https://coverage-badge.samuelcolvin.workers.dev/redirct/pydantic/pydantic)

_(This is the actual coverage badge from [pydantic](https://github.com/pydantic/pydantic))_

## Badge Usage

```
https://coverage-badge.samuelcolvin.workers.dev/pydantic/pydantic.svg
```

Repo `owner` and `repo` are taken from the URL path.

The following `GET` arguments are used to find the status to extract coverage from:
* `match` - defaults to `^coverage`, case-insensitive regex to use when finding the status description to extract
  coverage from

Once the status has been found, the coverage figure is extracted from its `description` field, and used in the
SVG image returned.

A summary of how the SVG coverage was determined can be found in a comment at the end of the SVG file.

## Redirect Usage

You can also use this service as the link for badges as shown above, the following endpoint will
redirect to the `target_url` of the status used to generate the equivalent badge:

```
https://coverage-badge.samuelcolvin.workers.dev/redirect/pydantic/pydantic
```
