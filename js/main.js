// Main Game Initialization

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Try to load saved game
    const hasLoadedGame = GameState.load();
    
    if (!hasLoadedGame) {
        // Start fresh game
        GameState.reset();
        GameState.addEvent('Game Started - Welcome to CPU Tycoon!');
        GameState.save();
    }
    
    // Initialize game engine and UI manager
    const gameEngine = new GameEngine(GameState);
    const uiManager = new UIManager(GameState, gameEngine);
    
    // Initialize UI
    uiManager.updateHeaderInfo();
    uiManager.updateOverviewTab();
    
    // Add some initial CPU designs to the game
    initializeInitialCPUs();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        GameState.save();
    }, 30000);
    
    console.log('CPU Tycoon initialized successfully!');
    console.log('Game State:', GameState);
    console.log('Game Engine:', gameEngine);
    console.log('UI Manager:', uiManager);
});

function initializeInitialCPUs() {
    // Add more CPU designs for different eras
    const additionalCPUs = [
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
    ];
    
    GameState.cpuDesigns.push(...additionalCPUs);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}
