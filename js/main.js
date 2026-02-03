document.addEventListener("DOMContentLoaded", () => {
  initHeroSlideshow();
  initMobileMenu();
  initSmoothScrolling();
  initFAQ();
  initContactForm();
  initScrollAnimations();
  initStickyHeader();
  initActiveNavigation();
});

/* =========================
   HERO SLIDESHOW
========================= */
function initHeroSlideshow() {
  const slideshow = document.querySelector(".hero-slideshow");
  if (!slideshow) return;

  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.querySelector(".hero-arrow-prev");
  const nextBtn = document.querySelector(".hero-arrow-next");

  let currentSlide = 0;
  let autoplayInterval;
  let isPaused = false;

  function showSlide(index) {
    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoplay() {
    if (isPaused) return;
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  prevBtn?.addEventListener("click", () => {
    prevSlide();
    stopAutoplay();
    setTimeout(startAutoplay, 800);
  });

  nextBtn?.addEventListener("click", () => {
    nextSlide();
    stopAutoplay();
    setTimeout(startAutoplay, 800);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      stopAutoplay();
      setTimeout(startAutoplay, 800);
    });
  });

  slideshow.addEventListener("mouseenter", () => {
    isPaused = true;
    stopAutoplay();
  });

  slideshow.addEventListener("mouseleave", () => {
    isPaused = false;
    startAutoplay();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
      stopAutoplay();
      setTimeout(startAutoplay, 800);
    }
    if (e.key === "ArrowRight") {
      nextSlide();
      stopAutoplay();
      setTimeout(startAutoplay, 800);
    }
  });

  startAutoplay();
}

/* =========================
   MOBILE MENU
========================= */
function initMobileMenu() {
  const menuToggle = document.getElementById("mobileMenuToggle");
  const nav = document.getElementById("nav");
  if (!menuToggle || !nav) return;

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    nav.classList.toggle("active");
  });

  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      nav.classList.remove("active");
    });
  });

  document.addEventListener("click", (event) => {
    const isInsideNav = nav.contains(event.target);
    const isOnToggle = menuToggle.contains(event.target);

    if (!isInsideNav && !isOnToggle && nav.classList.contains("active")) {
      menuToggle.classList.remove("active");
      nav.classList.remove("active");
    }
  });
}

/* =========================
   SMOOTH SCROLL
========================= */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
      const targetPosition = target.offsetTop - headerHeight;

      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    });
  });
}

/* =========================
   ACTIVE NAV
========================= */
function initActiveNavigation() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  function highlight() {
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) link.classList.add("active");
        });
      }
    });
  }

  window.addEventListener("scroll", highlight);
  highlight();
}

/* =========================
   FAQ
========================= */
function initFAQ() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      items.forEach((other) => {
        if (other !== item) other.classList.remove("active");
      });

      item.classList.toggle("active");
    });
  });
}

/* =========================
   CONTACT FORM
========================= */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    let isValid = true;

    if (!name || name.length < 2) {
      showError("name", "Digite o nome completo!");
      isValid = false;
    }

    if (!email || !isValidEmail(email)) {
      showError("email", "Email inválido!");
      isValid = false;
    }

    if (phone && !isValidPhone(phone)) {
      showError("phone", "Telefone inválido!");
      isValid = false;
    }

    if (!message || message.length < 10) {
      showError("message", "Por favor, digite uma mensagem (mínimo 10 caracteres).");
      isValid = false;
    }

    if (!isValid) return;

    showSuccessMessage();
  });

  const sendAnotherBtn = document.getElementById("sendAnotherBtn");
  sendAnotherBtn?.addEventListener("click", () => {
    const formContainer = document.getElementById("contactFormContainer");
    const successMessage = document.getElementById("successMessage");
    if (!formContainer || !successMessage) return;

    successMessage.style.display = "none";
    formContainer.style.display = "block";
    formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function showSuccessMessage() {
    const formContainer = document.getElementById("contactFormContainer");
    const successMessage = document.getElementById("successMessage");
    if (!formContainer || !successMessage) return;

    formContainer.style.display = "none";
    successMessage.style.display = "block";

    form.reset();
    successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    const digits = value.replace(/\D/g, "");
    return /^[\d\s\-\+\(\)]+$/.test(value) && digits.length >= 9;
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "Error");
    if (!field || !error) return;

    field.classList.add("error");
    error.textContent = message;
    error.classList.add("show");
  }

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.classList.remove("show");
      el.textContent = "";
    });

    document.querySelectorAll(".error").forEach((el) => {
      el.classList.remove("error");
    });
  }

  form.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      input.classList.remove("error");
      const err = document.getElementById(input.id + "Error");
      if (err) err.classList.remove("show");
    });
  });
}

/* =========================
   SCROLL ANIMATIONS
========================= */
function initScrollAnimations() {
  const animated = document.querySelectorAll(".animate-on-scroll");

  if (!("IntersectionObserver" in window)) {
    animated.forEach((el) => el.classList.add("animated"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  animated.forEach((el) => observer.observe(el));
}

/* =========================
   STICKY HEADER
========================= */
function initStickyHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 100) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  });
}
