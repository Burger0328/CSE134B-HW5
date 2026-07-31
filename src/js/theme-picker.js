const themePicker = document.querySelector("[data-theme-picker]");

if (themePicker) {
    const themeChoices = themePicker.querySelectorAll('input[name="theme"]');
    const savedTheme = readTheme();
    const savedChoice = themePicker.querySelector(`input[value="${savedTheme}"]`);

    savedChoice.checked = true;
    themePicker.hidden = false;

    for (const themeChoice of themeChoices) {
        themeChoice.addEventListener("change", changeTheme);
    }
}

function readTheme() {
    try {
        const savedTheme = localStorage.getItem("theme");

        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch (error) {
        console.warn("The saved theme could not be read.", error);
    }

    return "system";
}

function changeTheme(event) {
    const selectedTheme = event.currentTarget.value;
    const root = document.documentElement;

    if (selectedTheme === "system") {
        root.removeAttribute("data-theme");
    } else {
        root.setAttribute("data-theme", selectedTheme);
    }

    try {
        if (selectedTheme === "system") {
            localStorage.removeItem("theme");
        } else {
            localStorage.setItem("theme", selectedTheme);
        }
    } catch (error) {
        console.warn("The theme preference could not be saved.", error);
    }
}
