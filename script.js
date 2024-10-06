document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for internal links
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth',
            });
        });
    });

    // Fade-in effect when sections come into view
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const text = "Hello There, I'm Nadeem";
    const subtext = "AI Enthusisast and Software Developer";
    let index = 0;
    let subIndex = 0;

    function typeText() {
        if (index < text.length) {
            document.getElementById('typed-text').classList.add('typing');
            document.getElementById('typed-text').textContent += text.charAt(index);
            index++;
            setTimeout(typeText, 100); // Adjust typing speed here
        } else {
            typeSubText();
        }
    }

    function typeSubText() {
        if (subIndex < subtext.length) {
            document.getElementById('typed-subtext').classList.add('typing');
            document.getElementById('typed-subtext').textContent += subtext.charAt(subIndex);
            subIndex++;
            setTimeout(typeSubText, 100);
        }
    }

    // Start typing effect after 1 second delay
    setTimeout(typeText, 1000);
});
