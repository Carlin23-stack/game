// Game Engine - Core Game Logic
class GameEngine {
    constructor(gameState) {
        this.state = gameState;
        this.gameSpeed = 1; // 1x, 2x, 5x, 10x
        this.isPaused = false;
    }
    
    // Advance to next year
    advanceYear() {
        if (this.isPaused) return;
        
        this.state.year++;
        
        // Check if game is over (2026)
        if (this.state.year > 2026) {
            this.endGame();
            return;
        }
        
        // Process yearly events
        this.processYearlyEvents();
        this.processProduction();
        this.processMarket();
        this.processResearch();
        this.processCosts();
        this.checkMilestones();
        
        this.state.save();
    }
    
    // Process CPU production
    processProduction() {
        if (this.state.productionQueue.length === 0) return;
        
        const produced = this.state.productionQueue.filter(item => {
            if (item.remainingYears > 0) {
                item.remainingYears--;
                return false;
            }
            return true;
        });
        
        produced.forEach(item => {
            // Add to inventory
            if (!this.state.cpuInventory[item.cpuId]) {
                this.state.cpuInventory[item.cpuId] = 0;
            }
            this.state.cpuInventory[item.cpuId] += item.quantity;
            
            this.state.addEvent(`Produced ${item.quantity} units of ${item.cpuName}`);
        });
        
        // Remove completed items
        this.state.productionQueue = this.state.productionQueue.filter(item => item.remainingYears > 0);
    }
    
    // Process market demand and sales
    processMarket() {
        // Simulate market sales based on demand
        const soldCPUs = {};
        let totalRevenue = 0;
        
        Object.keys(this.state.cpuInventory).forEach(cpuId => {
            const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
            if (!cpu) return;
            
            const inventory = this.state.cpuInventory[cpuId];
            const marketPrice = this.calculateMarketPrice(cpu);
            const demand = cpu.marketDemand || 10000;
            
            // Sell as much as possible
            const sold = Math.min(inventory, demand);
            const revenue = sold * marketPrice;
            
            if (sold > 0) {
                totalRevenue += revenue;
                soldCPUs[cpuId] = sold;
                this.state.cpuInventory[cpuId] -= sold;
            }
        });
        
        this.state.money += totalRevenue;
        if (totalRevenue > 0) {
            this.state.addEvent(`Sold CPUs for $${totalRevenue.toLocaleString()}`);
        }
    }
    
    // Calculate CPU market price based on year and specs
    calculateMarketPrice(cpu) {
        let price = cpu.marketPrice;
        
        // Price degrades over time
        const yearsDiff = this.state.year - cpu.year;
        const degradation = Math.pow(0.85, yearsDiff);
        
        return Math.floor(price * degradation);
    }
    
    // Process research progress
    processResearch() {
        // Gain research points based on facilities
        const rpPerYear = 50 * this.state.researchFacilities;
        this.state.researchPoints += rpPerYear;
    }
    
    // Process maintenance and operational costs
    processCosts() {
        const yearlyMaintenance = this.state.manufacturingCapacity * 0.1; // 10% of capacity
        this.state.money -= yearlyMaintenance;
        
        if (this.state.money < 0) {
            this.state.addEvent('WARNING: Negative cash flow!');
        }
    }
    
    // Check for important milestones and events
    checkMilestones() {
        const milestones = [
            { year: 1985, text: '32-bit computing era begins', techRequirement: '32-bit' },
            { year: 2000, text: 'Y2K milestone reached', techRequirement: '64-bit' },
            { year: 2005, text: 'Multi-core processors become standard', techRequirement: 'Multi-core' },
            { year: 2020, text: 'AI acceleration becomes crucial', techRequirement: 'AI Acceleration' }
        ];
        
        milestones.forEach(m => {
            if (m.year === this.state.year) {
                this.state.addEvent(`[MILESTONE] ${m.text}`);
            }
        });
    }
    
    // Process yearly events (market changes, competition, etc)
    processYearlyEvents() {
        // Random events
        const rand = Math.random();
        
        if (rand < 0.1) {
            const eventTexts = [
                'Market boom! Demand increased by 50%',
                'New competitor enters market',
                'Supply chain disruption - manufacturing slowed',
                'Consumer demand shifts toward higher performance',
                'Economic recession affects market demand'
            ];
            const event = eventTexts[Math.floor(Math.random() * eventTexts.length)];
            this.state.addEvent(event);
        }
    }
    
    // Research a technology
    researchTechnology(techName) {
        const tech = this.state.technologies[techName];
        if (!tech) return { success: false, message: 'Technology not found' };
        if (tech.researched) return { success: false, message: 'Already researched' };
        if (this.state.year < tech.year) return { success: false, message: `Cannot research until ${tech.year}` };
        if (this.state.money < tech.cost) return { success: false, message: 'Insufficient funds' };
        if (this.state.researchPoints < tech.repPoints) return { success: false, message: 'Insufficient research points' };
        
        // Perform research
        this.state.money -= tech.cost;
        this.state.researchPoints -= tech.repPoints;
        tech.researched = true;
        this.state.reputation += Math.floor(tech.repPoints * 0.5);
        
        this.state.addEvent(`Researched: ${techName}`);
        return { success: true, message: `${techName} researched successfully!` };
    }
    
    // Design a new CPU
    designCPU(specs) {
        // specs: { name, bits, cores, ghz, technologyRequired }
        const cost = 100000 + (specs.bits * 1000) + (specs.cores * 50000);
        
        if (this.state.money < cost) {
            return { success: false, message: 'Insufficient funds' };
        }
        
        // Check if technologies are researched
        if (specs.techRequired) {
            for (let tech of specs.techRequired) {
                if (!this.state.technologies[tech]?.researched) {
                    return { success: false, message: `Must research ${tech} first` };
                }
            }
        }
        
        this.state.money -= cost;
        this.state.addEvent(`Designed new CPU: ${specs.name}`);
        
        return { success: true, message: 'CPU design created!' };
    }
    
    // Start production of a CPU
    produceCPU(cpuId, quantity) {
        const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
        if (!cpu) return { success: false, message: 'CPU not found' };
        
        const productionCost = cpu.cost * quantity;
        if (this.state.money < productionCost) {
            return { success: false, message: 'Insufficient funds' };
        }
        
        this.state.money -= productionCost;
        
        const productionYears = Math.ceil(quantity / (this.state.manufacturingCapacity / 10));
        this.state.productionQueue.push({
            cpuId: cpuId,
            cpuName: cpu.name,
            quantity: quantity,
            remainingYears: productionYears
        });
        
        this.state.addEvent(`Started production of ${quantity} ${cpu.name} units`);
        return { success: true, message: 'Production started!' };
    }
    
    endGame() {
        this.isPaused = true;
        const score = this.calculateFinalScore();
        this.state.addEvent(`[GAME OVER] Final Score: ${score}`);
    }
    
    calculateFinalScore() {
        const moneyScore = Math.floor(this.state.money / 1000000);
        const reputationScore = this.state.reputation * 10;
        const techScore = Object.values(this.state.technologies).filter(t => t.researched).length * 100;
        
        return moneyScore + reputationScore + techScore;
    }
    
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}