(function () {
    try {
        const savedTheme = localStorage.getItem("mara-theme");

        if (savedTheme === "light" || savedTheme === "dark") {
            document.documentElement.dataset.theme = savedTheme;
        }
    } catch (error) {
        console.warn("The saved theme could not be read.", error);
    }
})();
