


document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const userData = sessionStorage.getItem('sb-ccms-user');
    if (!userData) {
        window.location.href = '/auth.html';
        return;
    }
    
    const user = JSON.parse(userData);
    initializeDashboard(user);
    loadDashboardData();
    loadThreatsTable();
    loadCommunicationChannels();
    loadTrainingModules();
    
    // Set up event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('refreshBtn').addEventListener('click', refreshDashboard);
    document.getElementById('scanBtn').addEventListener('click', runSecurityScan);
    document.getElementById('drillBtn').addEventListener('click', startTrainingDrill);
    
    // Set up periodic data refresh
    setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
});

function initializeDashboard(user) {
    // Update user info in header
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = formatRole(user.role);
    
    // Update dashboard title based on role
    const roleTitles = {
        'commander': 'Command Dashboard',
        'cybersecurity': 'Cybersecurity Operations',
        'administrator': 'System Administration',
        'ict': 'ICT Monitoring Center'
    };
    
    document.getElementById('dashboardTitle').textContent = 
        roleTitles[user.role] || 'SB-CCMS Dashboard';
    
    // Highlight active nav item
    const currentPage = window.location.pathname === '/' ? 'dashboard' : 'dashboard';
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function formatRole(role) {
    const roles = {
        'commander': 'Commander',
        'cybersecurity': 'Cybersecurity Officer',
        'administrator': 'System Administrator',
        'ict': 'ICT Personnel'
    };
    return roles[role] || role;
}

function loadDashboardData() {
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            updateDashboardCards(data);
            updateSystemStatus(data.systemStatus);
            updateCharts(data);
            updatePersonnelStatus(data.personnelStatus);
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        });
}

function updateDashboardCards(data) {
    document.getElementById('activeThreats').textContent = data.activeThreats;
    document.getElementById('resolvedThreats').textContent = data.resolvedThreats;
    document.getElementById('networkLoad').textContent = `${data.networkLoad}%`;
    document.getElementById('systemUptime').textContent = data.uptime;
    
    // Update network load color based on percentage
    const networkLoadElement = document.getElementById('networkLoad');
    if (data.networkLoad > 85) {
        networkLoadElement.style.color = 'var(--danger)';
    } else if (data.networkLoad > 70) {
        networkLoadElement.style.color = 'var(--warning)';
    } else {
        networkLoadElement.style.color = 'var(--success)';
    }
}

function updateSystemStatus(status) {
    const statusElements = {
        'communication': document.getElementById('statusComm'),
        'cybersecurity': document.getElementById('statusCyber'),
        'network': document.getElementById('statusNetwork'),
        'backup': document.getElementById('statusBackup')
    };
    
    for (const [key, element] of Object.entries(statusElements)) {
        const statusValue = status[key];
        element.textContent = statusValue;
        
        // Update status dot color
        const statusDot = element.closest('.status-indicator').querySelector('.status-dot');
        statusDot.className = 'status-dot';
        
        if (statusValue.toLowerCase() === 'operational' || statusValue.toLowerCase() === 'active') {
            statusDot.classList.add('operational');
        } else if (statusValue.toLowerCase() === 'warning' || statusValue.toLowerCase() === 'standby') {
            statusDot.classList.add('warning');
        } else {
            statusDot.classList.add('critical');
        }
    }
}

function updateCharts(data) {
    // Update threat trends chart
    const threatTrends = document.getElementById('threatTrends');
    threatTrends.innerHTML = '';
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
        const value = Math.floor(Math.random() * 15) + 5;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value * 10}px`;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = day;
        
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = value;
        
        bar.appendChild(barValue);
        threatTrends.appendChild(bar);
        threatTrends.appendChild(label);
    });
    
    // Update network load chart
    const networkLoadChart = document.getElementById('networkLoadChart');
    networkLoadChart.innerHTML = '';
    
    const hours = Array.from({length: 12}, (_, i) => `${i*2}:00`);
    hours.forEach(hour => {
        const value = Math.floor(Math.random() * 40) + 50;
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value * 2}px`;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = hour;
        
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = `${value}%`;
        
        bar.appendChild(barValue);
        networkLoadChart.appendChild(bar);
        networkLoadChart.appendChild(label);
    });
}

function updatePersonnelStatus(personnel) {
    const personnelContainer = document.getElementById('personnelStatus');
    personnelContainer.innerHTML = '';
    
    personnel.forEach(person => {
        const personElement = document.createElement('div');
        personElement.className = 'personnel-item';
        personElement.innerHTML = `
            <div class="personnel-role">${person.role}</div>
            <div class="personnel-count">
                <span class="online">${person.online}</span>
                <span class="total">/${person.total}</span>
            </div>
        `;
        personnelContainer.appendChild(personElement);
    });
}

function loadThreatsTable() {
    fetch('/api/threats')
        .then(response => response.json())
        .then(threats => {
            const tbody = document.getElementById('threatsTableBody');
            tbody.innerHTML = '';
            
            threats.forEach(threat => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${threat.id}</td>
                    <td>${threat.type}</td>
                    <td><span class="severity ${threat.severity}">${threat.severity}</span></td>
                    <td>${threat.source}</td>
                    <td>${formatDateTime(threat.detectedAt)}</td>
                    <td><span class="status-badge ${threat.status}">${threat.status}</span></td>
                    <td class="action-cell">
                        ${threat.status === 'active' ? 
                          `<button class="btn btn-resolve" onclick="resolveThreat(${threat.id})">Resolve</button>` : 
                          `<span class="resolved-time">${formatDateTime(threat.resolvedAt)}</span>`
                        }
                        <button class="btn btn-details" onclick="showThreatDetails(${threat.id})">Details</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading threats:', error);
        });
}

function loadCommunicationChannels() {
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('channelsTableBody');
            tbody.innerHTML = '';
            
            data.communicationChannels.forEach(channel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${channel.name}</td>
                    <td><span class="status-badge ${channel.status}">${channel.status}</span></td>
                    <td>${channel.encryption}</td>
                    <td>${channel.status === 'active' ? '100%' : '0%'}</td>
                    <td>
                        <button class="btn btn-details">Monitor</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading channels:', error);
        });
}

function loadTrainingModules() {
    fetch('/api/training')
        .then(response => response.json())
        .then(modules => {
            const tbody = document.getElementById('trainingTableBody');
            tbody.innerHTML = '';
            
            modules.forEach(module => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${module.name}</td>
                    <td>${module.duration}</td>
                    <td><span class="status-badge ${module.status}">${module.status}</span></td>
                    <td>
                        ${module.completed ? 
                          '<i class="fas fa-check-circle" style="color: var(--success);"></i>' :
                          '<i class="fas fa-hourglass-half" style="color: var(--warning);"></i>'
                        }
                    </td>
                    <td>
                        <button class="btn ${module.completed ? 'btn-details' : 'btn-resolve'}" 
                                onclick="${module.completed ? 'reviewModule' : 'startModule'}(${module.id})">
                            ${module.completed ? 'Review' : 'Start'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading training modules:', error);
        });
}

function resolveThreat(threatId) {
    fetch(`/api/threats/${threatId}/resolve`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Threat ${threatId} resolved successfully`, 'success');
            loadThreatsTable();
            loadDashboardData();
        } else {
            showNotification(`Failed to resolve threat: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error resolving threat:', error);
        showNotification('Error resolving threat', 'error');
    });
}

function showThreatDetails(threatId) {
    fetch('/api/threats')
        .then(response => response.json())
        .then(threats => {
            const threat = threats.find(t => t.id === threatId);
            if (threat) {
                alert(`Threat Details:\n\nID: ${threat.id}\nType: ${threat.type}\nSeverity: ${threat.severity}\nSource: ${threat.source}\nDetected: ${formatDateTime(threat.detectedAt)}\nStatus: ${threat.status}`);
            }
        });
}

function runSecurityScan() {
    showNotification('Initiating system-wide security scan...', 'info');
    
    // Simulate scan progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
            showNotification(`Security scan in progress: ${progress}%`, 'info');
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            showNotification('Security scan completed. No critical issues found.', 'success');
        }
    }, 500);
}

function startTrainingDrill() {
    const scenarios = [
        'DDoS Attack Simulation',
        'Phishing Campaign Response',
        'Data Breach Containment',
        'Ransomware Attack Drill'
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    showNotification(`Starting training drill: ${scenario}`, 'warning');
    
    // Simulate drill progress
    setTimeout(() => {
        showNotification(`Drill completed. Team response time: ${Math.floor(Math.random() * 30) + 60} seconds`, 'success');
    }, 3000);
}

function refreshDashboard() {
    showNotification('Refreshing dashboard data...', 'info');
    loadDashboardData();
    loadThreatsTable();
    loadCommunicationChannels();
    
    setTimeout(() => {
        showNotification('Dashboard updated successfully', 'success');
    }, 1000);
}

function logout() {
    sessionStorage.removeItem('sb-ccms-user');
    window.location.href = '/auth.html';
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification.info {
        background-color: var(--primary-medium);
        border-left: 4px solid var(--primary-light);
    }
    
    .notification.success {
        background-color: var(--success);
        border-left: 4px solid #05c08f;
    }
    
    .notification.warning {
        background-color: var(--warning);
        color: var(--dark-bg);
        border-left: 4px solid #ffc043;
    }
    
    .notification.error {
        background-color: var(--danger);
        border-left: 4px solid #ff5252;
    }
    
    .notification button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 10px;
    }
`;
document.head.appendChild(notificationStyles);
