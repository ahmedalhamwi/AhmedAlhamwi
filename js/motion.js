// Motion layer for the portfolio. Loaded after main.js on every page.
// Every effect is skipped when the visitor asks for reduced motion;
// the CSS in enhance.css then shows all content without animation.
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Navbar gets a solid background once the page is scrolled
  const navbar = document.getElementById('navbar');
  const onScrollNav = () => {
    if (navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // Back-to-top button (useful with or without motion)
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.appendChild(toTop);
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
  }, { passive: true });

  if (reduceMotion) {
    document.documentElement.classList.add('no-motion');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  // Moving colour blobs behind the hero sections
  document.querySelectorAll('.hero, .proj-page-hero').forEach(hero => {
    const aurora = document.createElement('div');
    aurora.className = 'aurora';
    aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = '<span></span><span></span><span></span>';
    hero.prepend(aurora);
  });

  // Hero name: split into letters that rise in one after another.
  // The full name stays in aria-label so screen readers read it normally.
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    const label = heroName.textContent.replace(/\s+/g, ' ').trim();
    const originalHtml = heroName.innerHTML;
    let i = 0;
    const splitNode = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach(ch => {
          if (/\s/.test(ch)) {
            frag.appendChild(document.createTextNode(ch));
            return;
          }
          const span = document.createElement('span');
          span.className = 'char';
          span.style.setProperty('--i', i++);
          span.textContent = ch;
          span.setAttribute('aria-hidden', 'true');
          frag.appendChild(span);
        });
        node.replaceWith(frag);
      } else {
        [...node.childNodes].forEach(splitNode);
      }
    };
    heroName.classList.add('is-splitting');
    [...heroName.childNodes].forEach(splitNode);
    heroName.setAttribute('aria-label', label);
    // letters can't share one gradient while they move, so put the plain text back once they land
    setTimeout(() => {
      heroName.innerHTML = originalHtml;
      heroName.classList.remove('is-splitting');
      heroName.removeAttribute('aria-label');
    }, i * 45 + 1200);
  }

  // Hero role: types through a few titles
  const role = document.querySelector('.hero-role');
  if (role) {
    const roles = [
      'ICT Software Developer',
      'Full-Stack Web Developer',
      'Next.js & Symfony Builder',
      'Game Developer'
    ];
    const textNode = [...role.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (textNode) {
      const out = document.createElement('span');
      out.className = 'typed-text';
      out.textContent = textNode.textContent.trim();
      const caret = document.createElement('span');
      caret.className = 'typed-caret';
      caret.setAttribute('aria-hidden', 'true');
      textNode.replaceWith(out, caret);
      role.setAttribute('aria-label', roles.join(', '));
      out.setAttribute('aria-hidden', 'true');

      let r = 0;
      let c = out.textContent.length;
      let deleting = true;
      const tick = () => {
        const word = roles[r];
        if (deleting) {
          c--;
          out.textContent = word.slice(0, c);
          if (c === 0) {
            deleting = false;
            r = (r + 1) % roles.length;
          }
          setTimeout(tick, 35);
        } else {
          const next = roles[r];
          c++;
          out.textContent = next.slice(0, c);
          if (c === next.length) {
            deleting = true;
            setTimeout(tick, 2200);
          } else {
            setTimeout(tick, 70);
          }
        }
      };
      setTimeout(tick, 2600);
    }
  }

  // Grids reveal their children one after another
  const staggerSelectors = '.strengths-grid, .skills-grid, .deliverables-grid, #projects .row, .proj-stat-row';
  const staggers = document.querySelectorAll(staggerSelectors);
  staggers.forEach(grid => {
    grid.classList.add('stagger');
    [...grid.children].forEach((child, idx) => {
      child.style.setProperty('--i', idx % 6);
      // the cards inside #projects already had their own .reveal; the grid now handles it
      child.classList.remove('reveal');
    });
  });

  const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  staggers.forEach(grid => {
    // Project grids are tall: reveal each row of cards as it arrives instead of the whole grid
    if (grid.matches('#projects .row')) {
      grid.classList.remove('stagger');
      [...grid.children].forEach(card => {
        card.classList.add('reveal');
        card.style.setProperty('--reveal-delay', `${(Number(card.style.getPropertyValue('--i')) % 3) * 90}ms`);
        staggerObserver.observe(card);
      });
    } else {
      staggerObserver.observe(grid);
    }
  });

  // Numbers count up when they scroll into view
  const counters = document.querySelectorAll('.about-stat .stat-num, .proj-stat .stat-number, .kpi-card .kpi-value');
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      const el = entry.target;
      const original = el.textContent.trim();
      // Only plain numbers like 18, 1.3k, 400+, 4/4 or 7.5 — anything else is left as is
      const m = original.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
      // ordinals like 3rd stay as they are; counting up through 0rd, 1rd looks broken
      if (!m || /^(st|nd|rd|th)\b/i.test(m[2])) return;
      const target = parseFloat(m[1].replace(',', '.'));
      const decimals = (m[1].split(/[.,]/)[1] || '').length;
      const suffix = m[2];
      const duration = 1200;
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = original;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countObserver.observe(el));

  if (!finePointer) return;

  // Project cards tilt toward the cursor and show a spotlight under it
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // Hero buttons lean toward the cursor
  document.querySelectorAll('.hero-btns .btn, .cta-section .btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      btn.style.translate = `${dx * 0.18}px ${dy * 0.25}px`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.translate = '';
    });
  });

  // Hero photo follows the cursor slightly
  const photo = document.querySelector('.hero-photo');
  const hero = document.querySelector('.hero');
  if (photo && hero) {
    hero.addEventListener('pointermove', e => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      photo.style.translate = `${x * -18}px ${y * -14}px`;
    });
  }
});
