# Changelog

## v2.0.0

- Updated to webpack 2.
- `placeholder` can now be used even if sizes is not specified.
  The original image will be returned along with the placeholder.
- `placeholder` now accepts the width of the placeholder as a parameter.
- `sizes` now accepts `"default"` as a possible value, which adds the original image to the list of sources.
- Added a check to prevents using the pixel density descriptor format \\d+x (ex: 2x) as a size, 
  which before now would have returned a picture with a width of 2px.
- Added a new `lightweight` option, which disables generating the data that can be computed at runtime:
    - `out.srcSet` is removed from the output as it can be computed using `out.sources`
    - `out.placeholder` does not return an SVG anymore, only the raw image in base64.
    - Utilities are available in `srcset-loader/runtime` to generate both the srcSet string and the svg.
- `placeholder.color` now returns the alpha channel as a float instead of an int.
