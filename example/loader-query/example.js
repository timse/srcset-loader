var whale = require('../whale.jpeg');
var paris = require('../paris.jpeg');

// loaded via srcset loader as specified in the webpack config
const whaleImage = new Image();
whaleImage.srcset = whale.srcSet;
whaleImage.src = whale.sources['800w'];
whaleImage.sizes = '(min-width: 1000px) 500px, 200px';
whaleImage.style = 'width: auto';
document.body.appendChild(whaleImage);

// loaded like a normal image
const parisImage = new Image();
parisImage.src = paris;
parisImage.style = 'width: 100%';
document.body.appendChild(parisImage);