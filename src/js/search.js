const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("#site-search");
const searchButton = searchForm?.querySelector("button");
const searchStatus = document.querySelector("[data-search-status]");
const searchResults = document.querySelector("[data-search-results]");
let pagefindPromise;

if (searchForm && searchInput && searchButton && searchStatus && searchResults) {
    searchForm.hidden = false;
    searchStatus.textContent = "Enter a search term to begin.";
    searchForm.addEventListener("submit", searchSite);
    searchInput.addEventListener("focus", loadPagefind, { once: true });
}

function loadPagefind() {
    if (!pagefindPromise) {
        pagefindPromise = import("/pagefind/pagefind.js").then(async (pagefind) => {
            await pagefind.init();
            return pagefind;
        });
    }

    return pagefindPromise;
}

async function searchSite(event) {
    event.preventDefault();
    const query = searchInput.value.trim();

    searchResults.replaceChildren();

    if (!query) {
        searchStatus.textContent = "Enter a search term to begin.";
        searchInput.focus();
        return;
    }

    searchForm.setAttribute("aria-busy", "true");
    searchButton.disabled = true;
    searchStatus.textContent = `Searching for “${query}”...`;

    try {
        const pagefind = await loadPagefind();
        const search = await pagefind.search(query);
        const firstResults = search.results.slice(0, 20);
        const resultData = await Promise.all(
            firstResults.map((result) => result.data())
        );

        renderResults(resultData);

        const resultWord = search.results.length === 1 ? "result" : "results";
        searchStatus.textContent =
            `${search.results.length} ${resultWord} found for “${query}”.`;
    } catch (error) {
        searchStatus.textContent =
            "Search is temporarily unavailable. Please browse the sitemap instead.";
        console.warn("Pagefind search failed.", error);
    } finally {
        searchForm.removeAttribute("aria-busy");
        searchButton.disabled = false;
    }
}

function renderResults(results) {
    const fragment = document.createDocumentFragment();

    for (const result of results) {
        const item = document.createElement("li");
        const heading = document.createElement("h2");
        const link = document.createElement("a");
        const excerpt = document.createElement("p");
        const resultUrl = new URL(result.url, window.location.origin);

        link.textContent = result.meta.title || "Untitled page";
        link.href = resultUrl.origin === window.location.origin
            ? `${resultUrl.pathname}${resultUrl.search}${resultUrl.hash}`
            : "/";
        excerpt.textContent = result.plain_excerpt || "No excerpt is available.";

        heading.append(link);
        item.append(heading, excerpt);
        fragment.append(item);
    }

    searchResults.append(fragment);
}
