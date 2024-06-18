document.addEventListener('DOMContentLoaded', function () {
    var starfield = document.getElementById('starfield');
    for (var i = 0; i < 150; i++) {
      var star = document.createElement('div');
      star.className = 'star';
      star.style.width = (Math.random() * 2 + 1) + 'px';
      star.style.left = (Math.random() * window.innerWidth) + 'px';
      star.style.top = (-Math.random() * 100) + 'px';
      star.style.animationDelay = (Math.random() * 5) + 's';
      star.style.animationDuration = (Math.random() * 3 + 2) + 's';
      starfield.appendChild(star);
    }
  });
  