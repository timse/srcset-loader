var whale = require('../whale.jpeg?sizes=200w+800w');
var paris = require('../paris.jpeg?sizes=200w+800w');

function createDivWithClass(className) {
  const div = document.createElement('div');
  div.className = className;
  return div;
}

function createPlaceholder(src, placeholderOptions) {
  const wrapper = createDivWithClass('wrapper');
  const ratioPlaceholder = createDivWithClass('');
  ratioPlaceholder.style.setProperty('padding-bottom', src.placeholder.ratio * 100 + '%');
  
  const imageWrapper = createDivWithClass('image-wrapper');
  
  const placeholderImage = new Image();
  placeholderImage.className = 'image placeholder'
  if (placeholderOptions.image) {
    placeholderImage.src = src.placeholder.url;
  }
  if (placeholderOptions.color) {
    placeholderImage.style.setProperty('background-color', 'rgba(' + src.placeholder.color.join(',') + ')');
  }

  const image = new Image();
  image.className = 'image fullsize' 
  image.srcset = src.srcSet;
  image.src = src.sources['800w'];
  image.sizes = '(min-width: 1000px) 500px, 200px';
  image.onload = function(){
    image.style.setProperty('visibility', 'visible');
    image.style.setProperty('opacity', '1');
    placeholderImage.style.setProperty('visibility', 'hidden');
    placeholderImage.style.setProperty('opacity', '0');
  }

  imageWrapper.appendChild(placeholderImage);
  imageWrapper.appendChild(image);

  wrapper.appendChild(ratioPlaceholder);
  wrapper.appendChild(imageWrapper);

  return wrapper;
}

[whale, paris].forEach((src) => {
  // just color
  const color = createPlaceholder(src, {color: true});
  document.querySelector('#color').appendChild(color);

  // just image
  const image = createPlaceholder(src, {image: true});
  document.querySelector('#image').appendChild(image);

  // image and color-fallback
  const fallback = createPlaceholder(src, {image: true, color: true});
  document.querySelector('#fallback').appendChild(fallback);
});