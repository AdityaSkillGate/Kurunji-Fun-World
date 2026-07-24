
const fs = require("fs");
const files = ["index.html", "about.html", "attractions.html", "gallery.html", "visit.html"];

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");

  // 1. Remove "Explore the Park" link
  content = content.replace(/<a[^>]*href="index\.html#explore"[^>]*>Explore the Park<\/a>\s*/g, "");

  // 2. Remove "Plan Your Visit" link from the regular nav flow (not the button)
  // Need to be careful not to remove it from Mobile Menu or the Button itself.
  // The nav link looks like: <a ... href="visit.html">Plan Your Visit</a>
  // Actually, we can remove it from both desktop and mobile nav, because the mobile nav also has a button!
  // Let us specifically target <a> tag with "Plan Your Visit" text.
  content = content.replace(/<a[^>]*href="visit\.html"[^>]*>\s*Plan Your Visit\s*<\/a>\s*/g, "");

  // 3. Change "360° Virtual Tour" to "360° Tour"
  content = content.replace(/360° Virtual Tour/g, "360° Tour");

  // 4. Update "Contact" links to point to contact.html instead of index.html#contact
  content = content.replace(/href="index\.html#contact"/g, `href="contact.html"`);

  fs.writeFileSync(file, content);
});
console.log("Nav update complete.");

