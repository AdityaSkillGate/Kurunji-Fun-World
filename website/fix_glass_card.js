
const fs = require("fs");
const file = "index.html";
let content = fs.readFileSync(file, "utf8");

// We want to change the positioning of the Floating Info Bar so it does not look weird on mobile.
// Currently: class="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-container-max z-20"
// On mobile, let us make it relative and pull it up slightly with negative margin, so it sits on the white background properly, or just make it solid white on mobile.
// Wait, actually, let us change `glass-card` to `bg-white md:bg-white/70`?
// No, the class is just "glass-card". We can add "bg-white md:!bg-transparent" to make it solid white on mobile, and glass on desktop.
// Or we can just adjust its position.
// Let us replace `glass-card rounded-2xl` with `glass-card bg-white/90 md:bg-white/70 backdrop-blur-xl rounded-2xl` 
// Let us see the exact line:
content = content.replace(
  /class="glass-card rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-gutter divide-x divide-outline-variant\/30 items-center shadow-xl"/g,
  `class="glass-card bg-white/95 md:bg-white/70 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-gutter divide-x divide-outline-variant/30 items-center shadow-xl"`
);

fs.writeFileSync(file, content);
console.log("Fixed glass card background");

