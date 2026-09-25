// Game State Management - FIXED VERSION
const GameState = {
    // Current year and time
    year: 1980,
    season: 'Q1',
    
    // Player Resources
    money: 1000000,
    reputation: 0,
    researchPoints: 100,
    
    // Company Info
    companyName: 'Your CPU Company',
    manufacturingCapacity: 10000,
    researchFacilities: 1,
    
    // Inventory
    cpuInventory: {},
    components: {
        transistors: 0,
        cache: 0,
        cores: 0
    },
    
    // Technology Tree
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
    
    // CPU Designs - Core list (won't be duplicated)
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
        },
        {
            id: 'i486',
            name: 'Intel 486',
            bits: 32,
            cores: 1,
            ghz: 0.04,
            cost: 200,
            marketPrice: 1200,
            year: 1989,
            techRequired: ['32-bit'],
            marketDemand: 1000000
        },
        {
            id: 'pentium',
            name: 'Pentium',
            bits: 32,
            cores: 1,
            ghz: 0.06,
            cost: 250,
            marketPrice: 1500,
            year: 1993,
            techRequired: ['32-bit'],
            marketDemand: 2000000
        },
        {
            id: 'pentium2',
            name: 'Pentium II',
            bits: 32,
            cores: 1,
            ghz: 0.3,
            cost: 300,
            marketPrice: 2000,
            year: 1997,
            techRequired: ['32-bit'],
            marketDemand: 3000000
        },
        {
            id: 'pentium4',
            name: 'Pentium 4',
            bits: 32,
            cores: 1,
            ghz: 1.5,
            cost: 400,
            marketPrice: 2500,
            year: 2000,
            techRequired: ['32-bit', '64-bit'],
            marketDemand: 5000000
        },
        {
            id: 'core2duo',
            name: 'Core 2 Duo',
            bits: 64,
            cores: 2,
            ghz: 2.0,
            cost: 500,
            marketPrice: 3500,
            year: 2006,
            techRequired: ['64-bit', 'Multi-core'],
            marketDemand: 10000000
        },
        {
            id: 'i7',
            name: 'Intel Core i7',
            bits: 64,
            cores: 4,
            ghz: 3.2,
            cost: 700,
            marketPrice: 5000,
            year: 2008,
            techRequired: ['64-bit', 'Multi-core'],
            marketDemand: 15000000
        },
        {
            id: 'i9',
            name: 'Intel Core i9',
            bits: 64,
            cores: 8,
            ghz: 4.5,
            cost: 1000,
            marketPrice: 8000,
            year: 2017,
            techRequired: ['64-bit', 'Multi-core', 'AI Acceleration'],
            marketDemand: 20000000
        }
    ],
    
    // Production Queue
    productionQueue: [],
    
    // Market Data
    marketHistory: [],
    competitorCPUs: [],
    
    // Events Log
    eventLog: [],
    
    // Initialization flag
    isInitialized: false,
    
    // Save/Load
    save: function() {
        localStorage.setItem('cpuTycoonSave', JSON.stringify(this));
    },
    
    load: function() {
        const saved = localStorage.getItem('cpuTycoonSave');
        if (saved) {
            const data = JSON.parse(saved);
            // Restore all properties
            Object.assign(this, data);
            // Ensure cpuDesigns array is properly restored
            if (!Array.isArray(this.cpuDesigns)) {
                this.cpuDesigns = data.cpuDesigns || [];
            }
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
        this.isInitialized = false;
        
        // Reset technologies but keep 8-bit researched
        const techKeys = Object.keys(this.technologies);
        techKeys.forEach(tech => {
            if (tech !== '8-bit') {
                this.technologies[tech].researched = false;
            } else {
                this.technologies[tech].researched = true;
            }
        });
    },
    
    addEvent: function(eventText) {
        this.eventLog.push({
            year: this.year,
            text: eventText,
            timestamp: Date.now()
        });
        // Keep only last 50 events
        if (this.eventLog.length > 50) {
            this.eventLog.shift();
        }
    },
    
    // Ensure CPU designs aren't duplicated
    getAvailableCPUs: function() {
        return this.cpuDesigns.filter(cpu => this.year >= cpu.year);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}