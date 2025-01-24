let cookies = 0;
let cursors = 0;
let grandmas = 0;
let farms = 0;
let factories = 0;
let clickMultiplier = 1;
let autoMultiplier = 1;

const upgrades = {
    cursor: {
        cost: 10,
        cps: 0.1
    },
    grandma: {
        cost: 50,
        cps: 1
    },
    farm: {
        cost: 500,
        cps: 8
    },
    factory: {
        cost: 2000,
        cps: 40
    }
};

const powerups = {
    doubleClick: {
        cost: 100,
        owned: false
    },
    autoBoost: {
        cost: 500,
        owned: false
    }
};

const achievements = {
    beginner: {
        name: "Cookie Beginner",
        requirement: 100,
        earned: false
    },
    amateur: {
        name: "Cookie Amateur",
        requirement: 1000,
        earned: false
    },
    professional: {
        name: "Cookie Professional",
        requirement: 10000,
        earned: false
    },
    collector1: {
        name: "Collector I",
        requirement: 5,
        type: "upgrades",
        earned: false
    },
    collector2: {
        name: "Collector II",
        requirement: 10,
        type: "upgrades",
        earned: false
    }
};

function createMiniCookie(x, y) {
    const cookie = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    cookie.setAttribute("viewBox", "0 0 100 100");
    cookie.classList.add("mini-cookie");
    
    // Cookie base
    const base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    base.setAttribute("cx", "50");
    base.setAttribute("cy", "50");
    base.setAttribute("r", "45");
    base.setAttribute("fill", "#C87D32");
    
    // Cookie chip
    const chip = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    chip.setAttribute("cx", "50");
    chip.setAttribute("cy", "50");
    chip.setAttribute("r", "10");
    chip.setAttribute("fill", "#8B4513");
    
    cookie.appendChild(base);
    cookie.appendChild(chip);
    
    // Random movement
    const moveX = (Math.random() - 0.5) * 200;
    const moveY = -Math.random() * 150 - 50;
    const rotation = (Math.random() - 0.5) * 720;
    
    cookie.style.left = `${x}px`;
    cookie.style.top = `${y}px`;
    cookie.style.setProperty('--moveX', `${moveX}px`);
    cookie.style.setProperty('--moveY', `${moveY}px`);
    cookie.style.setProperty('--rotation', `${rotation}deg`);
    cookie.style.animation = 'floatAway 1s ease-out forwards';
    
    document.body.appendChild(cookie);
    setTimeout(() => cookie.remove(), 1000);
}

function createPopup(amount, x, y) {
    const popup = document.createElement('div');
    popup.className = 'cookie-popup';
    popup.textContent = `+${amount}`;
    
    // Random offset for variety
    const offsetX = (Math.random() - 0.5) * 40;
    popup.style.left = `${x + offsetX}px`;
    popup.style.top = `${y}px`;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function cookieClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Calculate the actual amount with multiplier
    const amount = clickMultiplier * (autoMultiplier > 1 ? autoMultiplier : 1);
    cookies += amount;
    
    // Create multiple effects
    createPopup(amount.toFixed(1), x, y);
    
    // Create 3-5 mini cookies
    const numCookies = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numCookies; i++) {
        setTimeout(() => {
            createMiniCookie(x, y);
        }, i * 50);
    }
    
    updateDisplay();
    checkAchievements();
}

function buyPowerup(type) {
    if (cookies >= powerups[type].cost && !powerups[type].owned) {
        cookies -= powerups[type].cost;
        powerups[type].owned = true;
        
        if (type === 'doubleClick') {
            clickMultiplier *= 2;
        } else if (type === 'autoBoost') {
            autoMultiplier *= 1.5;
        }
        
        document.getElementById(type).disabled = true;
        updateDisplay();
    }
}

function checkAchievements() {
    let totalUpgrades = cursors + grandmas + farms + factories;
    
    for (let [id, achievement] of Object.entries(achievements)) {
        if (!achievement.earned) {
            let earned = false;
            if (achievement.type === 'upgrades') {
                earned = totalUpgrades >= achievement.requirement;
            } else {
                earned = cookies >= achievement.requirement;
            }
            
            if (earned) {
                unlockAchievement(id);
            }
        }
    }
}

function unlockAchievement(id) {
    if (!achievements[id].earned) {
        achievements[id].earned = true;
        
        // Create new achievement div
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        
        // Create SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#achievement-${id}`);
        svg.appendChild(use);
        
        // Create text container
        const textDiv = document.createElement('div');
        textDiv.className = 'achievement-text';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'achievement-name';
        nameSpan.textContent = achievements[id].name;
        
        const descSpan = document.createElement('span');
        descSpan.className = 'achievement-desc';
        descSpan.textContent = achievements[id].type === 'upgrades' 
            ? `Own ${achievements[id].requirement} upgrades`
            : `Get ${achievements[id].requirement.toLocaleString()} cookies`;
        
        textDiv.appendChild(nameSpan);
        textDiv.appendChild(descSpan);
        
        achievementDiv.appendChild(svg);
        achievementDiv.appendChild(textDiv);
        
        // Add to achievement list
        document.getElementById('achievement-list').appendChild(achievementDiv);
        
        // Add unlocked class with slight delay for animation
        setTimeout(() => achievementDiv.classList.add('unlocked'), 10);
        
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${svg.outerHTML}
                <p>${achievements[id].name}</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

function updateDisplay() {
    document.getElementById('cookie-count').textContent = Math.floor(cookies);
    document.getElementById('cursor-count').textContent = cursors;
    document.getElementById('grandma-count').textContent = grandmas;
    document.getElementById('farm-count').textContent = farms;
    document.getElementById('factory-count').textContent = factories;
    document.getElementById('multiplier').textContent = (clickMultiplier * autoMultiplier).toFixed(1);
    document.getElementById('cps').textContent = calculateCPS().toFixed(1);
    
    // Update upgrade buttons and their costs
    for (const type of ['cursor', 'grandma', 'farm', 'factory']) {
        const button = document.getElementById(type);
        button.disabled = cookies < upgrades[type].cost;
        button.innerHTML = 
            `Buy ${type.charAt(0).toUpperCase() + type.slice(1)} (Cost: ${Math.floor(upgrades[type].cost)} cookies) - You have: <span id="${type}-count">${eval(type + 's')}</span>`;
    }
}

function calculateCPS() {
    return ((cursors * upgrades.cursor.cps) + 
            (grandmas * upgrades.grandma.cps) +
            (farms * upgrades.farm.cps) +
            (factories * upgrades.factory.cps)) * autoMultiplier;
}

function buyUpgrade(type) {
    if (cookies >= upgrades[type].cost) {
        cookies -= upgrades[type].cost;
        switch(type) {
            case 'cursor':
                cursors++;
                break;
            case 'grandma':
                grandmas++;
                break;
            case 'farm':
                farms++;
                break;
            case 'factory':
                factories++;
                break;
        }
        
        // Increase cost by 15%
        upgrades[type].cost = Math.ceil(upgrades[type].cost * 1.15);
        updateDisplay();
        checkAchievements();
    }
}

// Add click event listener to cookie
document.getElementById('cookie').addEventListener('click', (e) => cookieClick(e));

// Update cookies based on CPS every 100ms
setInterval(() => {
    cookies += calculateCPS() / 10;
    updateDisplay();
    checkAchievements();
}, 100); 