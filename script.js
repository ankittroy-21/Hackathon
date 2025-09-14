/**
 * Enhanced JavaScript for Indian Health Assistant
 * Features: Language detection, voice animations, improved UX
 */

class HealthAssistant {
    constructor() {
        this.chatHistory = document.getElementById('chatHistory');
        this.chatForm = document.getElementById('chatForm');
        this.userInput = document.getElementById('userInput');
        this.voiceButton = document.getElementById('voiceButton');
        this.sendButton = document.getElementById('sendButton');
        
        this.isRecording = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.currentLanguage = 'hi-IN';
        this.rippleContainer = null;
        
        this.init();
    }
    
    init() {
        this.setupSpeechRecognition();
        this.setupEventListeners();
        this.createVoiceRippleContainer();
        this.setupLanguageDetection();
    }
    
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }
        
        if (this.recognition) {
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.currentLanguage;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateVoiceButtonState();
                this.showVoiceRipples();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.trim()) {
                    const detectedLang = this.detectLanguage(transcript);
                    this.sendMessage(transcript, true, detectedLang);
                }
                this.stopRecording();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopRecording();
                this.appendMessage('आवाज़ पहचानने में समस्या हुई। कृपया दोबारा कोशिश करें। 🎤', 'bot');
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        }
    }
    
    setupEventListeners() {
        // Voice button click
        this.voiceButton.addEventListener('click', () => {
            this.toggleVoiceRecording();
        });
        
        // Form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = this.userInput.value.trim();
            if (!query) return;
            
            const detectedLang = this.detectLanguage(query);
            this.sendMessage(query, false, detectedLang);
        });
        
        // Auto-resize input and better UX
        this.userInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });
        
        // Enter key handling
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.chatForm.dispatchEvent(new Event('submit'));
            }
        });
        
        // Stop speech when user starts typing
        this.userInput.addEventListener('input', () => {
            if (this.isSpeaking) {
                this.stopSpeaking();
            }
        });
    }
    
    createVoiceRippleContainer() {
        this.rippleContainer = document.createElement('div');
        this.rippleContainer.className = 'voice-ripple-container';
        this.rippleContainer.innerHTML = `
            <div class="voice-ripple"></div>
            <div class="voice-ripple"></div>
            <div class="voice-ripple"></div>
        `;
        this.voiceButton.appendChild(this.rippleContainer);
        this.rippleContainer.style.display = 'none';
    }
    
    detectLanguage(text) {
        // Enhanced language detection
        const hindiPattern = /[\u0900-\u097F]/;
        const englishPattern = /^[a-zA-Z\s.,!?'"()-]+$/;
        
        if (hindiPattern.test(text)) {
            return 'hindi';
        } else if (englishPattern.test(text)) {
            return 'english';
        } else {
            // Mixed or Hinglish
            const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
            const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
            
            if (hindiChars > englishChars) {
                return 'hindi';
            } else if (englishChars > hindiChars) {
                return 'hinglish';
            } else {
                return 'hinglish';
            }
        }
    }
    
    setupLanguageDetection() {
        // Set initial language based on browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('hi')) {
            this.currentLanguage = 'hi-IN';
        } else {
            this.currentLanguage = 'en-IN';
        }
        
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage;
        }
    }
    
    toggleVoiceRecording() {
        if (!this.recognition) {
            this.showAlert('आपका ब्राउज़र आवाज़ पहचान को सपोर्ट नहीं करता। Your browser doesn\'t support voice recognition.');
            return;
        }
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showAlert('आवाज़ रिकॉर्डिंग शुरू नहीं हो सकी। Voice recording could not start.');
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.updateVoiceButtonState();
        this.hideVoiceRipples();
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }
    }
    
    updateVoiceButtonState() {
        const iconContainer = this.voiceButton.querySelector('.icon-container');
        
        if (this.isRecording) {
            this.voiceButton.classList.add('recording');
            this.voiceButton.title = 'Recording... Click to stop (रिकॉर्डिंग हो रही है...)';
            if (iconContainer) {
                iconContainer.innerHTML = this.getHugeIcon('MicOff01Icon');
            }
        } else {
            this.voiceButton.classList.remove('recording', 'speaking');
            this.voiceButton.title = 'Voice Input (आवाज़ में बोलें)';
            if (iconContainer) {
                iconContainer.innerHTML = this.getHugeIcon('Mic01Icon');
            }
        }
    }
    
    showVoiceRipples() {
        if (this.rippleContainer) {
            this.rippleContainer.style.display = 'block';
        }
    }
    
    hideVoiceRipples() {
        if (this.rippleContainer) {
            this.rippleContainer.style.display = 'none';
        }
    }
    
    getHugeIcon(iconName) {
        // SVG icons from Hugeicons library
        const icons = {
            'Mic01Icon': `
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" fill="currentColor"/>
                    <path d="M8 10V12C8 15.3137 10.6863 18 14 18H16V20H14C9.58172 20 6 16.4183 6 12V10H8Z" fill="currentColor"/>
                    <path d="M18 10V12C18 16.4183 14.4183 20 10 20H8V18H10C13.3137 18 16 15.3137 16 12V10H18Z" fill="currentColor"/>
                    <path d="M11 21H13V23H11V21Z" fill="currentColor"/>
                </svg>
            `,
            'MicOff01Icon': `
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12V4C15 2.34315 13.6569 1 12 1C10.3431 1 9 2.34315 9 4V7L15 13V12Z" fill="currentColor"/>
                    <path d="M8 10V12C8 15.3137 10.6863 18 14 18H16V20H14C9.58172 20 6 16.4183 6 12V10H8Z" fill="currentColor"/>
                    <path d="M18 10V12C18 16.4183 14.4183 20 10 20H8V18H10C13.3137 18 16 15.3137 16 12V10H18Z" fill="currentColor"/>
                    <path d="M11 21H13V23H11V21Z" fill="currentColor"/>
                    <path d="M3 3L21 21M3 3L9 9M21 21L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `
        };
        
        return icons[iconName] || icons['Mic01Icon'];
    }
    
    async sendMessage(query, isVoiceInput = false, detectedLanguage = 'hinglish') {
        this.appendMessage(query, 'user');
        this.userInput.value = '';
        this.adjustInputHeight();
        this.showLoading();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query, 
                    isVoiceInput,
                    detectedLanguage,
                    requestVoiceResponse: isVoiceInput,
                    browserLanguage: navigator.language || 'hi-IN'
                })
            });
            
            const data = await response.json();
            this.removeLoading();
            
            if (data.message) {
                this.appendMessage(data.message, 'bot', isVoiceInput);
                
                // Speak response if it was a voice input or user prefers audio
                if (isVoiceInput || data.voiceResponse) {
                    this.speak(data.message, detectedLanguage);
                }
            } else {
                const errorMsg = this.getErrorMessage(detectedLanguage);
                this.appendMessage(errorMsg, 'bot');
                if (isVoiceInput) this.speak(errorMsg, detectedLanguage);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.removeLoading();
            const errorMsg = this.getConnectionErrorMessage(detectedLanguage);
            this.appendMessage(errorMsg, 'bot');
            if (isVoiceInput) this.speak(errorMsg, detectedLanguage);
        }
    }
    
    appendMessage(text, sender, isVoice = false) {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;
        
        // Enhanced message formatting
        const formattedText = this.formatMessage(text);
        msg.innerHTML = formattedText;
        
        if (isVoice && sender === 'bot') {
            msg.innerHTML += ' <span style="opacity: 0.7; font-size: 0.8em; margin-left: 8px;">🔊</span>';
        }
        
        // Add timestamp for better chat experience
        const timestamp = new Date().toLocaleTimeString('hi-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const timeEl = document.createElement('div');
        timeEl.style.fontSize = '0.7em';
        timeEl.style.opacity = '0.6';
        timeEl.style.marginTop = '4px';
        timeEl.style.textAlign = sender === 'user' ? 'right' : 'left';
        timeEl.textContent = timestamp;
        msg.appendChild(timeEl);
        
        this.chatHistory.appendChild(msg);
        this.scrollToBottom();
        
        // Add entrance animation
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            msg.style.transition = 'all 0.3s ease';
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';
        });
    }
    
    formatMessage(text) {
        // Enhanced text formatting with better HTML handling
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 4px;">$1</code>');
    }
    
    showLoading() {
        const loading = document.createElement('div');
        loading.className = 'message bot';
        loading.id = 'loadingMsg';
        loading.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="loading"></div>
                <span>जवाब तैयार किया जा रहा है... / Preparing response...</span>
            </div>
        `;
        this.chatHistory.appendChild(loading);
        this.scrollToBottom();
    }
    
    removeLoading() {
        const loading = document.getElementById('loadingMsg');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 300);
        }
    }
    
    speak(text, language = 'hinglish') {
        if (!this.speechSynthesis) return;
        
        // Stop any ongoing speech
        this.stopSpeaking();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Enhanced voice selection based on detected language
        this.setVoiceForLanguage(utterance, language);
        
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.voiceButton.classList.add('speaking');
            this.voiceButton.querySelector('.icon-container').innerHTML = '🔊';
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.voiceButton.classList.remove('speaking');
            this.updateVoiceButtonState();
        };
        
        utterance.onerror = () => {
            this.isSpeaking = false;
            this.voiceButton.classList.remove('speaking');
            this.updateVoiceButtonState();
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    setVoiceForLanguage(utterance, language) {
        const voices = this.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        switch (language) {
            case 'hindi':
                selectedVoice = voices.find(voice => 
                    voice.lang.includes('hi') || voice.name.includes('Hindi')
                );
                utterance.lang = 'hi-IN';
                break;
            case 'english':
                selectedVoice = voices.find(voice => 
                    voice.lang.includes('en-IN') || voice.name.includes('Indian')
                );
                utterance.lang = 'en-IN';
                break;
            default: // hinglish
                selectedVoice = voices.find(voice => 
                    voice.lang.includes('en-IN') || voice.lang.includes('hi-IN')
                );
                utterance.lang = 'en-IN';
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }
    
    stopSpeaking() {
        if (this.speechSynthesis && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.voiceButton.classList.remove('speaking');
            this.updateVoiceButtonState();
        }
    }
    
    scrollToBottom() {
        // Smooth scroll to bottom with better performance
        this.chatHistory.scrollTo({
            top: this.chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    }
    
    adjustInputHeight() {
        // Auto-resize input based on content
        this.userInput.style.height = 'auto';
        const scrollHeight = this.userInput.scrollHeight;
        const maxHeight = 120; // Maximum height in pixels
        
        if (scrollHeight > maxHeight) {
            this.userInput.style.height = maxHeight + 'px';
            this.userInput.style.overflowY = 'auto';
        } else {
            this.userInput.style.height = scrollHeight + 'px';
            this.userInput.style.overflowY = 'hidden';
        }
    }
    
    getErrorMessage(language) {
        const messages = {
            'hindi': 'माफ़ कीजिए, उत्तर प्राप्त नहीं हो सका।',
            'english': 'Sorry, I couldn\'t get a response.',
            'hinglish': 'माफ़ कीजिए, उत्तर प्राप्त नहीं हो सका। Sorry, couldn\'t get a response.'
        };
        return messages[language] || messages['hinglish'];
    }
    
    getConnectionErrorMessage(language) {
        const messages = {
            'hindi': 'माफ़ कीजिए, सर्वर से कनेक्ट नहीं हो सका।',
            'english': 'Sorry, couldn\'t connect to the server.',
            'hinglish': 'माफ़ कीजिए, सर्वर से कनेक्ट नहीं हो सका। Sorry, server connection failed.'
        };
        return messages[language] || messages['hinglish'];
    }
    
    showAlert(message) {
        // Custom alert that matches the app's design
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(239, 68, 68, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
            backdrop-filter: blur(10px);
            z-index: 1000;
            font-size: 14px;
            max-width: 90%;
            text-align: center;
            animation: slideIn 0.3s ease;
        `;
        
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.healthAssistant = new HealthAssistant();
        console.log('🏥 Health Assistant initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Health Assistant:', error);
        
        // Fallback basic functionality
        document.getElementById('chatForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Assistant initialization failed. Please refresh the page.');
        });
    }
});

// Performance optimizations
window.addEventListener('load', () => {
    // Preload voices for better speech synthesis
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
        speechSynthesis.addEventListener('voiceschanged', () => {
            // Voices loaded
        });
    }
});

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);