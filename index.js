const loaderUtils = require('loader-utils');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

function removeResourceQuery(resource) {
  return resource.split('?')[0];
}

function splitRemainingRequest(remainingRequest) {
  const split = remainingRequest.split('!');
  const rawResource = split.pop();
  const resource = removeResourceQuery(rawResource);
  return [split, resource];
}

function rebuildRemainingRequest(loaders, resizeLoader, resource) {
  return '-!' + [...loaders, resizeLoader, resource].join('!');
}

function buildResizeLoader(rawSize) {
  const size = parseInt(rawSize);
  return url.format({
    pathname: path.join(__dirname, './resize'),
    search: querystring.stringify({size}),
  });
}

function createRequest(size, loaders, resource) {
  const resizeLoader = buildResizeLoader(size);
  const remainingRequest = rebuildRemainingRequest(loaders, resizeLoader, resource);
  return `require(${JSON.stringify(remainingRequest)})`;
}

function buildSources(sizes, loaders, resource) {
  return sizes.reduce((queryObject, size) => {
    queryObject[size] = createRequest(size, loaders, resource);
    return queryObject;
  }, {});
}

function stringifySources(sources) {
  return `
{
  ${Object.keys(sources).map((source) => {
    return `"${source}": ${sources[source]}`
  }).join(',\n')}
}
`;
}

function stringifySrcSet(sources) {
  return Object.keys(sources).map((size) => {
    return `${sources[size]} + " ${size}"`
  }).join('+","+');
}

function extractSizeFromQuery(queryString) {
  const query = loaderUtils.parseQuery(queryString);
  if (!query.sizes) {
    return null;
  }

  if (Array.isArray(query.sizes)) {
    return query.sizes;
  }

  return query.sizes.split('+');
}

function getSizes(resourceQuery, loaderQuery) {
  resourceSize = extractSizeFromQuery(resourceQuery);
  if (resourceSize) {
    return resourceSize;
  }

  return extractSizeFromQuery(loaderQuery);
}

module.exports = function(content){
  return content;
};

module.exports.pitch = function(remainingRequest) {
  const sizes = getSizes(this.resourceQuery, this.query);
  if (!sizes) {
    console.error('no sizes specified, skipping...');
    return;
  }

  const [loaders, resource] = splitRemainingRequest(remainingRequest);
  
  const sources = buildSources(sizes, loaders, resource);
  const exportSources = stringifySources(sources);
  const exportSrcSet = stringifySrcSet(sources);
  return `
module.exports = {
  sources: ${exportSources},
  srcSet: ${exportSrcSet}
}
`;
}
