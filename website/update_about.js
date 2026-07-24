
const fs = require("fs");
const file = "about.html";
let content = fs.readFileSync(file, "utf8");

const newMain = `<main>
      <!-- About Hero -->
      <section class="relative pt-40 pb-20 w-full flex items-center justify-center overflow-hidden bg-charcoal-premium">
        <div class="absolute inset-0 z-0">
          <div class="w-full h-full bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB53PL226Ug8Lk0kFnik6VZVQYtXVnOFZySJadvTZARYqsTYvzasEsjIdQwUargmiySXrbGHQoRsBB3rZndgNO6KoF-8HLXlclpnh52jFjyHICuJJ4RbkvwhCkJIqj5NvDdxv9p8Q8Y4zpNtrC2gpPUPH3omxS_-J-DdQIZ67Bcnoo4aAlCFTC-WFYDTgnoU7tejofOKUugKOMQY0_UlgRSmfXOTRaUaMMnxL-9YKm8aKT9OpxiGF2e5g');"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-charcoal-premium"></div>
        </div>
        <div class="relative z-10 text-center px-margin-mobile max-w-4xl mx-auto mt-10">
          <h1 class="font-display-lg text-[40px] md:text-display-lg text-white mb-6 drop-shadow-lg leading-tight">
            Discover <span class="text-primary-fixed">Kurunji Fun World</span>
          </h1>
          <p class="font-body-lg text-body-lg text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            Kodaikanal's premiere indoor entertainment destination.
            Unforgettable experiences for the whole family, no matter the
            weather.
          </p>
        </div>
      </section>

      <!-- Our Mission & Vision -->
      <section class="py-stack-lg bg-mist-white relative z-10 -mt-10 rounded-t-[3rem]">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mb-6">Our Mission</h2>
              <p class="text-on-surface-variant font-body-md mb-6 leading-relaxed">
                At Kurunji Fun World, our mission is simple: to bring endless joy and world-class entertainment to families visiting Kodaikanal. We realized that while Kodaikanal is beautiful, unpredictable weather can often ruin vacation plans. We built this space so that your fun never has to stop, come rain or shine.
              </p>
              <p class="text-on-surface-variant font-body-md leading-relaxed">
                By combining thrilling modern attractions like Virtual Reality with classic family favorites like arcade games and bumper cars, we strive to create an inclusive environment where every generation can find something to love.
              </p>
            </div>
            <div class="rounded-3xl overflow-hidden shadow-lg h-80">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFD3ebzzc-7Bp9SB6VhJcf_nbK9TVQc1Cr27zdXsU63yP8uLAC_PAoCnYoy3tzhaW7PchyeOMz9FLEnZ9F5HM4EtknUPdNS1xr_doiXreUqfjzSyEFaCaHE3cIvzH9zJ7ayVwoHlb5GP6B1h7gdegb0p7lzpBCaswMjCjSZQoPmOODA_pS1foJnPbEoCAHAknV6jcYFaGCLGMS0WyNt5TbR4-3f520AoQYDWIA0Ubnz4lZbq5dBkEfzQ" alt="Happy family at Kurunji Fun World" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="py-stack-lg bg-white relative">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div class="text-center mb-16 max-w-3xl mx-auto">
            <h2 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mb-4">Why Families Choose Us</h2>
            <p class="text-on-surface-variant font-body-md">We've engineered the perfect environment for a stress-free, high-energy day out.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-mist-white p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <span class="material-symbols-outlined text-4xl text-primary mb-6">wb_sunny</span>
              <h3 class="font-headline-lg text-2xl text-on-surface mb-4">100% Weatherproof</h3>
              <p class="text-on-surface-variant font-body-md">
                Our fully climate-controlled indoor arena guarantees that your vacation plans remain uninterrupted, no matter the mist or rain outside.
              </p>
            </div>
            <div class="bg-mist-white p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <span class="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
              <h3 class="font-headline-lg text-2xl text-on-surface mb-4">Uncompromising Safety</h3>
              <p class="text-on-surface-variant font-body-md">
                Your family's safety is our highest priority. All our equipment is globally sourced, rigorously tested, and monitored by our trained staff.
              </p>
            </div>
            <div class="bg-mist-white p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <span class="material-symbols-outlined text-4xl text-primary mb-6">diversity_1</span>
              <h3 class="font-headline-lg text-2xl text-on-surface mb-4">Fun For All Ages</h3>
              <p class="text-on-surface-variant font-body-md">
                From soft-play zones for toddlers to high-octane VR experiences for teens and adults, there is literally something for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- CTA -->
      <section class="py-stack-lg bg-charcoal-premium text-center px-margin-mobile">
        <h2 class="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-white mb-6">Ready for an Unforgettable Day?</h2>
        <p class="text-white/80 font-body-md mb-8 max-w-2xl mx-auto">Skip the lines and maximize your time in Kodaikanal. Plan your visit today.</p>
        <button class="bg-primary text-white font-label-md px-10 py-4 rounded-full btn-primary-gradient shadow-lg hover:scale-105 transition-transform" onclick="window.location.href = 'visit.html'">
          Plan Your Visit Now
        </button>
      </section>
    </main>`;

// Use regex to replace the entire <main> tag and its contents.
content = content.replace(/<main>[\s\S]*?<\/main>/, newMain);

fs.writeFileSync(file, content);
console.log("About page updated");

