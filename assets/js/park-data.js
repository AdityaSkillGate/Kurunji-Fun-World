/**
 * KURUNJI FUN WORLD - CENTRAL DATA ARCHITECTURE
 * Single Source of Truth for all park attractions, facilities, and media.
 */

const KurunjiData = {
    metadata: {
        totalExperiences: 31,
        indoorCount: 23,
        outdoorCount: 8,
        floors: 2,
        parkingSpaces: "100+",
        lastUpdated: new Date().toISOString()
    },

    /**
     * ATTRACTIONS
     * Schema: id, slug, name, type (indoor/outdoor/vr), location, floor (ground/first/outdoor), 
     * category, shortDescription, description, images[], videos[], panorama, featured, status (active/coming-soon/hidden), displayOrder
     */
    attractions: [
        // ==========================================
        // GROUND FLOOR - 20 Experiences
        // ==========================================
        {
            id: "A-01", slug: "massage-chair", name: "Massage Chair",
            type: "indoor", location: "Indoor", floor: "ground", category: "Relaxation",
            shortDescription: "Relax with a mountain view.",
            description: "Unwind in our premium massage chairs while enjoying the breathtaking mountain views of Kodaikanal.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786262513/massage-char_vzsbmm.png"], videos: [], panorama: "",
            featured: true, status: "active", displayOrder: 1
        },
        {
            id: "A-02", slug: "play-with-me", name: "Play With Me",
            type: "indoor", location: "Indoor", floor: "ground", category: "Interactive",
            shortDescription: "Fun interactive experience.", description: "A highly interactive experience designed for all ages.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786264010/massage-char_1_wmxnyc.png"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 2
        },
        {
            id: "A-03", slug: "boxer", name: "Boxer",
            type: "indoor", location: "Indoor", floor: "ground", category: "Arcade",
            shortDescription: "Test your punching strength.", description: "Step up and test your strength with the classic Boxer arcade machine.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786457785/Untitled_design_1_kllmsc.png","https://res.cloudinary.com/dfetzuxxx/image/upload/v1786457879/IMG_20260807_184619_zhm8tr.jpg"], videos: ["https://res.cloudinary.com/dfetzuxxx/video/upload/v1786457952/video_20260807_184902_ecvqve.mp4"], panorama: "", featured: false, status: "active", displayOrder: 3
        },
        {
            id: "A-04", slug: "down-the-clown", name: "Down the Clown",
            type: "indoor", location: "Indoor", floor: "ground", category: "Arcade",
            shortDescription: "Classic carnival throwing game.", description: "Knock down the clowns to score points and win tickets.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786458523/Untitled_design_3_mo0cvj.png"], videos: ["https://res.cloudinary.com/dfetzuxxx/video/upload/v1786459777/Attractions_fy8cok.mp4"], panorama: "", featured: false, status: "active", displayOrder: 4
        },
        {
            id: "A-05", slug: "basketball", name: "Basketball",
            type: "indoor", location: "Indoor", floor: "ground", category: "Sports",
            shortDescription: "Shoot hoops and set high scores.", description: "Beat the buzzer in our fast-paced arcade basketball challenge.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuB3w6UTTlB0A2b0aHKdyd88vJds2yUXLMgR6PP30yqLcFvl8uL5KyhN6VZXCgXM2AwLvu0-WNYBXdugAd6uhZ2_iuj3UCJAVoR-hqnKP7o-C4IjraErtsfJmdfD0u47ZB18Sc8fgd57QTOqz4t98n6UkKVbrx6rP2zLv82tEO8Wl5tuy17reUKKGIuDZOqtSNIuc__0GwQMz4KE-srpgVAlNBv1FUsPikx5NYufAxdbQoDoRqoaU3LAlg"], videos: [], panorama: "", featured: true, status: "active", displayOrder: 5
        },
        {
            id: "A-06", slug: "pink-love", name: "Pink Love",
            type: "indoor", location: "Indoor", floor: "ground", category: "Claw",
            shortDescription: "Try to win a cute plushie.", description: "A beautifully themed claw machine filled with premium prizes.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786458818/Untitled_design_4_ccc9zn.png"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 6
        },
        {
            id: "A-07", slug: "space-catcher", name: "Space Catcher",
            type: "indoor", location: "Indoor", floor: "ground", category: "Claw",
            shortDescription: "Space-themed prize catcher.", description: "Test your precision and grab out-of-this-world prizes.",
            images: ["https://res.cloudinary.com/dfetzuxxx/image/upload/v1786459036/Untitled_design_5_knyeth.png"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 7
        },
        {
            id: "A-08", slug: "snail-times", name: "Snail Times",
            type: "indoor", location: "Indoor", floor: "ground", category: "Kids",
            shortDescription: "Gentle fun for the little ones.", description: "A safe, slow-paced, and colorful ride perfect for toddlers.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC3tIjvUYlikY7t3mi5DRvfDoaJNWVICiTyyWqjGvLzZrFAgVojTF-pSRYJ9ZJvLcA7xOm1Gpt8bbYspFRE93fF7-8OJWtx3oU0BDTZ7je_5WlnqaG0ooMGerpRpXXKvazzOvCKnj2_bTMfER4P1DHodFSJMN8SF_92WL29hjbZbqwoRTGBkV1H4irNYCIe_tT2QfyDE-Q8ZNgb8MR6PRML1__iAQbwcvvtGt2Y6_q5VMtnhrLwugv-KQ"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 8
        },
        {
            id: "A-09", slug: "big-boss", name: "Big Boss",
            type: "indoor", location: "Indoor", floor: "ground", category: "Interactive",
            shortDescription: "Take charge and play like a boss.", description: "An interactive arcade game where you make the big decisions.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCHQ-Z7gMYX3s-qSygqg2d9-Q9A149yzH9AZypUkZM3QkkDefeZqNsQA9grXlNL_-ChkYWQZ0rhk3B9uRHmzo6YLbAKeco6Xf_50KMe0WudEXdMnP4UJYeoiDIhYA5jV_CyJXCwM3Hx-tCYiaetdmSKYyKok3Y6r_IkzPUP6gpLH13GQcp5ZVDD_tTVaW1nPi0LkZC3YyNuz-H5qBb5tAaZH3DhanwlyeCMsxhIX8tfIS7jLIIX-L9wQw"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 9
        },
        {
            id: "A-10", slug: "passion-blasting", name: "Passion Blasting",
            type: "indoor", location: "Indoor", floor: "ground", category: "Shooter",
            shortDescription: "Intense arcade shooting action.", description: "Lock and load in this intense, high-energy arcade shooter.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 10
        },
        {
            id: "A-11", slug: "vr-360", name: "VR 360",
            type: "vr", location: "Indoor", floor: "ground", category: "VR",
            shortDescription: "Immersive 360 virtual reality experiences with 40+ themes.", description: "Step into another world with our state-of-the-art VR 360 simulator featuring over 40 distinct virtual environments.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCwu4hp34A-Y6EaDxqgHHBVINlg4uhE65GhjSeTksz_SLh0PDV5eL_xKGHnH-RRMv1fZqSKr9IARFaHNH4_As_ktkYc4n8lPLYk47ZB7H8wi6S7_vWhdK7DRybqdlrD7ob91fuk4Yy8yjDLdsxiw_Ea5y7Aqc_ODhdbBuGMDx5rk4tWvCsZwA4hr3HmBf84OSSSIr9O_ZJAQc68r10SbjKyKUAWCV8S48UOjPrCYaTiYZGDXbk-_xY92g"], videos: [], panorama: "", featured: true, status: "active", displayOrder: 11
        },
        {
            id: "A-12", slug: "rescue", name: "Rescue",
            type: "indoor", location: "Indoor", floor: "ground", category: "Shooter",
            shortDescription: "Save the day in this action game.", description: "Become the hero in this immersive arcade rescue mission.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 12
        },
        {
            id: "A-13", slug: "crazy-ball", name: "Crazy Ball",
            type: "indoor", location: "Indoor", floor: "ground", category: "Interactive",
            shortDescription: "Fast-paced ball action.", description: "Keep your reflexes sharp in this rapid-fire ball game.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC6GBSHtZDP0RCCnH7p-eDHhwmJrMCsCDon2KydgFXVIRA_S03L3DYDkTNPu0WxPaKM8VsbllH5Kmob7QYSyyyaQBdt15DF964J-4Eqdfzkx4nKgvcoTNPF-s9hJsLcjc7UQXY_aiwMCSBJoKqBTwGBz_K_ZXOXLjuGvkKHVMsNWSAlxuJP4itNf3BC05kTkn8guMCtW9N8S_c9sipJS5_kwEg4mO0hj-txzOr3RVnZF-VZX9sy80-tOw"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 13
        },
        {
            id: "A-14", slug: "wave-riders", name: "Wave Riders",
            type: "indoor", location: "Indoor", floor: "ground", category: "Simulator",
            shortDescription: "Ride the digital waves.", description: "Experience the thrill of the ocean without getting wet.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 14
        },
        {
            id: "A-15", slug: "vr-4-seater", name: "VR 4 Seater",
            type: "vr", location: "Indoor", floor: "ground", category: "VR",
            shortDescription: "Group virtual reality adventure.", description: "Share the VR thrill with friends and family in our 4-seater immersive pod.",
            images: [], videos: [], panorama: "", featured: true, status: "active", displayOrder: 15
        },
        {
            id: "A-16", slug: "ace-shooter", name: "Ace Shooter",
            type: "indoor", location: "Indoor", floor: "ground", category: "Shooter",
            shortDescription: "Show off your marksmanship.", description: "Aim for the high score in this competitive arcade marksman game.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 16
        },
        {
            id: "A-17", slug: "crusin-blast", name: "Crusin Blast",
            type: "indoor", location: "Indoor", floor: "ground", category: "Racing",
            shortDescription: "High-speed arcade racing.", description: "Burn rubber and drift through extreme tracks in Crusin Blast.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBk9YcCKiEQxDcXoffBAkWyJM664LZhBbCZt5NqiVGZr-OKEdjo7JW-jR0zHHbEMuwqUbU0DxfLnV8N8gFRq8ktkueA22z_5BQhVehpLvTvGzYibNLhe_VJl57s3iL4SL0b0mls1lEbYgdHuPne3KJmufarAP56PKdtuzLQxk1EV4l3MgoGV2u10GCjt4EZaBEi_UORoUyTYeCy0GZHuwzBpMtZ6YtI8L9ZExC2r_w6_x_F-2oeQ-_5_g"], videos: [], panorama: "", featured: true, status: "active", displayOrder: 17
        },
        {
            id: "A-18", slug: "super-moto", name: "Super Moto",
            type: "indoor", location: "Indoor", floor: "ground", category: "Racing",
            shortDescription: "Motorcycle racing simulator.", description: "Lean into the curves and feel the speed on our realistic superbike simulator.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 18
        },
        {
            id: "A-19", slug: "power-hockey", name: "Power Hockey",
            type: "indoor", location: "Indoor", floor: "ground", category: "Sports",
            shortDescription: "Air hockey with a competitive edge.", description: "Challenge a friend to a fast-paced game of classic air hockey.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 19
        },
        {
            id: "A-20", slug: "horse-ride", name: "Horse Ride",
            type: "indoor", location: "Indoor", floor: "ground", category: "Kids",
            shortDescription: "Classic horse riding fun for kids.", description: "A gentle, classic mechanical horse ride that kids love.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 20
        },

        // ==========================================
        // FIRST FLOOR - 3 Experiences
        // ==========================================
        {
            id: "B-01", slug: "ball-pool", name: "Ball Pool",
            type: "indoor", location: "Indoor", floor: "first", category: "Kids Play",
            shortDescription: "Dive into a massive sea of colorful balls.", description: "A huge, safe, and hygienic ball pool perfect for energetic kids to jump and play in.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuB1rfXh_vmQ0Mo0zM_9Illa4v5Iy7CPKol7qtzoeVwJgONEuHDwHlnoYylx6tLGI42Y3S69xpPaUjTXMM_jDNqcrgYTTfLkaPDaKeSap0XpC8hL2kwMFXxR79fSPMh-KQqH2dI75xcsoCyE-rKaSENvFokGo0Gs_pDoV0AQvqCLdRUnjq9ErBiav-1dEAcLZjoR57Q04_n27xyf3JWekPnz-IgH-JT6NR2_CssV3QTviqhg42ujOz7NOA", "https://lh3.googleusercontent.com/aida-public/AB6AXuDzASf6PeZ5vgmk4MM6J2lqBkVteSuypVM-ON5KCbVEk19Qi5IrevtfJqcDdHC6N4tW3B0kIQXwJy8HL5eXSAY2Mo3h1VAJRlu_RFUUw1Nf34xFhw3q-UB2_lsZ4F8jLEbXmjbrvDowxT8kMv4vMtolbCfWVMPkBnHtvkFy57JAK4ZqiGckSKuQb2RxZTXZn737HaK45pSNP5wBCGu-n_NdnHcRDK--4ADnvP_jgLCIXC8Kbj5Z8BavWw"], videos: [], panorama: "", featured: true, status: "active", displayOrder: 21
        },
        {
            id: "B-02", slug: "trampoline", name: "Trampoline",
            type: "indoor", location: "Indoor", floor: "first", category: "Active",
            shortDescription: "Bounce to your heart's content.", description: "Defy gravity on our expansive indoor trampoline park.",
            images: [], videos: [], panorama: "", featured: true, status: "active", displayOrder: 22
        },
        {
            id: "B-03", slug: "ninja", name: "Ninja",
            type: "indoor", location: "Indoor", floor: "first", category: "Active",
            shortDescription: "Test your agility on the Ninja course.", description: "Swing, climb, and jump through our challenging indoor ninja obstacle course.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCYxbSxotrL1ZU9OpvhH6CpuYnMtEkGQbUtHJt5qXj1F71IUnfaqDWI3MjSoAB-yzlmlwyadnAaKd0eR-wAt68Urex09CdVWuJYbITDqMOYdIbUAeJFdcs9pzd14-h2187bd1Tu2ss8kLWACmSlduO1MWMGElSA6V_DVFuv6Lm4AO8lwcS7b2kjZpzo0cXD3J7Z6JzITDgeQkIS7gKP-HK18QREYZhX5yXo9FGIA89VjmWH2VljEN6AXw"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 23
        },

        // ==========================================
        // OUTDOOR - 8 Experiences
        // ==========================================
        {
            id: "C-01", slug: "crazy-roller", name: "Crazy Roller",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "A dizzying, exciting rolling experience.", description: "Step inside and roll around in our large outdoor crazy rollers.",
            images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAMEHzIOL83FVCHP2kI-LcFrcpJ2BKTHUs4s9_JsaEzn5mDZFfbsf-d9vT6aiG4ILfh0Idi_MpFdDYFClug95eYbnVspyLUUdxTjhk83EvcYpT2-ND9UoH5hKW_Q72_BNBHbKc68Vsoa6ikBP4FsWEhg-TrhLOMf6ZhPgIqe40L7lp9wqeQpdqQuG8KluEUO3NytWGZaw8wRmAQbQl_pCHEJz_CVkhwEt9WkNlNuePMG48q3QVl-4Fn5w"], videos: [], panorama: "", featured: false, status: "active", displayOrder: 24
        },
        {
            id: "C-02", slug: "360-cycle-ride", name: "360 Cycle Ride",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "Pedal your way to a full 360 loop.", description: "Use your own power to pedal your cycle into a complete 360-degree loop.",
            images: [], videos: [], panorama: "", featured: true, status: "active", displayOrder: 25
        },
        {
            id: "C-03", slug: "human-gyro-360", name: "Human Gyro 360",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "Experience astronaut training gravity.", description: "Spin in every direction on our thrilling 3-axis human gyroscope.",
            images: [], videos: [], panorama: "", featured: true, status: "active", displayOrder: 26
        },
        {
            id: "C-04", slug: "bull-ride", name: "Bull Ride",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Challenge",
            shortDescription: "Hold on tight and beat the mechanical bull.", description: "Test your balance and grip on our bucking mechanical bull.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 27
        },
        {
            id: "C-05", slug: "bungee-trampoline", name: "Bungee Trampoline",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Active",
            shortDescription: "Jump higher than ever safely harnessed.", description: "Perform flips and massive jumps with the safety of a bungee harness.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 28
        },
        {
            id: "C-06", slug: "zero-gravity", name: "Zero Gravity",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "Defy gravity on this intense ride.", description: "Feel the G-forces as you spin and stick to the walls in Zero Gravity.",
            images: [], videos: [], panorama: "", featured: true, status: "active", displayOrder: 29
        },
        {
            id: "C-07", slug: "rocket-ejecter", name: "Rocket Ejecter",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "Launch straight up into the Kodaikanal sky.", description: "Experience a sudden rush of adrenaline as you are launched high into the air.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 30
        },
        {
            id: "C-08", slug: "meltdown", name: "MeltDown",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Challenge",
            shortDescription: "Jump and duck to survive the sweeping arms.", description: "An 8-player action game where you must jump and duck to avoid the sweeping mechanical arms.",
            images: [], videos: [], panorama: "", featured: false, status: "active", displayOrder: 31
        },

        // ==========================================
        // UPCOMING ATTRACTIONS
        // ==========================================
        {
            id: "UP-01", slug: "zipline", name: "Zipline",
            type: "outdoor", location: "Outdoor", floor: "outdoor", category: "Thrill",
            shortDescription: "Fly across the park with stunning views.", description: "An upcoming high-altitude zipline offering incredible views of Kodaikanal.",
            images: [], videos: [], panorama: "", featured: true, status: "coming-soon", displayOrder: 99
        },
        {
            id: "UP-02", slug: "indoor-roller-coaster", name: "Indoor Roller Coaster",
            type: "indoor", location: "Indoor", floor: "ground", category: "Thrill",
            shortDescription: "The ultimate indoor thrill ride.", description: "A fast-paced, twisting indoor roller coaster coming soon to the ground floor.",
            images: [], videos: [], panorama: "", featured: true, status: "coming-soon", displayOrder: 100
        }
    ],

    /**
     * VR 360 THEMES
     */
    vrThemes: [
        { id: "VR-01", name: "Lost in Space", image: "", video: "", shortDescription: "Navigate through asteroid fields and unknown galaxies.", category: "Space", featured: true, status: "active" },
        { id: "VR-02", name: "Tyrannosaurus Kingdom", image: "", video: "", shortDescription: "Come face to face with the king of the dinosaurs.", category: "Dinosaur", featured: true, status: "active" },
        { id: "VR-03", name: "Snow Valley Coaster", image: "", video: "", shortDescription: "A thrilling ride down a treacherous snowy mountain.", category: "Adventure", featured: false, status: "active" },
        { id: "VR-04", name: "Solar System Tourism", image: "", video: "", shortDescription: "Take a relaxing tour around our solar system.", category: "Space", featured: false, status: "active" },
        { id: "VR-05", name: "Ocean Adventure", image: "", video: "", shortDescription: "Dive deep into the mysterious ocean depths.", category: "Ocean", featured: false, status: "active" },
        { id: "VR-06", name: "Train", image: "", video: "", shortDescription: "A high-speed train ride through surreal landscapes.", category: "Adventure", featured: false, status: "active" }
    ],

    /**
     * FACILITIES
     */
    facilities: [
        { id: "F-01", name: "Easy Parking", icon: "directions_car", description: "100+ car parking spaces with easy access." },
        { id: "F-02", name: "Toilets", icon: "wc", description: "Clean and accessible restroom facilities." },
        { id: "F-03", name: "24/7 CCTV", icon: "videocam", description: "Continuous security monitoring for your peace of mind." },
        { id: "F-04", name: "Mountain View", icon: "landscape", description: "Beautiful natural surroundings visible from the indoor area." },
        { id: "F-05", name: "First-floor Sound System", icon: "speaker", description: "Immersive 360° sound and music system on the first floor." }
    ],

    /**
     * 360 LOCATIONS
     */
    panoramas: [
        { 
            id: "P-01", name: "Ground Floor", floor: "ground", 
            source: "https://momento360.com/e/u/a8108b690f2745e8bcfd103ec8961790?utm_campaign=embed&amp;utm_source=other&amp;utm_medium=embed&amp;heading=204.87&amp;pitch=-58.18&amp;field-of-view=47.5&amp;size=medium&amp;autoplay-annotations=true&amp;display-plan=true", 
            thumbnail: "", description: "Explore our massive indoor gaming area featuring premium arcade machines and VR simulators.", 
            hotspots: [] 
        },
        { 
            id: "P-02", name: "First Floor", floor: "first", 
            source: "https://momento360.com/e/u/2de1fa4fca25409e97e670d2bf2fb480?utm_campaign=embed&amp;utm_source=other&amp;utm_medium=embed&amp;heading=0&amp;pitch=0&amp;field-of-view=75&amp;size=medium&amp;autoplay-annotations=true&amp;display-plan=true", 
            thumbnail: "", description: "Discover our active play zones including the giant ball pool and trampoline park.", 
            hotspots: [] 
        },
        { 
            id: "P-03", name: "Outdoor", floor: "outdoor", 
            source: "https://momento360.com/e/u/c8506a87e247409188f0d0a7139b8382?utm_campaign=embed&amp;utm_source=other&amp;utm_medium=embed&amp;heading=0&amp;pitch=0&amp;field-of-view=75&amp;size=medium&amp;autoplay-annotations=true&amp;display-plan=true", 
            thumbnail: "", description: "Take a walk through our scenic outdoor rides surrounded by nature.", 
            hotspots: [] 
        },
        { 
            id: "P-04", name: "Parking", floor: "outdoor", 
            source: "https://momento360.com/e/u/f51f7ddbe0054833a34c5d264dfa0588?utm_campaign=embed&amp;utm_source=other&amp;utm_medium=embed&amp;heading=-223.4&amp;pitch=4.8&amp;field-of-view=75&amp;size=medium&amp;autoplay-annotations=true&amp;display-plan=true", 
            thumbnail: "", description: "Ample parking space with breathtaking views of the Kodaikanal mountains.", 
            hotspots: [] 
        }
    ],

    /**
     * INTERACTIVE PARK MAPS
     */
    maps: [
        {
            id: "ground-floor",
            name: "Ground Floor",
            stats: "20 Experiences",
            floorId: "ground",
            imagePlaceholder: "bg-gradient-to-br from-indigo-900 to-purple-900",
            zones: [
                { x: 20, y: 30, attractionId: "A-11" }, // VR 360
                { x: 50, y: 60, attractionId: "A-01" }, // Massage Chair
                { x: 80, y: 40, attractionId: "A-05" }  // Basketball
            ]
        },
        {
            id: "first-floor",
            name: "First Floor",
            stats: "3 Experiences",
            floorId: "first",
            imagePlaceholder: "bg-gradient-to-br from-blue-900 to-cyan-800",
            zones: [
                { x: 30, y: 40, attractionId: "B-01" }, // Ball Pool
                { x: 70, y: 60, attractionId: "B-02" }  // Trampoline
            ]
        },
        {
            id: "outdoor",
            name: "Outdoor",
            stats: "8 Experiences",
            floorId: "outdoor",
            imagePlaceholder: "bg-gradient-to-br from-emerald-900 to-teal-800",
            zones: [
                { x: 40, y: 50, attractionId: "C-01" }, // Dashing Car
                { x: 75, y: 30, attractionId: "C-06" }  // Flying UFO
            ]
        },
        {
            id: "parking",
            name: "Parking",
            stats: "100+ Spaces",
            floorId: "parking",
            imagePlaceholder: "bg-gradient-to-br from-gray-800 to-slate-700",
            zones: []
        }
    ],

    /**
     * DATA HELPER METHODS
     */
    helpers: {
        getAttractionsByFloor: (floorId) => KurunjiData.attractions.filter(a => a.floor === floorId && a.status === 'active'),
        getAttractionsByType: (typeId) => KurunjiData.attractions.filter(a => a.type === typeId && a.status === 'active'),
        getUpcomingAttractions: () => KurunjiData.attractions.filter(a => a.status === 'coming-soon'),
        getFeaturedAttractions: () => KurunjiData.attractions.filter(a => a.featured && a.status === 'active'),
        getAttractionBySlug: (slug) => KurunjiData.attractions.find(a => a.slug === slug),
        getAllActive: () => KurunjiData.attractions.filter(a => a.status === 'active')
    }
};

// Export for browser or Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KurunjiData;
}
if (typeof window !== 'undefined') {
    window.KurunjiData = KurunjiData;
}
