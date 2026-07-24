
const fs = require("fs");
const file = "index.html";
let content = fs.readFileSync(file, "utf8");

const mobileMenuScript = `
      // Mobile Menu Logic
      const mobileMenuBtn = document.getElementById("mobile-menu-btn");
      const mobileMenu = document.getElementById("mobile-menu");
      let isMenuOpen = false;

      if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
          isMenuOpen = !isMenuOpen;
          if (isMenuOpen) {
            mobileMenu.classList.remove("opacity-0", "pointer-events-none");
            mobileMenu.classList.add("opacity-100", "pointer-events-auto");
            document.body.style.overflow = "hidden";
            mobileMenuBtn.innerHTML =
              "<span class=\"material-symbols-outlined text-3xl\">close</span>";
            mobileMenuBtn.setAttribute("aria-expanded", "true");
          } else {
            closeMobileMenu();
          }
        });
      }

      function closeMobileMenu() {
        if (!mobileMenuBtn || !mobileMenu) return;
        isMenuOpen = false;
        mobileMenu.classList.add("opacity-0", "pointer-events-none");
        mobileMenu.classList.remove("opacity-100", "pointer-events-auto");
        document.body.style.overflow = "";
        mobileMenuBtn.innerHTML =
          "<span class=\"material-symbols-outlined text-3xl\">menu</span>";
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
`;

content = content.replace(/<\/script>\s*<\/body>/, mobileMenuScript + "\n    </script>\n  </body>");
fs.writeFileSync(file, content);
console.log("Fixed mobile menu in index.html");

