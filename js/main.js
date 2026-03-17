document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = htmlEl.getAttribute('data-theme') === 'dark';
      if (isDark) {
        htmlEl.removeAttribute('data-theme');
        toggleBtn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
      } else {
        htmlEl.setAttribute('data-theme', 'dark');
        toggleBtn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // On page load, set theme from localStorage if exists
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    htmlEl.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️';
  } else {
    htmlEl.removeAttribute('data-theme');
    toggleBtn.textContent = '🌙';
  }

  // Contact form validation and submission
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear previous messages
      formMessage.textContent = '';
      formMessage.className = '';

      // Validate inputs
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const reasonInput = document.getElementById('contactReason');

      let valid = true;

      if (!nameInput.value.trim()) {
        nameInput.classList.add('is-invalid');
        valid = false;
      } else {
        nameInput.classList.remove('is-invalid');
      }

      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid');
        valid = false;
      } else {
        emailInput.classList.remove('is-invalid');
      }

      if (!reasonInput.value.trim()) {
        reasonInput.classList.add('is-invalid');
        valid = false;
      } else {
        reasonInput.classList.remove('is-invalid');
      }

      if (!valid) {
        formMessage.textContent = 'Please fill out all required fields correctly.';
        formMessage.classList.add('text-danger');
        return;
      }

      // Simulate form submission success
      formMessage.textContent = 'Thank you for contacting me! I will get back to you soon.';
      formMessage.classList.add('text-success');

      // Clear form fields
      contactForm.reset();
    });
  }

  function validateEmail(email) {
    // Simple email regex validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => revealObserver.observe(el));
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('#navbar .nav-link');
  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const active = document.querySelector(`#navbar .nav-link[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionObserver.observe(s));
  }
});
