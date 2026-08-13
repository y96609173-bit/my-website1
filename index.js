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
    const revealElements = document.querySelectorAll('.statement-title, .manifesto-quote, .manifesto-body, .marks-header, .mark-exhibit, .process-step, .philosophy-header, .philosophy-row, .brief-title, .brief-subtitle, .brief-form');
    
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

    // 6. Project Brief / Client Inquiry Form Validation & Submission
    const briefForm = document.getElementById('projectBriefForm');
    const briefSuccessState = document.getElementById('briefSuccessState');
    const submitBtn = document.getElementById('submitBriefBtn');

    if (briefForm && briefSuccessState && submitBtn) {
        const fields = {
            fullName: {
                input: document.getElementById('fullName'),
                error: document.getElementById('fullNameError'),
                validate: (val) => val.trim().length >= 2 ? '' : 'الرجاء كتابة الاسم الكامل (حرفين على الأقل).'
            },
            phoneNumber: {
                input: document.getElementById('phoneNumber'),
                error: document.getElementById('phoneNumberError'),
                validate: (val) => /^05[0-9]{8}$/.test(val.trim()) ? '' : 'الرجاء إدخال رقم جوال سعودي صحيح يتكون من 10 أرقام (مثال: 05XXXXXXXX).'
            },
            emailAddress: {
                input: document.getElementById('emailAddress'),
                error: document.getElementById('emailAddressError'),
                validate: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'صيغة البريد الإلكتروني غير صحيحة.'
            },
            requestedService: {
                input: document.getElementById('requestedService'),
                error: document.getElementById('requestedServiceError'),
                validate: (val) => val ? '' : 'الرجاء اختيار الخدمة المطلوبة.'
            },
            projectDesc: {
                input: document.getElementById('projectDesc'),
                error: document.getElementById('projectDescError'),
                validate: (val) => val.trim().length >= 10 ? '' : 'الرجاء كتابة نبذة توضيحية عن مشروعك (10 أحرف على الأقل).'
            }
        };

        // Real-time input listeners to clear errors on type/change
        Object.keys(fields).forEach(key => {
            const field = fields[key];
            field.input.addEventListener('input', () => {
                const errorMsg = field.validate(field.input.value);
                field.error.textContent = errorMsg;
                if (!errorMsg) {
                    field.input.style.borderBottomColor = '';
                }
            });
            field.input.addEventListener('change', () => {
                const errorMsg = field.validate(field.input.value);
                field.error.textContent = errorMsg;
                if (!errorMsg) {
                    field.input.style.borderBottomColor = '';
                }
            });
        });

        // Add Hover Effects to Reticle Cursor for form buttons & select cards
        const radioCards = briefForm.querySelectorAll('.radio-card');
        radioCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (reticle) reticle.classList.add('active');
            });
            card.addEventListener('mouseleave', () => {
                if (reticle) reticle.classList.remove('active');
            });
        });

        briefForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let hasErrors = false;

            // Validate all fields on submit
            Object.keys(fields).forEach(key => {
                const field = fields[key];
                const errorMsg = field.validate(field.input.value);
                field.error.textContent = errorMsg;
                if (errorMsg) {
                    hasErrors = true;
                    field.input.style.borderBottomColor = '#CC0000';
                } else {
                    field.input.style.borderBottomColor = '';
                }
            });

            if (hasErrors) {
                // Focus on the first invalid field
                const firstErrorKey = Object.keys(fields).find(key => fields[key].validate(fields[key].input.value));
                if (firstErrorKey) {
                    fields[firstErrorKey].input.focus();
                }
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-loader"></span> <span class="btn-text">جاري إرسال الطلب...</span>';

            // Gather Form Data
            const formData = new FormData(briefForm);
            const payload = {};
            formData.forEach((value, key) => {
                payload[key] = value;
            });

            // Handle budget, timeline, and contact checked radios specifically since we used custom layouts
            const budgetChecked = briefForm.querySelector('input[name="projectBudget"]:checked');
            if (budgetChecked) payload.projectBudget = budgetChecked.value;

            const timelineChecked = briefForm.querySelector('input[name="projectTimeline"]:checked');
            if (timelineChecked) payload.projectTimeline = timelineChecked.value;

            const contactChecked = briefForm.querySelector('input[name="contactMethod"]:checked');
            if (contactChecked) payload.contactMethod = contactChecked.value;

            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show elegant success state
                    briefForm.style.display = 'none';
                    briefSuccessState.style.display = 'flex';
                } else {
                    // Show server-side validation errors if any
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            if (fields[key]) {
                                fields[key].error.textContent = result.errors[key];
                                fields[key].input.style.borderBottomColor = '#CC0000';
                            }
                        });
                    } else {
                        alert(result.message || 'حدث خطأ ما أثناء إرسال الطلب. يرجى المحاولة لاحقاً.');
                    }
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '';
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (err) {
                console.error('Error submitting form:', err);
                alert('عذراً، فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.');
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

});
