export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/uploads");

  // Локальна адмінка Decap потрібна лише для `npm run dev`.
  // У CI задано PATH_PREFIX — тоді /admin не потрапляє в опублікований сайт.
  if (process.env.PATH_PREFIX) {
    eleventyConfig.ignores.add("src/admin/**");
  } else {
    eleventyConfig.addPassthroughCopy("src/admin");
  }

  // 01.01.2000 → формат дат на табличках
  eleventyConfig.addFilter("dateUA", (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return String(value);
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getUTCFullYear()}`;
  });

  // Поле unit може бути слагом ("bryhada-zrazok", так пише Decap)
  // або шляхом ("src/units/2026-08-18-nazva.md", так пише Pages CMS).
  // Eleventy у fileSlug відкидає датний префікс, тому відкидаємо його й тут.
  const unitKey = (v) =>
    String(v || "")
      .split("/")
      .pop()
      .replace(/\.md$/, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "");

  eleventyConfig.addFilter("withUnit", (fallen, unitSlug) =>
    (fallen || []).filter((p) => unitKey(p.data.unit) === unitKey(unitSlug))
  );

  eleventyConfig.addCollection("units", (api) =>
    api
      .getFilteredByGlob("src/units/*.md")
      .sort((a, b) => (a.data.order || 999) - (b.data.order || 999))
  );

  eleventyConfig.addCollection("fallen", (api) =>
    api
      .getFilteredByGlob("src/fallen/*.md")
      .sort((a, b) =>
        (a.data.name || "").localeCompare(b.data.name || "", "uk")
      )
  );

  return {
    dir: { input: "src", includes: "_includes" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
