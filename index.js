document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            navToggle.classList.toggle('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                navToggle.classList.remove('open');
            });
        });
    }

    // 2. Scrollspy & Kinetic Section Counter
    const sections = document.querySelectorAll('section, footer');
    const brandNumber = document.querySelector('.brand-number');

    window.addEventListener('scroll', () => {
        let current = '';
        let currentNum = '01';

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
                currentNum = `0${index + 1}`;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        if (brandNumber && currentNum) {
            brandNumber.textContent = `EXHIBITION / ${currentNum}`;
        }
    });

    // 3. Cinematic Exhibition Reveals (Mask & Soft Translate Reveal)
    const revealElements = document.querySelectorAll('.statement-title, .manifesto-quote, .manifesto-body, .marks-header, .mark-exhibit, .process-step, .philosophy-header, .philosophy-row');
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(35px)';
        el.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // 4. SIGNATURE INTERACTION: Precision Reticle Cursor & VIEW Cursor Switch
    const reticle = document.getElementById('reticle-cursor');
    const reticleCoords = document.getElementById('reticleCoords');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let mouseMoved = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (reticleCoords) {
            reticleCoords.textContent = `POS / ${Math.round(mouseX)}:${Math.round(mouseY)}`;
            if (!mouseMoved) {
                reticleCoords.style.opacity = '0.6';
                mouseMoved = true;
            }
        }
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        if (reticle) {
            reticle.style.left = `${cursorX}px`;
            reticle.style.top = `${cursorY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactiveElements = document.querySelectorAll('a, button, .filter-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (reticle) reticle.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            if (reticle) reticle.classList.remove('active');
        });
    });

    // Editorial Spreads Hover Interaction -> Reticle transforms to VIEW badge
    const markSpreads = document.querySelectorAll('.mark-exhibit');
    markSpreads.forEach(spread => {
        spread.addEventListener('mouseenter', () => {
            if (reticle) reticle.classList.add('view-hover');
        });
        spread.addEventListener('mouseleave', () => {
            if (reticle) reticle.classList.remove('view-hover');
        });
    });

    // 5. Subtle Parallax float for logo columns on scroll (Independent movement)
    const logoCols = document.querySelectorAll('.mark-exhibit .mark-image-col');
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 1024) {
            logoCols.forEach(col => {
                col.style.transform = '';
            });
            return;
        }
        const scrolled = window.scrollY;
        logoCols.forEach(col => {
            const parent = col.closest('.mark-exhibit');
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Check if exhibit is visible in viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const parentCenter = rect.top + rect.height / 2;
                const viewportCenter = viewportHeight / 2;
                const offset = (parentCenter - viewportCenter) * 0.05; // extremely gentle coefficient
                
                let defaultY = 0;
                if (parent.classList.contains('mark-exhibit-2')) {
                    defaultY = -15; // default raised logo column
                }
                
                col.style.transform = `translate3d(0, ${offset + defaultY}px, 0)`;
            }
        });
    });

});
