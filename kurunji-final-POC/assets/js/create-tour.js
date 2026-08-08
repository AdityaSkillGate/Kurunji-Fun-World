const fs = require('fs');

const attractionsHTML = fs.readFileSync('attractions.html', 'utf8');
const headStart = attractionsHTML.split('<title>')[0];
const headerMatch = attractionsHTML.match(/<\/title>([\s\S]*?)<\/header>/);
const headerContent = headerMatch[1];
const footerMatch = attractionsHTML.match(/<footer[\s\S]*?<\/html>/);
const footerContent = footerMatch[0];

const newHtml = `${headStart}<title>Virtual Park Tour | Kurunji Fun World</title>
${headerContent}</header>

    <main class="bg-surface min-h-screen pb-16">
      
      <!-- Tour Header -->
      <section class="pt-28 pb-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <h1 class="font-display-lg text-4xl md:text-5xl text-primary font-bold mb-4">Virtual Park Tour</h1>
        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">
          Explore Kurunji Fun World from the comfort of your home. Select a location below and drag to look around.
        </p>
      </section>

      <!-- 360 Viewer Container -->
      <section class="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-12">
        <div class="bg-white rounded-[32px] shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col">
          
          <!-- Location Selector Tabs -->
          <div class="bg-surface-container border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
            <div class="flex min-w-max p-2 gap-2" id="tour-tabs">
              <!-- Tabs injected via JS -->
            </div>
          </div>

          <!-- Viewer Area -->
          <div class="relative w-full aspect-square md:aspect-[21/9] bg-black overflow-hidden group">
            
            <!-- The Momento360 Iframe -->
            <iframe id="tour-iframe" src="" class="w-full h-full absolute inset-0 z-0 transition-opacity duration-500 opacity-0" frameborder="0" allowfullscreen="true" loading="lazy" title="360 Tour"></iframe>
            
            <!-- Loading Overlay -->
            <div id="tour-loader" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-charcoal-premium text-white transition-opacity duration-300">
              <span class="material-symbols-outlined text-5xl animate-spin text-primary mb-4">sync</span>
              <p class="font-bold tracking-widest uppercase text-sm">Loading Environment...</p>
            </div>

            <!-- Overlays -->
            <div class="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6 opacity-100 group-hover:opacity-0 transition-opacity duration-700">
               <div class="self-center mt-auto bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3 border border-white/20">
                  <span class="material-symbols-outlined animate-pulse">swipe</span>
                  <span class="font-bold text-sm tracking-wide">Drag or Swipe to Explore</span>
               </div>
            </div>

            <!-- Controls -->
            <button id="btn-fullscreen" class="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black text-white p-3 rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-lg group">
              <span class="material-symbols-outlined">fullscreen</span>
              <span class="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Fullscreen</span>
            </button>

          </div>
          
          <!-- Location Info -->
          <div class="p-6 md:p-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <h2 id="loc-name" class="font-headline-lg text-2xl font-bold text-on-surface">Location Name</h2>
              </div>
              <p id="loc-desc" class="text-on-surface-variant max-w-3xl">Location description goes here.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="px-margin-mobile md:px-margin-desktop text-center pb-20">
        <h3 class="text-2xl font-bold text-on-surface mb-6">Ready to experience it in person?</h3>
        <a href="visit.html" class="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-primary text-white font-bold text-lg btn-primary-gradient hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,183,209,0.3)]">
          <span class="material-symbols-outlined">local_activity</span>
          Plan Your Visit
        </a>
      </section>

    </main>
    <script src="assets/js/park-data.js"></script>
    <script src="assets/js/tour.js"></script>
${footerContent}`;

fs.writeFileSync('tour.html', newHtml);
console.log('Created tour.html');
