class CoastalWeather extends HTMLElement {
    static observedAttributes = ["latitude", "longitude", "location", "units"];

    constructor() {
        super();
        this.controller = null;
        this.timeoutId = null;
        this.retryButton = null;
        this.unitsChoice = null;
        this.isInitialized = false;
        this.handleRetry = this.loadWeather.bind(this);
        this.handleUnitsChange = this.changeUnits.bind(this);
    }

    connectedCallback() {
        if (!this.querySelector(".weather-card")) {
            const template = document.querySelector("#coastal-weather-template");

            if (!template) {
                return;
            }

            this.append(template.content.cloneNode(true));
        }

        const fallback = this.querySelector("[data-weather-fallback]");
        this.retryButton = this.querySelector("[data-weather-retry]");
        this.unitsChoice = this.querySelector("[data-weather-units]");

        if (fallback) {
            fallback.hidden = true;
        }

        this.retryButton.addEventListener("click", this.handleRetry);
        this.unitsChoice.value = this.getAttribute("units") === "celsius"
            ? "celsius"
            : "fahrenheit";
        this.unitsChoice.addEventListener("change", this.handleUnitsChange);
        this.isInitialized = true;
        this.setState("idle", "Current coastal conditions have not loaded yet.");
        this.loadWeather();
    }

    disconnectedCallback() {
        this.cancelRequest();
        this.isInitialized = false;

        if (this.retryButton) {
            this.retryButton.removeEventListener("click", this.handleRetry);
        }

        if (this.unitsChoice) {
            this.unitsChoice.removeEventListener("change", this.handleUnitsChange);
        }
    }

    changeUnits(event) {
        this.setAttribute("units", event.target.value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected && this.isInitialized) {
            this.loadWeather();
        }
    }

    async loadWeather() {
        const latitudeValue = this.getAttribute("latitude");
        const longitudeValue = this.getAttribute("longitude");
        const latitude = Number(latitudeValue);
        const longitude = Number(longitudeValue);
        const location = this.getAttribute("location") || "Oregon Coast";
        const units = this.getAttribute("units") === "celsius"
            ? "celsius"
            : "fahrenheit";

        if (this.unitsChoice) {
            this.unitsChoice.value = units;
        }

        const coordinatesAreInvalid =
            latitudeValue === null ||
            latitudeValue.trim() === "" ||
            longitudeValue === null ||
            longitudeValue.trim() === "" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180;

        if (coordinatesAreInvalid) {
            this.showError("Weather coordinates are missing or invalid.");
            return;
        }

        this.cancelRequest();
        this.setState("loading", "Loading current coastal conditions...");

        const cacheKey = `coastal-weather:${latitude}:${longitude}:${units}`;
        const cachedWeather = this.readCache(cacheKey);

        if (cachedWeather) {
            this.showWeather(cachedWeather, location, units);
            return;
        }

        const controller = new AbortController();
        this.controller = controller;

        const parameters = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
            temperature_unit: units,
            wind_speed_unit: units === "celsius" ? "kmh" : "mph",
            timezone: "auto"
        });
        const endpoint = `https://api.open-meteo.com/v1/forecast?${parameters}`;
        let didTimeout = false;

        const timeoutId = window.setTimeout(() => {
            didTimeout = true;
            controller.abort();
        }, 8000);
        this.timeoutId = timeoutId;

        try {
            const response = await fetch(endpoint, {
                headers: { Accept: "application/json" },
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`The weather service returned ${response.status}.`);
            }

            const weather = await response.json();

            if (!weather.current) {
                throw new Error("The weather response did not include current conditions.");
            }

            if (this.controller !== controller) {
                return;
            }

            this.writeCache(cacheKey, weather);
            this.showWeather(weather, location, units);
        } catch (error) {
            if (error.name === "AbortError" && !didTimeout) {
                return;
            }

            const message = didTimeout
                ? "The weather request took too long. Please try again."
                : "Current weather is unavailable. Check your connection and try again.";

            this.showError(message);
            console.warn("Coastal weather request failed.", error);
        } finally {
            window.clearTimeout(timeoutId);

            if (this.timeoutId === timeoutId) {
                this.timeoutId = null;
            }

            if (this.controller === controller) {
                this.controller = null;
            }
        }
    }

    cancelRequest() {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;

        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
    }

    setState(state, message) {
        this.dataset.state = state;
        this.querySelector("[data-weather-status]").textContent = message;
        this.querySelector("[data-weather-details]").hidden = true;
        this.querySelector("[data-weather-retry]").hidden = state !== "error";
    }

    showWeather(weather, location, units) {
        const current = weather.current;
        const temperatureSymbol = units === "celsius" ? "°C" : "°F";
        const windSymbol = units === "celsius" ? "km/h" : "mph";
        const weatherTime = new Date(current.time);

        this.dataset.state = "ready";
        this.querySelector("[data-weather-status]").textContent = "Current conditions are ready.";
        this.querySelector("[data-weather-location]").textContent = location;
        this.querySelector("[data-weather-description]").textContent = describeWeather(current.weather_code);
        this.querySelector("[data-weather-temperature]").textContent =
            `${current.temperature_2m}${temperatureSymbol}, feels like ${current.apparent_temperature}${temperatureSymbol}`;
        this.querySelector("[data-weather-wind]").textContent =
            `${current.wind_speed_10m} ${windSymbol}`;

        const timeElement = this.querySelector("[data-weather-time]");
        timeElement.dateTime = current.time;
        timeElement.textContent = Number.isNaN(weatherTime.getTime())
            ? current.time
            : weatherTime.toLocaleString();

        this.querySelector("[data-weather-details]").hidden = false;
        this.querySelector("[data-weather-retry]").hidden = true;
    }

    showError(message) {
        this.setState("error", message);
        const fallback = this.querySelector("[data-weather-fallback]");

        if (fallback) {
            fallback.hidden = false;
        }
    }

    readCache(key) {
        try {
            const cachedItem = JSON.parse(sessionStorage.getItem(key));
            const tenMinutes = 10 * 60 * 1000;

            if (cachedItem && Date.now() - cachedItem.savedAt < tenMinutes) {
                return cachedItem.weather;
            }
        } catch (error) {
            console.warn("Cached weather could not be read.", error);
        }

        return null;
    }

    writeCache(key, weather) {
        try {
            sessionStorage.setItem(key, JSON.stringify({
                savedAt: Date.now(),
                weather
            }));
        } catch (error) {
            console.warn("Weather could not be cached.", error);
        }
    }
}

function describeWeather(code) {
    const descriptions = new Map([
        [0, "Clear sky"],
        [1, "Mainly clear"],
        [2, "Partly cloudy"],
        [3, "Overcast"],
        [45, "Fog"],
        [48, "Freezing fog"],
        [51, "Light drizzle"],
        [53, "Drizzle"],
        [55, "Heavy drizzle"],
        [61, "Light rain"],
        [63, "Rain"],
        [65, "Heavy rain"],
        [71, "Light snow"],
        [73, "Snow"],
        [75, "Heavy snow"],
        [80, "Light rain showers"],
        [81, "Rain showers"],
        [82, "Heavy rain showers"],
        [95, "Thunderstorm"]
    ]);

    return descriptions.get(code) || "Mixed conditions";
}

if (!customElements.get("coastal-weather")) {
    customElements.define("coastal-weather", CoastalWeather);
}

const canvas = document.querySelector("#archive-canvas");

if (canvas) {
    const context = canvas.getContext("2d");
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--text");
    context.strokeRect(45, 55, 230, 90);
    context.strokeRect(75, 30, 170, 35);
    context.strokeRect(125, 80, 70, 40);
    context.beginPath();
    context.moveTo(140, 95);
    context.lineTo(180, 95);
    context.moveTo(140, 108);
    context.lineTo(180, 108);
    context.stroke();
}

class HelloWorld extends HTMLElement {
    connectedCallback() {
        console.log("Hello World!");
    }
}

if (!customElements.get("hello-world")) {
    customElements.define("hello-world", HelloWorld);
}
