import whale from '../whale.jpeg?sizes=200w+800w';

// alternative syntax
import paris from '../paris.jpeg?sizes[]=200w&sizes[]=800w';

[whale, paris].forEach((src) => {
  const image = new Image();
  image.srcset = src.srcSet;
  image.src = src.sources['800w'];
  image.sizes = '(min-width: 1000px) 800px, 200px';
  image.style = 'width: 100%';
  document.body.appendChild(image);
});
