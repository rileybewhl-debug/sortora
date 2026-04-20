/* ═══════════════════════════════════════════════════════
   Sortora motion controller
   - Handles both .reveal (legacy) and [data-reveal] (new) elements
   - IntersectionObserver-based reveals (fires once per element)
   - Count-up animations for numbers
   - Word-by-word text reveals for .text-reveal elements
   - Honors prefers-reduced-motion
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If user prefers reduced motion, reveal everything immediately
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .text-grow, .word-reveal').forEach(function(el) {
      el.classList.add('visible');
    });
    document.querySelectorAll('[data-reveal], .text-reveal').forEach(function(el) {
      el.classList.add('is-revealed');
    });
    document.querySelectorAll('[data-count-up]').forEach(function(el) {
      var target = el.getAttribute('data-count-up');
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      el.textContent = prefix + target + suffix;
    });
    return;
  }

  // ═══ Reveal observer (fires once per element) ═══
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        // Handle legacy .reveal / .text-grow / .word-reveal classes
        if (entry.target.classList.contains('reveal') ||
            entry.target.classList.contains('reveal-left') ||
            entry.target.classList.contains('reveal-right') ||
            entry.target.classList.contains('reveal-scale') ||
            entry.target.classList.contains('text-grow') ||
            entry.target.classList.contains('word-reveal')) {
          entry.target.classList.add('visible');
        }

        // Handle new [data-reveal] system
        if (entry.target.hasAttribute('data-reveal')) {
          entry.target.classList.add('is-revealed');
        }

        // Handle .text-reveal
        if (entry.target.classList.contains('text-reveal')) {
          entry.target.classList.add('is-revealed');
        }

        // Trigger count-up on the element itself
        if (entry.target.hasAttribute('data-count-up')) {
          animateCountUp(entry.target);
        }

        // Trigger count-up for any child elements
        entry.target.querySelectorAll('[data-count-up]').forEach(function(el) {
          if (!el.dataset.countAnimated) animateCountUp(el);
        });

        // Fire once — stop observing after reveal
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  // ═══ Word-by-word setup — new .text-reveal system ═══
  document.querySelectorAll('.text-reveal').forEach(function(el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function(word, i) {
      return '<span class="word" style="transition-delay:' + (i * 0.06) + 's">' + word + '</span>';
    }).join(' ');
  });

  // ═══ Word-by-word setup — legacy .word-reveal system ═══
  document.querySelectorAll('.word-reveal').forEach(function(el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function(word, i) {
      return '<span style="transition-delay:' + (i * 0.06) + 's">' + word + '</span>';
    }).join(' ');
  });

  // ═══ Observe all reveal elements ═══
  var selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .text-grow, .word-reveal, [data-reveal], .text-reveal';
  document.querySelectorAll(selector).forEach(function(el) {
    revealObserver.observe(el);
  });

  // Also observe orphan count-ups (count-ups not inside a reveal wrapper)
  document.querySelectorAll('[data-count-up]').forEach(function(el) {
    // Only observe if not already inside something being observed
    var parent = el.parentElement;
    var alreadyInReveal = false;
    while (parent) {
      if (parent.matches && parent.matches(selector)) {
        alreadyInReveal = true;
        break;
      }
      parent = parent.parentElement;
    }
    if (!alreadyInReveal) {
      revealObserver.observe(el);
    }
  });

  // ═══ Count-up animation ═══
  function animateCountUp(el) {
    if (el.dataset.countAnimated === 'true') return;
    el.dataset.countAnimated = 'true';

    var target = el.getAttribute('data-count-up');
    var duration = parseInt(el.getAttribute('data-count-duration') || 1600);
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';

    var match = target.match(/-?[\d,]+\.?\d*/);
    if (!match) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var endValue = parseFloat(match[0].replace(/,/g, ''));
    var isInteger = Number.isInteger(endValue);
    var decimals = isInteger ? 0 : (match[0].split('.')[1] || '').length;

    var startTime = null;
    var startValue = 0;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutExpo(progress);
      var current = startValue + (endValue - startValue) * eased;

      var display;
      if (isInteger) {
        display = Math.round(current).toLocaleString();
      } else {
        display = current.toFixed(decimals);
      }
      el.textContent = prefix + display + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + (isInteger ? endValue.toLocaleString() : endValue.toFixed(decimals)) + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  // Expose for external use
  window.SortoraMotion = { animateCountUp: animateCountUp };
})();
