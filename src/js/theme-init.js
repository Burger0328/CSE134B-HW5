(function () {
    document.documentElement.classList.add("js");

    try {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "light" || savedTheme === "dark") {
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    } catch (error) {
        console.warn("The saved theme could not be read.", error);
    }

    try {
        if (sessionStorage.getItem("portfolio-entered") === "true") {
            document.documentElement.classList.add("portfolio-entered");
        }
    } catch (error) {
        console.warn("The intro state could not be read.", error);
    }
})();
