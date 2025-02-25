import barba from '@barba/core';

document.addEventListener('DOMContentLoaded', function() {
  barba.init({
    transitions: [{
      name: 'fade-slide',
      leave(data) {
        const gallery = data.current.container.querySelector('#projectsGallery');
        if (gallery) {
          // Slide gallery out to the left
          return gsap.to(gallery, {
            x: -100,
            opacity: 0,
            duration: 0.3,
          });
        }
        // Default fade-out animation for pages without projects gallery
        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.3
        });
      },
      enter(data) {
        // Check for projects gallery element
        const gallery = data.next.container.querySelector('#projectsGallery');
        if (gallery) {
          // Slide gallery into place from right with a delay
          return gsap.from(gallery, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            delay: 0.2 // Add a delay of 0.2 seconds
          });
        }
        // Default fade-in animation for pages without projects gallery
        return gsap.from(data.next.container, {
          opacity: 0,
          duration: 0.3
        });
      }
    }]
  });
});
