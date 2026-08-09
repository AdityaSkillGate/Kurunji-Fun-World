const fs = require('fs');

const attractionsHTML = fs.readFileSync('attractions.html', 'utf8');

// Extract head (up to <title>)
const headStart = attractionsHTML.split('<title>')[0];

// Extract head end and header
const headerMatch = attractionsHTML.match(/<\/title>([\s\S]*?)<\/header>/);
const headerContent = headerMatch[1];

// Extract footer
const footerMatch = attractionsHTML.match(/<footer[\s\S]*?<\/html>/);
const footerContent = footerMatch[0];

const newHtml = `${headStart}<title>Attraction Details | Kurunji Fun World</title>
    <!-- Dynamic SEO Injection -->
    <script src="assets/js/park-data.js"><\/script>
    <script>
      (function() {
        if (typeof window.KurunjiData !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const slug = params.get('slug');
          if (slug) {
            const attraction = window.KurunjiData.helpers.getAttractionBySlug(slug);
            if (attraction) {
              document.title = attraction.name + ' | Kurunji Fun World';
              
              // Add meta description dynamically
              const metaDesc = document.createElement('meta');
              metaDesc.name = "description";
              metaDesc.content = attraction.shortDescription || "Experience " + attraction.name + " at Kurunji Fun World Kodaikanal.";
              document.head.appendChild(metaDesc);
            }
          }
        }
      })();
    </script>
${headerContent}</header>

    <main class="pt-24 pb-12 bg-surface min-h-screen">
      
      <!-- 404 Empty State -->
      <section id="error-state" class="hidden flex-col items-center justify-center py-32 px-4 text-center max-w-2xl mx-auto">
        <span class="material-symbols-outlined text-8xl text-outline mb-6">explore_off</span>
        <h1 class="font-headline-lg text-3xl font-bold text-on-surface mb-4">Attraction Not Found</h1>
        <p class="text-on-surface-variant text-lg mb-8">We couldn't find the attraction you're looking for. It may have been moved or removed.</p>
        <a href="attractions.html" class="px-8 py-4 rounded-full bg-primary text-white font-bold btn-primary-gradient hover:scale-105 transition-transform flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Explorer
        </a>
      </section>

      <!-- Main Detail Content -->
      <div id="detail-content" class="hidden opacity-0 transition-opacity duration-500">
        
        <!-- Breadcrumb -->
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-6">
          <nav class="flex text-sm font-label-md text-on-surface-variant" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              <li class="inline-flex items-center">
                <a href="index.html" class="hover:text-primary transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">home</span> Home
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <span class="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <a href="attractions.html" class="hover:text-primary transition-colors">Attractions</a>
                </div>
              </li>
              <li aria-current="page">
                <div class="flex items-center">
                  <span class="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span class="text-primary font-bold" id="bread-name">Detail</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <!-- Hero Section -->
        <section class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-12">
          <div class="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-container to-primary shadow-lg flex items-center justify-center" id="hero-bg">
            <span class="material-symbols-outlined text-white/40 text-9xl" id="hero-icon">local_play</span>
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            
            <div class="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div class="flex flex-wrap gap-2 mb-4" id="badge-container">
                  <!-- Badges injected via JS -->
                </div>
                <h1 class="text-3xl md:text-5xl font-display-lg text-white font-bold leading-tight" id="detail-name">
                  Attraction Name
                </h1>
              </div>
              
              <div class="flex gap-3">
                <button id="btn-360" class="hidden px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-bold border border-white/30 hover:bg-white hover:text-charcoal-premium transition-colors items-center gap-2">
                  <span class="material-symbols-outlined text-[20px]">360</span>
                  View 360
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Content Grid -->
        <section class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-20">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            <!-- Left Column: Description -->
            <div class="lg:col-span-2 space-y-10">
              
              <!-- About -->
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/20">
                <h2 class="text-2xl font-headline-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">info</span>
                  About this Experience
                </h2>
                <p class="text-on-surface-variant leading-relaxed text-lg" id="detail-desc">
                  Full description goes here.
                </p>
              </div>

              <!-- Media Gallery (Fallback to Empty State) -->
              <div class="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/20">
                <h2 class="text-2xl font-headline-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">photo_library</span>
                  Gallery & Media
                </h2>
                
                <div id="media-grid" class="hidden grid grid-cols-2 gap-4">
                  <!-- Images injected here if any -->
                </div>

                <div id="media-empty" class="flex flex-col items-center justify-center py-10 bg-surface-container rounded-2xl border border-dashed border-outline-variant/50">
                  <span class="material-symbols-outlined text-4xl text-outline mb-2">image_not_supported</span>
                  <p class="text-on-surface-variant font-medium">Media coming soon</p>
                </div>
              </div>

            </div>

            <!-- Right Column: Sidebar Actions -->
            <div class="space-y-6">
              
              <div class="bg-primary/5 p-8 rounded-3xl border border-primary/20 sticky top-28">
                <h3 class="text-xl font-bold text-primary mb-6">Ready to play?</h3>
                
                <div class="space-y-4">
                  <a href="visit.html" class="w-full px-6 py-4 rounded-xl bg-primary text-white font-bold btn-primary-gradient hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">local_activity</span>
                    Plan Your Visit
                  </a>
                  
                  <a href="attractions.html" class="w-full px-6 py-4 rounded-xl bg-white text-on-surface font-bold border border-outline-variant/30 hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">grid_view</span>
                    Explore More
                  </a>
                  
                  <hr class="border-outline-variant/20 my-4" />
                  
                  <a href="feedback.html" class="w-full px-6 py-3 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-outline-variant/20 transition-colors flex items-center justify-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-[18px]">rate_review</span>
                    Give Feedback
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

        <!-- Related Experiences -->
        <section class="bg-white py-16 border-t border-outline-variant/20">
          <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 class="text-2xl md:text-3xl font-headline-lg font-bold text-on-surface mb-8">You might also like</h2>
            <div id="related-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Related cards injected via JS -->
            </div>
          </div>
        </section>

      </div>
    </main>
    <script src="assets/js/attraction-detail.js"></script>
${footerContent}`;

fs.writeFileSync('attraction.html', newHtml);
console.log('Created attraction.html');
