'use strict';



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * INTRO SCREEN
 * Preloader is disabled - intro screen is the only loading screen
 */

const introScreen = document.querySelector("[data-intro-screen]");
// const preloader = document.querySelector("[data-preloader]"); // Temporarily disabled

// Hide intro screen after animation completes and show main content
window.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (introScreen) {
      introScreen.classList.add("hidden");
    }
    // Enable body scroll and show main content
    document.body.classList.add("loaded");
  }, 3500); // 3.5 seconds to show the full animation
});



/**
 * NAVBAR
 * navbar toggle for mobile
 */

const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  navToggleBtn.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");

  // Animate navbar links when opening
  if (navbar.classList.contains("active")) {
    const navbarLinks = navbar.querySelectorAll(".navbar-link");
    navbarLinks.forEach((link, index) => {
      link.style.opacity = "0";
      link.style.transform = "translateX(20px)";
      setTimeout(() => {
        link.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        link.style.opacity = "1";
        link.style.transform = "translateX(0)";
      }, index * 100);
    });
  } else {
    // Reset animations when closing
    const navbarLinks = navbar.querySelectorAll(".navbar-link");
    navbarLinks.forEach(link => {
      link.style.opacity = "";
      link.style.transform = "";
      link.style.transition = "";
    });
  }
}

addEventOnElements(navTogglers, "click", toggleNavbar);

// Auto-close navbar on mobile/tablet when clicking a menu item
const navbarLinks = document.querySelectorAll(".navbar-link");
const isMobileOrTablet = function () {
  return window.innerWidth <= 992; // Tablet and below
};

navbarLinks.forEach(link => {
  link.addEventListener("click", function () {
    if (isMobileOrTablet() && navbar.classList.contains("active")) {
      // Close navbar after a short delay to allow smooth transition
      setTimeout(function () {
        navbar.classList.remove("active");
        navToggleBtn.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("nav-active");
      }, 300);
    }
  });
});



/**
 * HEADER
 * header active when window scroll down to 100px
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});



/**
 * SLIDER
 */

const sliders = document.querySelectorAll("[data-slider]");

const initSlider = function (currentSlider) {

  const sliderContainer = currentSlider.querySelector("[data-slider-container]");
  const sliderPrevBtn = currentSlider.querySelector("[data-slider-prev]");
  const sliderNextBtn = currentSlider.querySelector("[data-slider-next]");

  let totalSliderVisibleItems = Number(getComputedStyle(currentSlider).getPropertyValue("--slider-items"));
  let totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

  let currentSlidePos = 0;
  let autoScrollTimer = null;
  let isPaused = false;

  const moveSliderItem = function () {
    sliderContainer.style.transform = `translateX(-${sliderContainer.children[currentSlidePos].offsetLeft}px)`;
  }

  /**
   * NEXT SLIDE
   */
  const slideNext = function () {
    const slideEnd = currentSlidePos >= totalSlidableItems;

    if (slideEnd) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    moveSliderItem();
  }

  sliderNextBtn.addEventListener("click", () => {
    slideNext();
    restartAutoScroll();
  });

  /**
   * PREVIOUS SLIDE
   */
  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = totalSlidableItems;
    } else {
      currentSlidePos--;
    }

    moveSliderItem();
  }

  sliderPrevBtn.addEventListener("click", () => {
    slidePrev();
    restartAutoScroll();
  });

  const dontHaveExtraItem = totalSlidableItems <= 0;
  if (dontHaveExtraItem) {
    sliderNextBtn.style.display = 'none';
    sliderPrevBtn.style.display = 'none';
  }

  /**
   * AUTO SCROLL
   */
  const startAutoScroll = function () {
    if (!autoScrollTimer && totalSlidableItems > 0) {
      autoScrollTimer = setInterval(() => {
        if (!isPaused) slideNext();
      }, 5000);
    }
  };

  const stopAutoScroll = function () {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  };

  const restartAutoScroll = function () {
    stopAutoScroll();
    // Use a timeout to restart auto-scroll after 8 seconds of inactivity
    clearTimeout(currentSlider.restartTimeout);
    currentSlider.restartTimeout = setTimeout(startAutoScroll, 8000);
  };

  // Hover management
  currentSlider.addEventListener("mouseenter", () => isPaused = true);
  currentSlider.addEventListener("mouseleave", () => isPaused = false);

  // Initial start
  startAutoScroll();

  /**
   * slide with [shift + mouse wheel]
   */
  currentSlider.addEventListener("wheel", function (event) {
    if (event.shiftKey && event.deltaY > 0) {
      slideNext();
      restartAutoScroll();
    }
    if (event.shiftKey && event.deltaY < 0) {
      slidePrev();
      restartAutoScroll();
    }
  }, { passive: true });

  /**
   * slide with touch
   */
  let touchstartX = 0;
  let touchendX = 0;

  currentSlider.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;
  }, { passive: true });

  currentSlider.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
  }, { passive: true });

  function handleGesture() {
    const threshold = 50;
    if (touchstartX - touchendX > threshold) {
      slideNext();
      restartAutoScroll();
    }
    if (touchendX - touchstartX > threshold) {
      slidePrev();
      restartAutoScroll();
    }
  }

  /**
   * RESPONSIVE
   */
  window.addEventListener("resize", function () {
    totalSliderVisibleItems = Number(getComputedStyle(currentSlider).getPropertyValue("--slider-items"));
    totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;
    moveSliderItem();
  });

}

/**
 * CUSTOM CURSOR
 */
const initCustomCursor = function () {
  const cursorDot = document.querySelector("[data-cursor-dot]");
  const cursorOutline = document.querySelector("[data-cursor-outline]");

  if (!cursorDot || !cursorOutline) return;

  window.addEventListener("mousemove", function (e) {
    const posX = e.clientX;
    const posY = e.clientY;

    // Show cursor on first move
    cursorDot.style.opacity = "1";
    cursorOutline.style.opacity = "1";

    cursorDot.style.display = "block";
    cursorOutline.style.display = "block";

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  });

  const interactiveElements = document.querySelectorAll("a, button, .coding-project-card, .portfolio-card, .blog-card, .service-card");

  interactiveElements.forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursorDot.classList.add("hover");
      cursorOutline.classList.add("hover");
    });
    el.addEventListener("mouseleave", () => {
      cursorDot.classList.remove("hover");
      cursorOutline.classList.remove("hover");
    });
  });
};

for (let i = 0, len = sliders.length; i < len; i++) { initSlider(sliders[i]); }



/**
 * SCROLL ANIMATIONS
 * Smooth scroll-based animations using Intersection Observer
 * Only triggers when scrolling down
 */

const initScrollAnimations = function () {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Track scroll direction with improved detection
  let lastScrollY = window.scrollY;
  let isScrollingDown = true;
  let scrollTimeout = null;

  // Update scroll direction on scroll with debouncing
  const updateScrollDirection = function () {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;

    // Only update direction if scroll is significant (more than 5px)
    if (Math.abs(scrollDelta) > 5) {
      isScrollingDown = scrollDelta > 0;
      lastScrollY = currentScrollY;
    }
  };

  window.addEventListener('scroll', function () {
    updateScrollDirection();
    // Clear timeout and set new one to debounce
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateScrollDirection, 50);
  }, { passive: true });

  // Select all elements with scroll animation attributes
  // Exclude hero section elements
  const allScrollElements = document.querySelectorAll('[data-scroll], [data-scroll-stagger]');
  const scrollElements = [];
  const staggerElements = [];

  // Filter out hero section elements
  allScrollElements.forEach(element => {
    // Skip hero section elements completely
    if (element.closest('.hero') || element.closest('.hero-content')) {
      return;
    }

    if (element.hasAttribute('data-scroll-stagger')) {
      staggerElements.push(element);
    } else if (element.hasAttribute('data-scroll')) {
      scrollElements.push(element);
    }
  });

  // Store previous intersection state and scroll position for each element
  const elementStates = new Map();

  // Detect if device is mobile
  const isMobile = window.innerWidth <= 768;

  // Function to check if element is in viewport
  const isInViewport = function (element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -200 &&
      rect.left >= -200 &&
      rect.bottom <= windowHeight + 200 &&
      rect.right <= windowWidth + 200
    );
  };

  // Configuration for Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger when element is 80px from bottom of viewport
    threshold: 0.15 // Trigger when 15% of element is visible
  };

  // Track if this is the initial observer check
  let isInitialCheck = true;

  // Observer callback function
  const observerCallback = function (entries, observer) {
    entries.forEach(entry => {
      const element = entry.target;
      const state = elementStates.get(element) || { wasIntersecting: false, hasAnimated: false };
      const isIntersecting = entry.isIntersecting;

      // On initial check or mobile, show elements immediately
      // Otherwise, only animate when scrolling down
      const shouldAnimate = isIntersecting && !state.wasIntersecting &&
        (isInitialCheck || isMobile || isScrollingDown);

      if (shouldAnimate) {
        // Element is entering viewport - animate it
        element.classList.add('scroll-animated');
        elementStates.set(element, { wasIntersecting: true, hasAnimated: true });
      } else if (isIntersecting && state.hasAnimated) {
        // Element is in viewport and has been animated before - keep it visible
        // This ensures elements remain visible when scrolling up
        element.classList.add('scroll-animated');
        elementStates.set(element, { wasIntersecting: true, hasAnimated: true });
      } else if (!isIntersecting && state.wasIntersecting) {
        // Element is leaving viewport - keep it visible if it was animated
        // Never remove the animation class once an element has been animated
        elementStates.set(element, { wasIntersecting: false, hasAnimated: state.hasAnimated });
      }
      // Elements stay visible once animated - they don't disappear when scrolling up
    });

    // Mark initial check as complete after first callback
    if (isInitialCheck) {
      isInitialCheck = false;
    }
  };

  // Create Intersection Observer instance
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Check and make visible elements already in viewport on page load
  const checkInitialVisibility = function () {
    scrollElements.forEach(element => {
      if (isInViewport(element)) {
        // Element is already in viewport - make it visible immediately
        element.classList.add('scroll-animated');
        elementStates.set(element, { wasIntersecting: true, hasAnimated: true });
      } else {
        // Element is not in viewport - observe it for future intersection
        elementStates.set(element, { wasIntersecting: false, hasAnimated: false });
        observer.observe(element);
      }
    });

    staggerElements.forEach(element => {
      if (isInViewport(element)) {
        // Element is already in viewport - make it visible immediately
        element.classList.add('scroll-animated');
        elementStates.set(element, { wasIntersecting: true, hasAnimated: true });
      } else {
        // Element is not in viewport - observe it for future intersection
        elementStates.set(element, { wasIntersecting: false, hasAnimated: false });
        observer.observe(element);
      }
    });
  };

  // Check initial visibility immediately
  checkInitialVisibility();

  // Also check after a short delay to catch any elements that might not have been measured correctly
  setTimeout(checkInitialVisibility, 100);
};

// Initialize scroll animations when DOM is loaded
window.addEventListener("DOMContentLoaded", function () {
  initScrollAnimations();
  initProjectModal();
  initCustomCursor();
});



/**
 * PROJECT MODAL LOGIC
 */
const initProjectModal = function () {
  const modal = document.getElementById("projectModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalTech = document.getElementById("modalTech");
  const modalDescription = document.getElementById("modalDescription");
  const modalGithubLink = document.getElementById("modalGithubLink");
  const modalDownloadLink = document.getElementById("modalDownloadLink");

  const projectCards = document.querySelectorAll("[data-project-modal]");

  if (!modal) return;

  const openModal = function (card) {
    const title = card.getAttribute("data-project-title");
    const description = card.getAttribute("data-project-description");
    const tech = card.getAttribute("data-project-tech");
    const github = card.getAttribute("data-project-github");
    const imgSrc = card.querySelector("img").getAttribute("src"); // Use getAttribute for relative path

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalTech.textContent = tech;
    modalImage.src = imgSrc;
    modalGithubLink.href = github;

    const downloadUrl = card.getAttribute("data-project-download");
    if (downloadUrl) {
      modalDownloadLink.href = downloadUrl;
      modalDownloadLink.style.display = "inline-flex";
    } else {
      modalDownloadLink.style.display = "none";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeModal = function () {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Restore background scrolling
  };

  projectCards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  // Close modal on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
};
