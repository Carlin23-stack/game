// CPU Designer Module - Custom CPU Creation
class CPUDesigner {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.designIdCounter = 10000; // Custom CPU IDs start at 10000
    }
    
    // Get available architectures for design
    getAvailableArchitectures() {
        const architectures = [
            { bits: 8, name: '8-bit', tech: '8-bit', minGHz: 0.001, maxGHz: 0.01, baseCost: 1000 },
            { bits: 16, name: '16-bit', tech: '16-bit', minGHz: 0.005, maxGHz: 0.1, baseCost: 5000 },
            { bits: 32, name: '32-bit', tech: '32-bit', minGHz: 0.01, maxGHz: 2.0, baseCost: 15000 },
            { bits: 64, name: '64-bit', tech: '64-bit', minGHz: 0.1, maxGHz: 5.0, baseCost: 50000 }
        ];
        
        return architectures.filter(arch => this.state.technologies[arch.tech]?.researched);
    }
    
    // Get valid core counts for architecture
    getValidCoreCounts(bits) {
        if (bits <= 16) return [1];
        if (bits === 32) return [1, 2];
        if (bits === 64) {
            // Multi-core available if researched
            if (this.state.technologies['Multi-core']?.researched) {
                return [1, 2, 4, 8, 16];
            }
            return [1, 2];
        }
        return [1];
    }
    
    // Calculate R&D cost for a CPU design
    calculateDesignCost(specs) {
        const arch = this.getAvailableArchitectures().find(a => a.bits === specs.bits);
        if (!arch) return null;
        
        let cost = arch.baseCost;
        
        // Cost per core
        cost += (specs.cores - 1) * 10000;
        
        // Cost based on GHz
        const speedMultiplier = specs.ghz / arch.minGHz;
        cost += cost * (speedMultiplier * 0.2);
        
        return Math.floor(cost);
    }
    
    // Calculate manufacturing cost per unit
    calculateManufacturingCost(specs) {
        let cost = 10 + (specs.bits / 8);
        cost += specs.cores * 20;
        cost += specs.ghz * 100;
        return Math.floor(cost);
    }
    
    // Estimate market price
    estimateMarketPrice(specs) {
        let price = 100 + (specs.bits * 10);
        price += specs.cores * 200;
        price += specs.ghz * 500;
        return Math.floor(price);
    }
    
    // Design a new CPU
    designCPU(specs) {
        // specs: { name, bits, cores, ghz }
        
        // Validation
        if (!specs.name || specs.name.trim() === '') {
            return { success: false, message: 'Please enter a CPU name' };
        }
        
        if (specs.name.length > 50) {
            return { success: false, message: 'CPU name too long (max 50 characters)' };
        }
        
        // Check if architecture is available
        const availableArchs = this.getAvailableArchitectures();
        if (!availableArchs.find(a => a.bits === specs.bits)) {
            return { success: false, message: `${specs.bits}-bit architecture not researched` };
        }
        
        // Check if core count is valid
        const validCores = this.getValidCoreCounts(specs.bits);
        if (!validCores.includes(specs.cores)) {
            return { success: false, message: `Invalid core count for ${specs.bits}-bit CPU` };
        }
        
        // Check GHz range
        const arch = availableArchs.find(a => a.bits === specs.bits);
        if (specs.ghz < arch.minGHz || specs.ghz > arch.maxGHz) {
            return { success: false, message: `Clock speed must be between ${arch.minGHz} and ${arch.maxGHz} GHz` };
        }
        
        // Calculate costs
        const designCost = this.calculateDesignCost(specs);
        const manufacturingCost = this.calculateManufacturingCost(specs);
        const marketPrice = this.estimateMarketPrice(specs);
        
        if (this.state.money < designCost) {
            return { success: false, message: `Insufficient funds. R&D costs $${designCost.toLocaleString()}, you have $${this.state.money.toLocaleString()}` };
        }
        
        // Create the CPU design
        const cpuId = `custom_${this.designIdCounter++}`;
        const newCPU = {
            id: cpuId,
            name: specs.name,
            bits: specs.bits,
            cores: specs.cores,
            ghz: specs.ghz,
            cost: manufacturingCost,
            marketPrice: marketPrice,
            year: this.state.year,
            techRequired: [arch.name],
            marketDemand: Math.floor(100000 / specs.ghz), // Faster CPUs less common
            isCustom: true
        };
        
        // Deduct R&D costs
        this.state.money -= designCost;
        this.state.reputation += 25;
        
        // Add to CPU designs
        this.state.cpuDesigns.push(newCPU);
        
        // Log event
        this.state.addEvent(`🎨 Designed: ${specs.name} (${specs.bits}-bit, ${specs.cores} cores, ${specs.ghz} GHz)`);
        
        return {
            success: true,
            message: `${specs.name} designed successfully!`,
            cpu: newCPU,
            manufacturingCost: manufacturingCost,
            marketPrice: marketPrice
        };
    }
    
    // Get CPU design by ID
    getCPU(cpuId) {
        return this.state.cpuDesigns.find(cpu => cpu.id === cpuId);
    }
    
    // Duplicate a custom CPU design
    duplicateDesign(cpuId, newName) {
        const original = this.getCPU(cpuId);
        if (!original) {
            return { success: false, message: 'CPU not found' };
        }
        
        const duplicateCost = this.calculateDesignCost({
            bits: original.bits,
            cores: original.cores,
            ghz: original.ghz
        }) * 0.5; // 50% cheaper to duplicate
        
        if (this.state.money < duplicateCost) {
            return { success: false, message: 'Insufficient funds to duplicate design' };
        }
        
        this.state.money -= duplicateCost;
        
        const duplicateId = `custom_${this.designIdCounter++}`;
        const duplicate = {
            ...original,
            id: duplicateId,
            name: newName,
            year: this.state.year
        };
        
        this.state.cpuDesigns.push(duplicate);
        this.state.addEvent(`📋 Duplicated ${original.name} as ${newName}`);
        
        return { success: true, message: 'Design duplicated successfully!' };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CPUDesigner;
}