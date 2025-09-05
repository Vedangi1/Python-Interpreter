// Configuration
const BACKEND_URL = 'http://localhost:5000';

// Create background particles
function createParticles() {
  const particles = document.getElementById('particles');
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 5 + 2;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 15;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}vw`;
    particle.style.top = `${posY}vh`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    
    // Random gradient color
    const colors = ['#00ff9d', '#00b3ff', '#0077ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;
    
    particles.appendChild(particle);
  }
}

// Show toast notification
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Copy content to clipboard
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  let textToCopy = '';
  
  if (elementId === 'output') {
    textToCopy = element.textContent;
  } else {
    textToCopy = element.value;
  }
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast('Copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard');
    });
}

// Clear input field
function clearInput() {
  document.getElementById('userInput').value = '';
  showToast('Input cleared');
}

// Clear output field
function clearOutput() {
  document.getElementById('output').textContent = 'Output cleared. Ready for new execution.\n';
  document.getElementById('last-execution').textContent = '';
  updateStatus('Ready', 'success');
  showToast('Output cleared');
}

// Reset code to default
function resetCode() {
  document.getElementById('code').value = `# Enter your Python code here
print("Hello, World!")
`;
  showToast('Code reset to default');
}

// Toggle fullscreen for textareas
function toggleFullscreen(elementId) {
  const element = document.getElementById(elementId);
  
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    showToast('Entered fullscreen mode');
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    showToast('Exited fullscreen mode');
  }
}

// Update status indicator
function updateStatus(message, type = 'info') {
  const statusElement = document.getElementById('status-indicator');
  let icon = '';
  let color = '';
  
  switch(type) {
    case 'running':
      icon = '<i class="fas fa-sync fa-spin"></i>';
      color = '#00b3ff';
      break;
    case 'success':
      icon = '<i class="fas fa-circle"></i>';
      color = '#00ff9d';
      break;
    case 'error':
      icon = '<i class="fas fa-circle"></i>';
      color = '#ff4757';
      break;
    default:
      icon = '<i class="fas fa-circle"></i>';
      color = '#a8b2d1';
  }
  
  statusElement.innerHTML = `${icon} ${message}`;
  statusElement.style.color = color;
}

// Run Python code
function runCode() {
  const code = document.getElementById("code").value;
  const input = document.getElementById("userInput").value;
  
  // Show running state
  const outputElement = document.getElementById("output");
  outputElement.innerHTML = "Executing code...<span class='blink'>_</span>";
  
  // Update status
  updateStatus('Running', 'running');
  
  // Send request to backend
  fetch(`${BACKEND_URL}/run`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, input })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    const output = data.output || data.error || "No output";
    outputElement.textContent = output;
    
    // Update status
    updateStatus('Success', 'success');
    document.getElementById('last-execution').textContent = 
      `Last execution: ${new Date().toLocaleTimeString()}`;
  })
  .catch(error => {
    outputElement.textContent = `Error: ${error.message}\n\nPlease make sure the Python server is running on ${BACKEND_URL}`;
    
    // Update status
    updateStatus('Error', 'error');
  });
}

// Theme toggle functionality
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.querySelector('.theme-toggle i');
  
  if (body.classList.contains('light-theme')) {
    body.classList.remove('light-theme');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    showToast('Dark theme activated');
  } else {
    body.classList.add('light-theme');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    showToast('Light theme activated');
  }
}

// Initialize the application
function initApp() {
  // Create background particles
  createParticles();
  
  // Add event listener for Ctrl+Enter to run code
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
      runCode();
    }
  });
  
  // Handle fullscreen change
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
  
  // Check if backend is available
  checkBackendConnection();
}

function handleFullscreenChange() {
  // You could add specific handling for fullscreen changes here
}

// Check backend connection
function checkBackendConnection() {
  fetch(`${BACKEND_URL}/health`)
    .then(response => {
      if (response.ok) {
        console.log('Backend connection successful');
        showToast('Connected to backend', 1500);
      } else {
        console.warn('Backend responded with non-OK status');
      }
    })
    .catch(error => {
      console.warn('Backend connection failed:', error.message);
      showToast('Backend not connected', 3000);
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);