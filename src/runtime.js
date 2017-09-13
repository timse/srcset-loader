export function buildSrcSet(img) {
  const sources = img.sources || img;
  const widths = Object.keys(sources);

  return widths.map((width) => {
    if (width === 'default') {
      return sources[width];
    }

    return `${sources[width]} ${width}`;
  }).join(',');
}

export function blurPlaceholder(img, toBase64) {
  const placeholder = img.placeholder || img;
  const ratio = placeholder.ratio;

  const svg = `
<svg 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 ${10 * ratio} 10"
>
  <filter id="x">
    <feGaussianBlur stdDeviation="1" />
  </filter>
  <image
    width="100%" 
    height="100%"  
    xlink:href="${placeholder.url}" 
    filter="url(#x)"
  />
</svg>
  `;

  return `data:image/svg+xml;base64,${(toBase64 || btoa)(svg)}`; // eslint-disable-line no-undef
}
