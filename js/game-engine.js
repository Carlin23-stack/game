// Game Engine - Core Game Logic - IMPROVED
class GameEngine {
    constructor(gameState) {
        this.state = gameState;
        this.gameSpeed = 1;
        this.isPaused = false;
        this.autoAdvanceInterval = null;
    }
    
    // Advance to next year
    advanceYear() {
        if (this.isPaused) return false;
        
        this.state.year++;
        
        // Check if game is over (2026)
        if (this.state.year > 2026) {
            this.endGame();
            return false;
        }
        
        // Process yearly events IN ORDER
        this.processYearlyEvents();
        this.processProduction();
        this.processMarket();
        this.processResearch();
        this.processCosts();
        this.checkMilestones();
        this.checkResearchUnlocks();
        
        this.state.save();
        return true;
    }
    
    // Check if new technologies unlock new CPUs
    checkResearchUnlocks() {
        // This is handled by the UI filtering available CPUs by year
    }
    
    // Process CPU production
    processProduction() {
        if (this.state.productionQueue.length === 0) return;
        
        const stillProducing = [];
        const completed = [];
        
        this.state.productionQueue.forEach(item => {
            item.remainingYears--;
            if (item.remainingYears <= 0) {
                completed.push(item);
            } else {
                stillProducing.push(item);
            }
        });
        
        // Process completed items
        completed.forEach(item => {
            if (!this.state.cpuInventory[item.cpuId]) {
                this.state.cpuInventory[item.cpuId] = 0;
            }
            this.state.cpuInventory[item.cpuId] += item.quantity;
            this.state.addEvent(`✓ Produced ${item.quantity.toLocaleString()} units of ${item.cpuName}`);
        });
        
        this.state.productionQueue = stillProducing;
    }
    
    // Process market demand and sales
    processMarket() {
        let totalRevenue = 0;
        
        Object.keys(this.state.cpuInventory).forEach(cpuId => {
            const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
            if (!cpu) return;
            
            const inventory = this.state.cpuInventory[cpuId];
            if (inventory <= 0) return;
            
            const marketPrice = this.calculateMarketPrice(cpu);
            const demand = cpu.marketDemand || 10000;
            
            // Sell as much as possible
            const sold = Math.min(inventory, demand);
            const revenue = sold * marketPrice;
            
            if (sold > 0) {
                totalRevenue += revenue;
                this.state.cpuInventory[cpuId] -= sold;
            }
        });
        
        this.state.money += totalRevenue;
        if (totalRevenue > 0) {
            this.state.addEvent(`💰 Sold CPUs for $${totalRevenue.toLocaleString()}`);
        }
    }
    
    // Calculate CPU market price based on year and specs
    calculateMarketPrice(cpu) {
        let price = cpu.marketPrice;
        const yearsDiff = this.state.year - cpu.year;
        const degradation = Math.pow(0.85, yearsDiff);
        return Math.max(Math.floor(price * degradation), 10); // Minimum $10
    }
    
    // Process research progress
    processResearch() {
        const rpPerYear = 50 * this.state.researchFacilities;
        this.state.researchPoints += rpPerYear;
    }
    
    // Process maintenance and operational costs
    processCosts() {
        const yearlyMaintenance = this.state.manufacturingCapacity * 0.1;
        this.state.money -= yearlyMaintenance;
        
        if (this.state.money < 0) {
            this.state.addEvent('⚠️ WARNING: Negative cash flow!');
        }
    }
    
    // Check for important milestones
    checkMilestones() {
        const milestones = [
            { year: 1985, text: '32-bit computing era begins' },
            { year: 2000, text: 'Y2K milestone reached' },
            { year: 2005, text: 'Multi-core processors become standard' },
            { year: 2010, text: 'Smartphone era begins' },
            { year: 2020, text: 'AI acceleration becomes crucial' },
            { year: 2026, text: 'Modern computing era' }
        ];
        
        milestones.forEach(m => {
            if (m.year === this.state.year) {
                this.state.addEvent(`🏆 [MILESTONE] ${m.text}`);
            }
        });
    }
    
    // Process yearly events
    processYearlyEvents() {
        const rand = Math.random();
        
        if (rand < 0.15) {
            const eventTexts = [
                '📈 Market boom! Demand increased by 50%',
                '🏭 New competitor enters market',
                '⚠️ Supply chain disruption - production slowed',
                '📊 Consumer demand shifts toward higher performance',
                '📉 Economic recession affects market demand',
                '🎯 Breakthrough in manufacturing efficiency!'
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
        
        this.state.addEvent(`🔬 Researched: ${techName}`);
        return { success: true, message: `${techName} researched successfully!` };
    }
    
    // Start production of a CPU
    produceCPU(cpuId, quantity) {
        const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
        if (!cpu) return { success: false, message: 'CPU not found' };
        
        const productionCost = cpu.cost * quantity;
        if (this.state.money < productionCost) {
            return { success: false, message: `Insufficient funds. Need $${productionCost.toLocaleString()}, have $${this.state.money.toLocaleString()}` };
        }
        
        this.state.money -= productionCost;
        
        const productionYears = Math.max(1, Math.ceil(quantity / (this.state.manufacturingCapacity / 5)));
        this.state.productionQueue.push({
            cpuId: cpuId,
            cpuName: cpu.name,
            quantity: quantity,
            remainingYears: productionYears
        });
        
        this.state.addEvent(`🏭 Started production of ${quantity.toLocaleString()} ${cpu.name} units (${productionYears} years)`);
        return { success: true, message: `Production started! Will complete in ${productionYears} year(s)` };
    }
    
    endGame() {
        this.isPaused = true;
        const score = this.calculateFinalScore();
        this.state.addEvent(`🎮 [GAME OVER - Year 2026] Final Score: ${score}`);
    }
    
    calculateFinalScore() {
        const moneyScore = Math.floor(this.state.money / 1000000) * 100;
        const reputationScore = this.state.reputation * 10;
        const techScore = Object.values(this.state.technologies).filter(t => t.researched).length * 100;
        const inventoryScore = Object.values(this.state.cpuInventory).reduce((a, b) => a + b, 0);
        
        return moneyScore + reputationScore + techScore + inventoryScore;
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