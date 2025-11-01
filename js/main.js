document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  toggleButton.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

  toggleButton.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggleButton.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      toggleButton.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
  });

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
});
