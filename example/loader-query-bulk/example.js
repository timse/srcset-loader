function getImage(image) {
  return require('./images/' + image);
}

// loaded via srcset loader as specified in the webpack config
['whale.jpeg', 'paris.jpeg'].map(img => getImage(img)).forEach((src) => {
  const image = new Image();
  image.srcset = src.srcSet;
  image.src = src.sources['800w'];
  image.sizes = '(min-width: 1000px) 500px, 200px';
  image.style = 'width: auto';
  document.body.appendChild(image);
});

const whale = require('../whale.jpeg');
const paris = require('../paris.jpeg');

// just normal images as they are not in `/images/`
[whale, paris].forEach((src) => {
  const image = new Image();
  image.src = src;
  image.style = 'width: 100%';
  document.body.appendChild(image);
});
