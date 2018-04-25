### Supporting code for:

# Building HTM Systems

See website at [buildinghtm.systems](http://buildinghtm.systems) for now. This is a work in progress. Very early stages.

This uses webpack to package some custom visualization libraries we uses for displaying HTM systems. It packages up binaries in bundles for use on the website above, to show interactive widgets.

## Reference Implementation

The HTM system running these visualization is called [simplehtm](https://github.com/htm-community/simplehtm).

## Widgets

These are used in the website as interactive examples. They are separated by URL/folder. Each folder has one page of
widgets, so they get build / tested in a page environment the same way they will be displayed.

Widget binaries are constructed by webpack and chucked into URL/folder.

### Building widgets:

    npm start

Webpack bundles go into `docs` for easy deployment on push to github-pages.

