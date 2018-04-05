### Supporting code for:

# Building HTM Systems

See website at [htmtheory.org](http://htmtheory.org) for now. This is a work in progress. Very early stages.

This uses webpack to package some custom visualization libraries we uses for displaying HTM systems. It packages up binaries in bundles for use on the website above, to show interactive widgets.

## Widgets

These are used in the website as interactive examples. They are separated by URL/folder. Each folder has one page of
widgets, so they get build / tested in a page environment the same way they will be displayed.

Widget binaries are constructed by webpack and chucked into URL/folder.

### Building widgets:

    npm run build

See `out` folders in widget subdirectories.

## HTM Example Code

coming soon...

