# Mara Voss Portfolio - CSE 134B HW5

## Local Setup

Run npm install to install the dependencies. Run npm run dev to start the development server. Run npm run build to build the production site in the _site folder.

## Part 1: Theme Picker

I chose Option A, the theme picker. Without JavaScript, the site uses color-scheme and prefers-color-scheme to follow the user's system theme. JavaScript reveals a labeled menu with System, Light, and Dark choices. The selected theme is saved in localStorage and works across pages. If JavaScript does not load, the menu stays hidden so the page does not show a broken control.

The theme-init script is placed in the head so it can apply the saved theme as early as possible and reduce a flash of the wrong theme.

## Part 2: Coastal Weather Component

The custom element is named coastal-weather. It gets current weather data from the Open-Meteo forecast endpoint at https://api.open-meteo.com/v1/forecast. The endpoint does not require an API key.

The latitude attribute has no default and accepts numbers from -90 to 90. The longitude attribute has no default and accepts numbers from -180 to 180. The location attribute defaults to Oregon Coast and accepts a text label. The units attribute defaults to fahrenheit and accepts fahrenheit or celsius.

Example usage:

    <coastal-weather latitude="44.6368" longitude="-124.0535" location="Port Alder area, Oregon Coast" units="fahrenheit"></coastal-weather>

The component handles idle, loading, success, and error states. Changing an observed attribute reloads the data. It uses a template and textContent instead of inserting API data with innerHTML. It also includes fallback content, a retry button, a request timeout, and a short sessionStorage cache.

## Part 3: Eleventy

I chose Eleventy with Nunjucks templates. The base template contains the shared page layout. The head, header, footer, theme picker, and weather template are shared includes. The site data file stores information used across the website. The project data and project template generate all four project pages. Eleventy also generates the 404 page and sitemap.xml.

Converting the site removed repeated layouts, navigation, footers, and project page markup. The cost is that the site now needs a build step and uses templates and front matter. I would not use an SSG for one small page or for an application with private and user-specific content.

## Extra Credit: Pagefind

After Eleventy builds the site, Pagefind creates static search files in the _site/pagefind folder. It indexed 11 pages, and the generated files are about 643 KiB in total. It does not need a search server because the browser downloads the index and performs the search directly.
