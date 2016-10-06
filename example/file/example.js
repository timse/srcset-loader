var whale = require('../whale.jpeg?srcset&sizes[]=200w&sizes[]=800w');
var paris = require('../paris.jpeg?srcset&sizes[]=200w&sizes[]=800w');

[whale, paris].forEach((src) => {
  const image = new Image();
  image.srcset = src.srcSet;
  image.src = src.sources['800w'];
  image.sizes = '(min-width: 1000px) 500px, 200px';
  image.style = 'width: 100%';
  document.body.appendChild(image);
});

var normalWhale = require('../whale.jpeg');
var normalParis = require('../paris.jpeg');

[normalWhale, normalParis].forEach((src) => {
  const image = new Image();
  image.src = src
  image.style = 'width: 100%';
  document.body.appendChild(image);
});