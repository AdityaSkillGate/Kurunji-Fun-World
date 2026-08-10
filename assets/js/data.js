/**
 * Kurunji Fun World - Data Management Layer
 * Acts as a bridge between the API (api.js) and the UI renderers.
 */

class ParkDataService {
    constructor() {
        this.attractionsCache = null;
        this.themesCache = null;
    }

    /**
     * Get all attractions, utilizing cache if available
     */
    async getAllAttractions() {
        if (!this.attractionsCache) {
            const data = await fetchAttractions();
            this.attractionsCache = data.attractions || [];
        }
        return this.attractionsCache;
    }

    /**
     * Get a specific attraction by slug
     */
    async getAttraction(slug) {
        const attractions = await this.getAllAttractions();
        return attractions.find(a => a.slug === slug) || null;
    }

    /**
     * Group attractions by floor/area
     */
    async getAttractionsByArea() {
        const attractions = await this.getAllAttractions();
        
        return {
            groundFloor: attractions.filter(a => a.floor === 'Ground Floor' && a.status !== 'Coming Soon'),
            firstFloor: attractions.filter(a => a.floor === 'First Floor' && a.status !== 'Coming Soon'),
            outdoor: attractions.filter(a => a.floor === 'Outdoor' && a.status !== 'Coming Soon'),
            upcoming: attractions.filter(a => a.status === 'Coming Soon')
        };
    }

    /**
     * Get VR Themes
     */
    async getVRThemes() {
        if (!this.themesCache) {
            const data = await fetchVRThemes();
            this.themesCache = data.themes || [];
        }
        return this.themesCache;
    }

    /**
     * Get park statistics summary
     */
    async getParkSummary() {
        const areas = await this.getAttractionsByArea();
        return {
            totalActive: areas.groundFloor.length + areas.firstFloor.length + areas.outdoor.length,
            indoor: areas.groundFloor.length + areas.firstFloor.length,
            outdoor: areas.outdoor.length,
            floors: 2
        };
    }
}

// Global singleton instance
const parkData = new ParkDataService();
