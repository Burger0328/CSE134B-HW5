const intro = document.querySelector("[data-site-intro]");
const enterButton = document.querySelector("[data-enter-portfolio]");

if (intro && enterButton && !document.documentElement.classList.contains("portfolio-entered")) {
    const enterPortfolio = (event) => {
        event.preventDefault();
        intro.classList.add("is-leaving");

        try {
            sessionStorage.setItem("portfolio-entered", "true");
        } catch (error) {
            console.warn("The intro state could not be saved.", error);
        }

        window.setTimeout(() => {
            document.documentElement.classList.add("portfolio-entered");
            document.querySelector("#main-content")?.focus({ preventScroll: true });
        }, 720);
    };

    enterButton.addEventListener("click", enterPortfolio);
}
