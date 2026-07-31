const themePicker = document.querySelector("[data-theme-picker]");

if (themePicker) {
    const themeChoice = themePicker.querySelector("select");
    const savedTheme = readTheme();

    themeChoice.value = savedTheme;
    themePicker.hidden = false;
    themeChoice.addEventListener("change", changeTheme);
}

function readTheme() {
    try {
        const savedTheme = localStorage.getItem("mara-theme");

        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch (error) {
        console.warn("The saved theme could not be read.", error);
    }

    return "system";
}

function changeTheme(event) {
    const selectedTheme = event.target.value;

    if (selectedTheme === "system") {
        delete document.documentElement.dataset.theme;
    } else {
        document.documentElement.dataset.theme = selectedTheme;
    }

    try {
        if (selectedTheme === "system") {
            localStorage.removeItem("mara-theme");
        } else {
            localStorage.setItem("mara-theme", selectedTheme);
        }
    } catch (error) {
        console.warn("The theme preference could not be saved.", error);
    }
}
