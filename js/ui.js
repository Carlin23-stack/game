// UI Management - Handles all UI updates and interactions
class UIManager {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Year advancement
        document.getElementById('next-year-btn').addEventListener('click', () => this.advanceYear());
        
        // Speed controls
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSpeed(parseInt(e.target.dataset.speed)));
        });
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            this.updateTab(tabName);
        }
    }
    
    updateTab(tabName) {
        switch(tabName) {
            case 'overview':
                this.updateOverviewTab();
                break;
            case 'research':
                this.updateResearchTab();
                break;
            case 'manufacturing':
                this.updateManufacturingTab();
                break;
            case 'market':
                this.updateMarketTab();
                break;
            case 'cpus':
                this.updateCPUsTab();
                break;
        }
    }
    
    updateOverviewTab() {
        // Update resources
        const resourcesHTML = `
            <li class="resource-item"><span class="label">Money:</span> <span class="value">$${this.state.money.toLocaleString()}</span></li>
            <li class="resource-item"><span class="label">Reputation:</span> <span class="value">${this.state.reputation}</span></li>
            <li class="resource-item"><span class="label">Research Points:</span> <span class="value">${Math.floor(this.state.researchPoints)}</span></li>
            <li class="resource-item"><span class="label">Manufacturing Capacity:</span> <span class="value">${this.state.manufacturingCapacity.toLocaleString()} units/year</span></li>
            <li class="resource-item"><span class="label">Research Facilities:</span> <span class="value">${this.state.researchFacilities}</span></li>
        `;
        const resourcesList = document.getElementById('resources-list');
        if (resourcesList) {
            resourcesList.innerHTML = resourcesHTML;
        }
        
        // Update events
        const eventsHTML = this.state.eventLog.slice(-10).reverse().map(e => 
            `<div class="event-item">[${e.year}] ${e.text}</div>`
        ).join('');
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            eventsList.innerHTML = eventsHTML || '<div class="event-item">No events yet</div>';
        }
    }
    
    updateResearchTab() {
        const researchGrid = document.getElementById('research-grid');
        if (!researchGrid) return;
        
        let html = '';
        Object.entries(this.state.technologies).forEach(([techName, tech]) => {
            const isAvailable = this.state.year >= tech.year;
            const isResearched = tech.researched;
            const canAfford = this.state.money >= tech.cost && this.state.researchPoints >= tech.repPoints;
            
            const statusClass = isResearched ? 'completed' : '';
            const disabled = isResearched || !isAvailable || !canAfford;
            
            html += `
                <div class="card research-item ${statusClass}">
                    <h3>${techName}</h3>
                    <p>Available: ${tech.year}</p>
                    <p>Cost: $${tech.cost.toLocaleString()} | RP: ${tech.repPoints}</p>
                    <p>Status: ${isResearched ? '✓ RESEARCHED' : 'Not Researched'}</p>
                    ${!isResearched && isAvailable ? `<button class="research-btn" data-tech="${techName}" ${!canAfford ? 'disabled' : ''}>Research</button>` : ''}
                </div>
            `;
        });
        
        researchGrid.innerHTML = html;
        
        // Add event listeners to research buttons
        document.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.researchTechnology(e.target.dataset.tech));
        });
    }
    
    updateManufacturingTab() {
        // CPU Designs
        const cpuDesignsList = document.getElementById('cpu-designs-list');
        if (cpuDesignsList) {
            let html = '';
            this.state.cpuDesigns.forEach(cpu => {
                if (this.state.year >= cpu.year) {
                    html += `
                        <div class="card cpu-item">
                            <h4>${cpu.name}</h4>
                            <p>Bits: ${cpu.bits} | Cores: ${cpu.cores} | Speed: ${cpu.ghz} GHz</p>
                            <p>Production Cost: $${cpu.cost} per unit</p>
                            <p>Market Price: $${this.engine.calculateMarketPrice(cpu)}</p>
                            <input type="number" min="1" max="100000" value="1000" class="quantity-input" data-cpu="${cpu.id}">
                            <button class="produce-btn" data-cpu="${cpu.id}">Produce</button>
                        </div>
                    `;
                }
            });
            cpuDesignsList.innerHTML = html;
            
            // Add event listeners
            document.querySelectorAll('.produce-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.produceCPU(e.target.dataset.cpu));
            });
        }
        
        // Production Queue
        const productionQueue = document.getElementById('production-queue');
        if (productionQueue) {
            const queueHTML = this.state.productionQueue.map(item => `
                <div class="cpu-item">
                    <p>${item.cpuName}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Years Remaining: ${item.remainingYears}</p>
                </div>
            `).join('');
            productionQueue.innerHTML = queueHTML || '<div class="cpu-item">No production in progress</div>';
        }
    }
    
    updateMarketTab() {
        // Sellable CPUs
        const sellCPUsList = document.getElementById('sell-cpus-list');
        if (sellCPUsList) {
            let html = '';
            Object.entries(this.state.cpuInventory).forEach(([cpuId, quantity]) => {
                const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
                if (cpu && quantity > 0) {
                    const price = this.engine.calculateMarketPrice(cpu);
                    const revenue = quantity * price;
                    html += `
                        <div class="cpu-item">
                            <h4>${cpu.name}</h4>
                            <p>Inventory: ${quantity} units</p>
                            <p>Price per unit: $${price}</p>
                            <p>Total value: $${revenue.toLocaleString()}</p>
                            <button class="sell-all-btn" data-cpu="${cpuId}">Sell All</button>
                        </div>
                    `;
                }
            });
            sellCPUsList.innerHTML = html || '<div class="cpu-item">No CPUs in inventory</div>';
            
            // Add event listeners
            document.querySelectorAll('.sell-all-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.sellAllCPUs(e.target.dataset.cpu));
            });
        }
        
        // Market trends
        const marketTrends = document.getElementById('market-trends');
        if (marketTrends) {
            const trendsHTML = `
                <li class="resource-item"><span class="label">Current Year:</span> <span class="value">${this.state.year}</span></li>
                <li class="resource-item"><span class="label">Total CPUs Designed:</span> <span class="value">${this.state.cpuDesigns.length}</span></li>
                <li class="resource-item"><span class="label">Market Demand (Avg):</span> <span class="value">~50,000 units/year</span></li>
                <li class="resource-item"><span class="label">Competition Level:</span> <span class="value">Growing</span></li>
            `;
            marketTrends.innerHTML = trendsHTML;
        }
    }
    
    updateCPUsTab() {
        const cpusLineup = document.getElementById('cpus-lineup');
        if (!cpusLineup) return;
        
        let html = '';
        this.state.cpuDesigns.forEach(cpu => {
            if (this.state.year >= cpu.year) {
                const inventory = this.state.cpuInventory[cpu.id] || 0;
                html += `
                    <div class="card cpu-item">
                        <h3>${cpu.name}</h3>
                        <p><strong>Year Released:</strong> ${cpu.year}</p>
                        <p><strong>Specifications:</strong></p>
                        <ul>
                            <li>Architecture: ${cpu.bits}-bit</li>
                            <li>Cores: ${cpu.cores}</li>
                            <li>Clock Speed: ${cpu.ghz} GHz</li>
                        </ul>
                        <p><strong>Economics:</strong></p>
                        <ul>
                            <li>Production Cost: $${cpu.cost}</li>
                            <li>Current Market Price: $${this.engine.calculateMarketPrice(cpu)}</li>
                            <li>Units in Inventory: ${inventory}</li>
                        </ul>
                    </div>
                `;
            }
        });
        
        cpusLineup.innerHTML = html;
    }
    
    updateHeaderInfo() {
        document.getElementById('year-display').textContent = `Year: ${this.state.year}`;
        document.getElementById('money-display').textContent = `Money: $${this.state.money.toLocaleString()}`;
        document.getElementById('reputation-display').textContent = `Reputation: ${this.state.reputation}`;
    }
    
    advanceYear() {
        this.engine.advanceYear();
        this.updateHeaderInfo();
        this.updateTab('overview');
    }
    
    researchTechnology(techName) {
        const result = this.engine.researchTechnology(techName);
        alert(result.message);
        this.updateHeaderInfo();
        this.updateResearchTab();
    }
    
    produceCPU(cpuId) {
        const quantityInput = document.querySelector(`[data-cpu="${cpuId}"].quantity-input`);
        const quantity = parseInt(quantityInput.value);
        
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }
        
        const result = this.engine.produceCPU(cpuId, quantity);
        alert(result.message);
        this.updateHeaderInfo();
        this.updateManufacturingTab();
    }
    
    sellAllCPUs(cpuId) {
        const inventory = this.state.cpuInventory[cpuId];
        const cpu = this.state.cpuDesigns.find(c => c.id === cpuId);
        const price = this.engine.calculateMarketPrice(cpu);
        const revenue = inventory * price;
        
        this.state.money += revenue;
        this.state.cpuInventory[cpuId] = 0;
        this.state.addEvent(`Sold ${inventory} units of ${cpu.name} for $${revenue.toLocaleString()}`);
        
        this.updateHeaderInfo();
        this.updateMarketTab();
    }
    
    setSpeed(speed) {
        this.engine.setGameSpeed(speed);
        document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-speed="${speed}"]`).classList.add('active');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}