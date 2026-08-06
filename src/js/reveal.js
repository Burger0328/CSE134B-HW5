const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
    const targets = document.querySelectorAll(
        "main > section:not(.hero), .project-grid > li, .timeline > li"
    );

    targets.forEach((target, index) => {
        target.classList.add("reveal-item");
        target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -4%" }
    );

    targets.forEach((target) => observer.observe(target));
}
