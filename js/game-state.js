// Game State Management
const GameState = {
    // Current year and time
    year: 1980,
    season: 'Q1', // Q1, Q2, Q3, Q4
    
    // Player Resources
    money: 1000000,
    reputation: 0,
    researchPoints: 100,
    
    // Company Info
    companyName: 'Your CPU Company',
    manufacturingCapacity: 10000, // units per year
    researchFacilities: 1,
    
    // Inventory
    cpuInventory: {},
    components: {
        transistors: 0,
        cache: 0,
        cores: 0
    },
    
    // Technology Tree - what's been researched
    technologies: {
        '8-bit': { researched: true, year: 1980 },
        '16-bit': { researched: false, year: 1982, cost: 50000, repPoints: 50 },
        '32-bit': { researched: false, year: 1985, cost: 150000, repPoints: 100 },
        '64-bit': { researched: false, year: 2000, cost: 500000, repPoints: 200 },
        'Multi-core': { researched: false, year: 2005, cost: 300000, repPoints: 150 },
        '64nm Process': { researched: false, year: 2008, cost: 400000, repPoints: 200 },
        '45nm Process': { researched: false, year: 2010, cost: 500000, repPoints: 250 },
        '22nm Process': { researched: false, year: 2014, cost: 600000, repPoints: 300 },
        '14nm Process': { researched: false, year: 2016, cost: 700000, repPoints: 350 },
        '7nm Process': { researched: false, year: 2020, cost: 1000000, repPoints: 500 },
        'AI Acceleration': { researched: false, year: 2020, cost: 400000, repPoints: 250 },
    },
    
    // CPU Designs
    cpuDesigns: [
        {
            id: 'i8086',
            name: 'Basic 8086',
            bits: 16,
            cores: 1,
            ghz: 0.005,
            cost: 50,
            marketPrice: 200,
            year: 1980,
            techRequired: ['8-bit'],
            marketDemand: 50000
        },
        {
            id: 'i286',
            name: 'Intel 286',
            bits: 16,
            cores: 1,
            ghz: 0.01,
            cost: 80,
            marketPrice: 400,
            year: 1984,
            techRequired: ['16-bit'],
            marketDemand: 100000
        },
        {
            id: 'i386',
            name: 'Intel 386',
            bits: 32,
            cores: 1,
            ghz: 0.02,
            cost: 150,
            marketPrice: 800,
            year: 1987,
            techRequired: ['32-bit'],
            marketDemand: 500000
        }
    ],
    
    // Production Queue
    productionQueue: [],
    
    // Market Data
    marketHistory: [],
    competitorCPUs: [],
    
    // Events Log
    eventLog: [],
    
    // Save/Load
    save: function() {
        localStorage.setItem('cpuTycoonSave', JSON.stringify(this));
    },
    
    load: function() {
        const saved = localStorage.getItem('cpuTycoonSave');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
            return true;
        }
        return false;
    },
    
    reset: function() {
        this.year = 1980;
        this.money = 1000000;
        this.reputation = 0;
        this.researchPoints = 100;
        this.cpuInventory = {};
        this.productionQueue = [];
        this.eventLog = [];
        this.technologies = Object.keys(this.technologies).reduce((acc, tech) => {
            acc[tech] = { ...this.technologies[tech] };
            if (tech !== '8-bit') acc[tech].researched = false;
            return acc;
        }, {});
    },
    
    addEvent: function(eventText) {
        this.eventLog.push({
            year: this.year,
            text: eventText,
            timestamp: Date.now()
        });
        // Keep only last 20 events
        if (this.eventLog.length > 20) {
            this.eventLog.shift();
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}