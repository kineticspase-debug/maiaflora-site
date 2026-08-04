/* Maia Flora — interactions */
(() => {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const preloader = document.getElementById('preloader');
  const heroMedia = document.getElementById('heroMedia');

  // Preloader (homepage only): brief brand moment, then release
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('preloader--done'), 900);
    });
    // Safety: never trap the page if load stalls
    setTimeout(() => preloader.classList.add('preloader--done'), 3200);
  }

  // Nav state on scroll + hero parallax
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 40);
    if (heroMedia && y < window.innerHeight) {
      heroMedia.style.transform = `translateY(${y * 0.28}px)`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Mobile menu
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Forms → studio inbox (billing@maiaflora.com) via FormSubmit,
  // with a mailto: fallback if the network path fails.
  const INBOX = 'billing@maiaflora.com';
  document.querySelectorAll('form[data-mf-form]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return; // bot
      delete data._honey;
      const subject = form.dataset.subject || 'Website inquiry';
      const btn = form.querySelector('button[type="submit"], button');
      const btnLabel = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch('https://formsubmit.co/ajax/' + INBOX, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ...data, _subject: subject, _template: 'table' })
        });
        if (!r.ok) throw new Error('send failed');
        form.innerHTML = '<p class="form-success">Thank you — your message is on its way. We reply within one business day.</p>';
      } catch (err) {
        // Fallback: open the visitor's mail app pre-addressed to the studio
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
        location.href = 'mailto:' + INBOX +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        btn.disabled = false; btn.textContent = btnLabel;
      }
    });
  });

  // Reveal on scroll (staggered per section)
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = `${(siblings.indexOf(el) % 6) * 90}ms`;
      el.classList.add('reveal--in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
