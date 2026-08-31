/**
 * pos-data.js
 * Central Local Data Catalog & SWR Cache for Kurunji Fun World Staff POS
 * Guarantees 0ms instant loading for all attractions, packages, and pricing.
 */

var POSData = (function () {
    const STORAGE_PREFIX = 'kurunji_pos_catalog_';

    // Default Pre-bundled Park Catalog
    const DEFAULTS = {
        firstFloorPricing: {
            childPrice: 599,
            adultPrice: 899,
            name: "First Floor Access",
            activities: "Ball Pool, Trampoline, Ninja"
        },
        rechargePackages: [
            { PackageID: "RP-01", PayAmount: 1000, BasePoints: 1000, BonusPoints: 0, TotalPoints: 1000, DisplayOrder: 1 },
            { PackageID: "RP-02", PayAmount: 1500, BasePoints: 1500, BonusPoints: 300, TotalPoints: 1800, DisplayOrder: 2 },
            { PackageID: "RP-03", PayAmount: 2000, BasePoints: 2000, BonusPoints: 500, TotalPoints: 2500, DisplayOrder: 3 },
            { PackageID: "RP-04", PayAmount: 2500, BasePoints: 2500, BonusPoints: 500, TotalPoints: 3000, DisplayOrder: 4 },
            { PackageID: "RP-05", PayAmount: 3000, BasePoints: 3000, BonusPoints: 3000, TotalPoints: 6000, DisplayOrder: 5 },
            { PackageID: "RP-06", PayAmount: 3500, BasePoints: 3500, BonusPoints: 3000, TotalPoints: 6500, DisplayOrder: 6 },
            { PackageID: "RP-07", PayAmount: 4000, BasePoints: 4000, BonusPoints: 4000, TotalPoints: 8000, DisplayOrder: 7 },
            { PackageID: "RP-08", PayAmount: 5000, BasePoints: 5000, BonusPoints: 4500, TotalPoints: 9500, DisplayOrder: 8 },
            { PackageID: "RP-09", PayAmount: 6000, BasePoints: 6000, BonusPoints: 6000, TotalPoints: 12000, DisplayOrder: 9 },
            { PackageID: "RP-10", PayAmount: 10000, BasePoints: 10000, BonusPoints: 10000, TotalPoints: 20000, DisplayOrder: 10 }
        ],
        groundFloorAttractions: [
            { AttractionID: "GF-01", Name: "VR 360", PointsPerPerson: 200, Status: "ACTIVE", Floor: "Ground", Type: "VR" },
            { AttractionID: "GF-02", Name: "Boxer", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-03", Name: "Massage Chair", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Relaxation" },
            { AttractionID: "GF-04", Name: "Play With Me", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Interactive" },
            { AttractionID: "GF-05", Name: "Down the Clown", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-06", Name: "Basketball", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Sports" },
            { AttractionID: "GF-07", Name: "Pink Love", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Claw" },
            { AttractionID: "GF-08", Name: "Space Catcher", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Claw" },
            { AttractionID: "GF-09", Name: "Snail Times", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Kids" },
            { AttractionID: "GF-10", Name: "Big Boss", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Interactive" },
            { AttractionID: "GF-11", Name: "Passion Blasting", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Shooter" },
            { AttractionID: "GF-12", Name: "Rescue", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Shooter" },
            { AttractionID: "GF-13", Name: "Crazy Ball", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-14", Name: "Wave Riders", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-15", Name: "VR 4 Seater", PointsPerPerson: 200, Status: "ACTIVE", Floor: "Ground", Type: "VR" },
            { AttractionID: "GF-16", Name: "Ace Shooter", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-17", Name: "Crusin Blast", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-18", Name: "Super Moto", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-19", Name: "Power Hockey", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" },
            { AttractionID: "GF-20", Name: "Horse Ride", PointsPerPerson: 100, Status: "ACTIVE", Floor: "Ground", Type: "Arcade" }
        ],
        outdoorPricing: [
            { AttractionID: "OUT-01", Name: "Crazy Roller", Price: 200, Status: "ACTIVE" },
            { AttractionID: "OUT-02", Name: "360 Cycle Ride", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-03", Name: "Human Gyro 360", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-04", Name: "Bull Ride", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-05", Name: "Bungee Trampoline", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-06", Name: "Zero Gravity", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-07", Name: "Rocket Ejecter", Price: 150, Status: "ACTIVE" },
            { AttractionID: "OUT-08", Name: "MeltDown", Price: 150, Status: "ACTIVE" }
        ],
        addons: [
            { ProductID: "PROD-01", Name: "Grip Socks", Category: "Merchandise", Price: 100, TaxRate: 5, Status: "ACTIVE" },
            { ProductID: "PROD-02", Name: "Water Bottle", Category: "F&B", Price: 50, TaxRate: 0, Status: "ACTIVE" },
            { ProductID: "PROD-03", Name: "Kurunji Cap", Category: "Merchandise", Price: 199, TaxRate: 5, Status: "ACTIVE" },
            { ProductID: "PROD-04", Name: "Kurunji T-Shirt", Category: "Merchandise", Price: 499, TaxRate: 5, Status: "ACTIVE" }
        ]
    };

    function get(key) {
        try {
            const cached = localStorage.getItem(STORAGE_PREFIX + key);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Error reading POSData cache for ' + key, e);
        }
        return DEFAULTS[key] || null;
    }

    function set(key, data) {
        try {
            if (data) {
                localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
                localStorage.setItem(STORAGE_PREFIX + key + '_time', Date.now().toString());
            }
        } catch (e) {
            console.warn('Error setting POSData cache for ' + key, e);
        }
    }

    // Background silent refresh helper (Stale-While-Revalidate)
    function refreshInBackground(key, fetchPromise) {
        if (!fetchPromise || typeof fetchPromise.then !== 'function') return;
        fetchPromise.then(res => {
            if (!res) return;
            if (key === 'firstFloorPricing' && res.status === 'success' && res.pricing) {
                set('firstFloorPricing', res.pricing);
            } else if (key === 'rechargePackages' && res.packages && res.packages.length > 0) {
                set('rechargePackages', res.packages);
            } else if (key === 'groundFloorAttractions' && res.attractions && res.attractions.length > 0) {
                set('groundFloorAttractions', res.attractions);
            } else if (key === 'outdoorPricing' && res.status === 'success' && res.attractions && res.attractions.length > 0) {
                set('outdoorPricing', res.attractions);
            } else if (key === 'addons' && res.status === 'success' && res.addons && res.addons.length > 0) {
                set('addons', res.addons);
            }
        }).catch(err => {
            console.log('Background catalog refresh for ' + key + ' skipped:', err.message);
        });
    }

    return {
        get,
        set,
        refreshInBackground,
        DEFAULTS
    };
})();
