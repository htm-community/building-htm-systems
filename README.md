### Supporting code for:

# Building HTM Systems

This is the JavaScript source code for [buildinghtm.systems](http://buildinghtm.systems).

This uses `webpack` to deploy custom visualization libraries for displaying HTM systems.

## HTM Reference Implementation

The HTM system running these visualization is called [simplehtm](https://github.com/htm-community/simplehtm).

## Widgets

These are used in the website as interactive examples. They are separated by URL/folder. Each folder has one page of
widgets, so they get built / tested in a page environment the same way they will be displayed.

Widget binaries are constructed by webpack and chucked into URL/folder. Their source code is in `src/widgets`

### Building Widgets:

Widgets are bundled for deployment as a page. A page can have many widgets that interact with each other. They are built and tested with this in mind. Webpack is used to build bundles for specific targets. To build all webpack targets:

    npm start

### Wordpress Deployment

Webpack is currently configured to deploy to the `wp-content` folder with the same tree structure expected by Wordpress. This makes it easy to create compiled JS files and upload them to Wordpress for embedding into various pages.

## Demo / Test

See [widgets.html](./widgets.html) for examples.
