// Main Game Initialization - FIXED VERSION
let gameEngine;
let uiManager;

document.addEventListener('DOMContentLoaded', function() {
    // Try to load saved game
    const hasLoadedGame = GameState.load();
    
    if (!hasLoadedGame) {
        // Start fresh game
        GameState.reset();
        GameState.addEvent('Game Started - Welcome to CPU Tycoon!');
        GameState.addEvent('Research 16-bit technology to unlock new CPUs');
    }
    
    // Mark as initialized to prevent duplicate CPU additions
    if (!GameState.isInitialized) {
        GameState.isInitialized = true;
        GameState.save();
    }
    
    // Initialize game engine and UI manager
    gameEngine = new GameEngine(GameState);
    uiManager = new UIManager(GameState, gameEngine);
    
    // Initialize UI
    uiManager.updateHeaderInfo();
    uiManager.updateOverviewTab();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        GameState.save();
        console.log('[Auto-save]', 'Game saved at', new Date().toLocaleTimeString());
    }, 30000);
    
    console.log('CPU Tycoon initialized successfully!');
    console.log('Current Year:', GameState.year);
    console.log('Money:', '$' + GameState.money.toLocaleString());
    console.log('Available CPUs:', GameState.getAvailableCPUs().length);
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Global functions for debugging
window.getGameState = function() {
    return GameState;
};

window.getGameEngine = function() {
    return gameEngine;
};

window.getUIManager = function() {
    return uiManager;
};

window.resetGame = function() {
    if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
        localStorage.removeItem('cpuTycoonSave');
        GameState.reset();
        location.reload();
    }
};
