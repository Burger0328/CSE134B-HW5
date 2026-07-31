export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/files");
    eleventyConfig.addGlobalData("siteUrl", process.env.URL || "http://localhost:8080");

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk"
    };
}
