const fs = require('fs');

const attractionsHTML = fs.readFileSync('attractions.html', 'utf8');
const headStart = attractionsHTML.split('<title>')[0];
const headerMatch = attractionsHTML.match(/<\/title>([\s\S]*?)<\/header>/);
const headerContent = headerMatch[1];
const footerMatch = attractionsHTML.match(/<footer[\s\S]*?<\/html>/);
const footerContent = footerMatch[0];

const newHtml = `${headStart}<title>VR 360 Experience | Kurunji Fun World</title>
${headerContent}</header>

    <main class="bg-charcoal-premium min-h-screen text-mist-white overflow-hidden">
      
      <!-- Cinematic Hero -->
      <section class="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <!-- Abstract VR Background -->
        <div class="absolute inset-0 z-0">
          <div class="w-full h-full bg-gradient-to-br from-charcoal-premium via-indigo-900 to-black scale-105"></div>
          <!-- Grid Overlay for futuristic look -->
          <div class="absolute inset-0" style="background-image: radial-gradient(circle at center, transparent 0%, #1A1D1F 100%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px;"></div>
        </div>
        
        <div class="relative z-10 text-center px-margin-mobile max-w-4xl mx-auto">
          <span class="inline-flex items-center justify-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/40 px-4 py-2 rounded-full text-primary-fixed text-sm uppercase tracking-widest font-bold mb-6 animate-pulse">
            <span class="material-symbols-outlined text-lg">vrpano</span>
            GROUND FLOOR ATTRACTION
          </span>
          <h1 class="font-display-lg text-[50px] md:text-[80px] text-white mb-4 drop-shadow-2xl leading-none font-extrabold tracking-tighter" style="text-shadow: 0 0 40px rgba(74, 215, 242, 0.5);">
            VR 360
          </h1>
          <p class="font-body-lg text-xl md:text-2xl text-primary-fixed font-semibold mb-2 tracking-wide">
            40+ Immersive Themes
          </p>
          <p class="text-surface-variant max-w-2xl mx-auto mb-10 text-lg">
            Step into another world. From walking with dinosaurs to floating through space, our state-of-the-art VR simulator offers an unparalleled immersive experience.
          </p>
          
          <a href="#vr-universe" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold btn-primary-gradient hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,183,209,0.4)]">
            Explore Themes <span class="material-symbols-outlined">expand_more</span>
          </a>
        </div>
      </section>

      <!-- VR Theme Explorer -->
      <section id="vr-universe" class="py-24 relative z-10">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          
          <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 class="font-headline-xl text-3xl md:text-5xl text-white font-bold mb-4">EXPLORE THE VR UNIVERSE</h2>
              <p class="text-surface-variant text-lg">Discover our curated selection of virtual realities.</p>
            </div>
            
            <!-- Search -->
            <div class="w-full md:w-72 relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
              <input type="text" id="vr-search" placeholder="Search themes..." class="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-primary-fixed outline-none transition-all backdrop-blur-md" />
            </div>
          </div>

          <!-- Dynamic Filters (Injected via JS) -->
          <div class="mb-10 overflow-x-auto no-scrollbar pb-2">
            <div class="flex gap-3 min-w-max" id="vr-filters">
              <button data-filter="all" class="px-6 py-2.5 rounded-full font-bold transition-all bg-primary-fixed text-charcoal-premium shadow-md">All Themes</button>
              <!-- Category buttons injected here -->
            </div>
          </div>

          <!-- Featured Theme Spotlight -->
          <div id="featured-spotlight" class="mb-16 hidden">
             <!-- Injected via JS -->
          </div>

          <!-- Grid Container -->
          <div id="vr-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <!-- Cards rendered by JS -->
          </div>

          <!-- Data-driven Placeholder -->
          <div class="bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <span class="material-symbols-outlined text-5xl text-primary-fixed mb-4 opacity-80">view_comfy_alt</span>
            <h3 class="text-2xl font-bold text-white mb-2">More immersive themes available!</h3>
            <p class="text-surface-variant max-w-lg mx-auto">We have a total of 40+ VR experiences. The remaining <span id="remaining-count" class="text-primary-fixed font-bold">34</span> themes will be updated here soon. Ask our staff to explore the full library during your visit!</p>
          </div>

        </div>
      </section>

    </main>
    <script src="assets/js/park-data.js"></script>
    <script src="assets/js/vr-explorer.js"></script>
${footerContent}`;

fs.writeFileSync('vr-360.html', newHtml);
console.log('Created vr-360.html');
