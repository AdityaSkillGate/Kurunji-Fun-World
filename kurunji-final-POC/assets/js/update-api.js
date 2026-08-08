const fs = require('fs');

const apiAdditions = `
/**
 * Fetch all attractions
 */
async function fetchAttractions() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockAttractions = [
                    // Ground Floor (20)
                    { id: "A-01", name: "Massage Chair", slug: "massage-chair", type: "Indoor", floor: "Ground Floor", category: "Relaxation", description: "Relax with a mountain view.", status: "Active" },
                    { id: "A-02", name: "Play With Me", slug: "play-with-me", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Fun interactive experience.", status: "Active" },
                    { id: "A-03", name: "Boxer", slug: "boxer", type: "Indoor", floor: "Ground Floor", category: "Arcade", description: "Test your punching strength.", status: "Active" },
                    { id: "A-04", name: "Down the Clown", slug: "down-the-clown", type: "Indoor", floor: "Ground Floor", category: "Arcade", description: "Classic carnival throwing game.", status: "Active" },
                    { id: "A-05", name: "Basketball", slug: "basketball", type: "Indoor", floor: "Ground Floor", category: "Sports", description: "Shoot hoops and set high scores.", status: "Active" },
                    { id: "A-06", name: "Pink Love", slug: "pink-love", type: "Indoor", floor: "Ground Floor", category: "Claw", description: "Try to win a cute plushie.", status: "Active" },
                    { id: "A-07", name: "Space Catcher", slug: "space-catcher", type: "Indoor", floor: "Ground Floor", category: "Claw", description: "Space-themed prize catcher.", status: "Active" },
                    { id: "A-08", name: "Snail Times", slug: "snail-times", type: "Indoor", floor: "Ground Floor", category: "Kids", description: "Gentle fun for the little ones.", status: "Active" },
                    { id: "A-09", name: "Big Boss", slug: "big-boss", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Take charge and play like a boss.", status: "Active" },
                    { id: "A-10", name: "Passion Blasting", slug: "passion-blasting", type: "Indoor", floor: "Ground Floor", category: "Shooter", description: "Intense arcade shooting action.", status: "Active" },
                    { id: "A-11", name: "VR 360", slug: "vr-360", type: "Indoor", floor: "Ground Floor", category: "VR", description: "Immersive 360 virtual reality experiences with 40+ themes.", status: "Active" },
                    { id: "A-12", name: "Rescue", slug: "rescue", type: "Indoor", floor: "Ground Floor", category: "Shooter", description: "Save the day in this action game.", status: "Active" },
                    { id: "A-13", name: "Crazy Ball", slug: "crazy-ball", type: "Indoor", floor: "Ground Floor", category: "Interactive", description: "Fast-paced ball action.", status: "Active" },
                    { id: "A-14", name: "Wave Riders", slug: "wave-riders", type: "Indoor", floor: "Ground Floor", category: "Simulator", description: "Ride the digital waves.", status: "Active" },
                    { id: "A-15", name: "VR 4 Seater", slug: "vr-4-seater", type: "Indoor", floor: "Ground Floor", category: "VR", description: "Group virtual reality adventure.", status: "Active" },
                    { id: "A-16", name: "Ace Shooter", slug: "ace-shooter", type: "Indoor", floor: "Ground Floor", category: "Shooter", description: "Show off your marksmanship.", status: "Active" },
                    { id: "A-17", name: "Crusin Blast", slug: "crusin-blast", type: "Indoor", floor: "Ground Floor", category: "Racing", description: "High-speed arcade racing.", status: "Active" },
                    { id: "A-18", name: "Super Moto", slug: "super-moto", type: "Indoor", floor: "Ground Floor", category: "Racing", description: "Motorcycle racing simulator.", status: "Active" },
                    { id: "A-19", name: "Power Hockey", slug: "power-hockey", type: "Indoor", floor: "Ground Floor", category: "Sports", description: "Air hockey with a competitive edge.", status: "Active" },
                    { id: "A-20", name: "Horse Ride", slug: "horse-ride", type: "Indoor", floor: "Ground Floor", category: "Kids", description: "Classic horse riding fun for kids.", status: "Active" },
                    
                    // First Floor (3)
                    { id: "B-01", name: "Ball Pool", slug: "ball-pool", type: "Indoor", floor: "First Floor", category: "Kids Play", description: "Dive into a massive sea of colorful balls.", status: "Active" },
                    { id: "B-02", name: "Trampoline", slug: "trampoline", type: "Indoor", floor: "First Floor", category: "Active", description: "Bounce to your heart's content.", status: "Active" },
                    { id: "B-03", name: "Ninja", slug: "ninja", type: "Indoor", floor: "First Floor", category: "Active", description: "Test your agility on the Ninja course.", status: "Active" },
                    
                    // Outdoor (8)
                    { id: "C-01", name: "Crazy Roller", slug: "crazy-roller", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "A dizzying, exciting rolling experience.", status: "Active" },
                    { id: "C-02", name: "360 Cycle Ride", slug: "360-cycle-ride", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "Pedal your way to a full 360 loop.", status: "Active" },
                    { id: "C-03", name: "Human Gyro 360", slug: "human-gyro-360", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "Experience astronaut training gravity.", status: "Active" },
                    { id: "C-04", name: "Bull Ride", slug: "bull-ride", type: "Outdoor", floor: "Outdoor", category: "Challenge", description: "Hold on tight and beat the mechanical bull.", status: "Active" },
                    { id: "C-05", name: "Bungee Trampoline", slug: "bungee-trampoline", type: "Outdoor", floor: "Outdoor", category: "Active", description: "Jump higher than ever safely harnessed.", status: "Active" },
                    { id: "C-06", name: "Zero Gravity", slug: "zero-gravity", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "Defy gravity on this intense ride.", status: "Active" },
                    { id: "C-07", name: "Rocket Ejecter", slug: "rocket-ejecter", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "Launch straight up into the Kodaikanal sky.", status: "Active" },
                    { id: "C-08", name: "MeltDown", slug: "meltdown", type: "Outdoor", floor: "Outdoor", category: "Challenge", description: "Jump and duck to survive the sweeping arms.", status: "Active" },
                    
                    // Upcoming placeholders
                    { id: "C-09", name: "Zipline", slug: "zipline", type: "Outdoor", floor: "Outdoor", category: "Thrill", description: "Fly across the park with stunning views.", status: "Coming Soon" },
                    { id: "A-21", name: "Indoor Roller Coaster", slug: "indoor-roller-coaster", type: "Indoor", floor: "Ground Floor", category: "Thrill", description: "The ultimate indoor thrill ride.", status: "Coming Soon" }
                ];
                resolve({ attractions: mockAttractions });
            }, 500);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchAttractions', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return { attractions: [] };
    }
}

/**
 * Fetch a single attraction by slug
 */
async function fetchAttraction(slug) {
    const data = await fetchAttractions();
    const attraction = data.attractions.find(a => a.slug === slug);
    return attraction || null;
}

/**
 * Fetch VR Themes
 */
async function fetchVRThemes() {
    if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ themes: [
                    { id: "VR-01", name: "Lost in Space", status: "Active" },
                    { id: "VR-02", name: "Tyrannosaurus Kingdom", status: "Active" },
                    { id: "VR-03", name: "Snow Valley Coaster", status: "Active" },
                    { id: "VR-04", name: "Solar System Tourism", status: "Active" },
                    { id: "VR-05", name: "Ocean Adventure", status: "Active" },
                    { id: "VR-06", name: "Train", status: "Active" }
                ]});
            }, 300);
        });
    }

    try {
        const response = await fetch(APPS_SCRIPT_URL + '?action=fetchVRThemes', { cache: 'no-store' });
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return { themes: [] };
    }
}
`;

const file = 'assets/js/api.js';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('fetchAttractions')) {
    fs.appendFileSync(file, apiAdditions);
    console.log('Appended fetch functions to api.js');
} else {
    console.log('Functions already exist');
}
