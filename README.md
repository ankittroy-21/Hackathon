# 🏥 Indian Health Assistant for Rural Areas

> AI-powered health assistant designed specifically for rural Indian communities with voice support, multi-language capabilities, and modern UI design.

![Health Assistant](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-blue)
![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20English%20%7C%20Hinglish-orange)
![Voice](https://img.shields.io/badge/Voice-Enabled-purple)

## 🌟 Project Overview

This project provides **accessible healthcare information** to rural areas of India where internet connectivity and medical facilities are limited. The assistant focuses strictly on **health and education topics** with advanced voice features and intelligent language detection.

### 🎯 Target Audience
- **Rural communities** in India
- **Low-literate populations** (voice input support)
- **Multi-language users** (Hindi/English/Hinglish)
- **Areas with limited medical access**

## ✨ Enhanced Features

### 🎤 **Advanced Voice Interface**
- **Professional Hugeicons** - SVG icons (Mic01Icon/MicOff01Icon)
- **Gemini-Style Animation** - Blue pulsating circles during recording
- **Speech Recognition** - Supports Hindi and English voice input
- **Text-to-Speech** - Responds in user's preferred language

### 🌍 **Intelligent Language Detection**
- **Auto-detects** Hindi, English, and Hinglish input
- **Responds in same language** as user's question
- **Cultural Context** - Appropriate responses for Indian users
- **Voice Synthesis** - Native language audio responses

### 📱 **Ultra-Responsive Design**
- **Mobile-First** - Optimized for all smartphone sizes
- **Tablet Support** - Perfect on all orientations
- **Desktop Ready** - Scales beautifully to large screens
- **Accessibility** - Screen reader and keyboard navigation support

### 🏥 **Health-Focused AI**
- **Medical Expertise** - Trained for Indian health scenarios
- **Rural Specific** - Advice tailored for limited resource areas
- **Emergency Guidance** - Clear instructions for serious conditions
- **Privacy Protected** - Anonymous, secure health conversations

### 🔒 **Enterprise-Grade Security**
- **Zero Credential Exposure** - All secrets in environment variables
- **Privacy Compliant** - Minimal data collection, maximum protection
- **Encrypted Storage** - Secure database with automatic encryption
- **Production Ready** - Comprehensive security audit passed

## ⚡ One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fankittroy-21%2FHackathon&env=GEMINI_API_KEY,HUGGINGFACE_API_KEY,SUPABASE_URL,SUPABASE_ANON_KEY&envDescription=AI%20API%20keys%20and%20database%20credentials%20needed%20for%20health%20assistant&envLink=https%3A%2F%2Fgithub.com%2Fankittroy-21%2FHackathon%23-complete-vercel-deployment-guide&project-name=health-assistant-ai&repository-name=health-assistant-ai)

**🔗 Quick Links:**
- 🔑 [Get Gemini API Key (Free)](https://makersuite.google.com/app/apikey) 
- 🤗 [Get Hugging Face Token (Free)](https://huggingface.co/settings/tokens)
- 🗃️ [Create Supabase Database (Free)](https://supabase.com/dashboard/projects)
- 📖 [Complete Setup Guide](#-complete-vercel-deployment-guide)

**🎯 This button will:**
- ✅ **Clone** your repository automatically
- ✅ **Pre-configure** environment variables
- ✅ **Deploy** to Vercel instantly
- ✅ **Open** environment setup page

**📋 Have these ready before clicking:**
- Gemini API Key (free) or Hugging Face Token (free)
- Supabase URL and Anonymous Key (free)

### 🎬 Deployment Flow
```
1. Click "Deploy with Vercel" button above
   ↓
2. Vercel opens with your repo pre-selected
   ↓
3. Add environment variables (pre-configured form)
   ↓
4. Click "Deploy" 
   ↓
5. Wait 2-3 minutes
   ↓
6. Your app is live! 🎉
```

**🔄 Alternative Deploy Options:**
- [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/ankittroy-21/Hackathon)
- [Fork on GitHub](https://github.com/ankittroy-21/Hackathon/fork) → Manual Setup

---

## 🚀 Quick Start (Beginner-Friendly)

### Step 1: Get Your API Credentials

#### 1.1 OpenAI API Key (Required)
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create account or sign in
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. **Important**: Add billing information (minimum $5 for usage)

#### 1.2 Supabase Database (Required)
1. Go to [Supabase](https://supabase.com)
2. Create account and new project
3. Wait 2-3 minutes for project setup
4. Navigate to Settings → API
5. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon public key**: starts with `eyJ`

#### 1.3 Health API Key (Optional)
1. Visit [RapidAPI Health](https://rapidapi.com/category/health)
2. Choose a health information API
3. Subscribe (many have free tiers)
4. Copy your API key for enhanced health data

#### 1.4 Hugging Face API Key (Free AI Alternative)
1. Visit [Hugging Face](https://huggingface.co/)
2. **Sign up/Login** to your account
3. **Go to Settings** → Click your profile picture → Settings
4. **Navigate to Access Tokens** → Left sidebar → "Access Tokens"
5. **Create New Token**:
   - Name: `Health Assistant API`
   - Role: `Read` (sufficient for API access)
   - Click **"Create token"**
6. **Copy your token** - starts with `hf_...`
7. **Keep it secure** - treat like a password

**Why Hugging Face?**
- ✅ **Completely FREE** - No billing required
- ✅ **High-quality AI** - Good for health responses  
- ✅ **Backup option** - Works when other APIs fail
- ✅ **Easy setup** - Just need an account

**Usage Limits (Free Tier):**
- 1,000 requests per hour
- Perfect for testing and small deployments

### Step 2: Fork and Setup Repository

```bash
# Fork this repository on GitHub, then clone:
git clone https://github.com/YOUR_USERNAME/indian-health-assistant.git
cd indian-health-assistant

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit the `.env` file with your actual credentials:

```bash
# AI Provider Configuration (Priority Order)
# 1. GEMINI API (FREE TIER - RECOMMENDED)
GEMINI_API_KEY=your_gemini_api_key_here

# 2. HUGGING FACE API (FREE BACKUP)
HUGGINGFACE_API_KEY=hf_your_actual_huggingface_token_here

# 3. OPENAI API (OPTIONAL - REQUIRES BILLING)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Database Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-actual-supabase-key

# Optional Enhancement
HEALTH_API_KEY=your-health-api-key-here

# Auto-configured (will be your Vercel URL after deployment)
PYTHON_BACKEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy to Vercel (One-Click Deployment)

#### 4.1 Connect to Vercel
1. Visit [Vercel.com](https://vercel.com)
2. Sign up/in with your GitHub account
3. Click "New Project"
4. Import your forked repository
5. **Wait** - Don't deploy yet, add environment variables first

#### 4.2 Add Environment Variables
In Vercel dashboard:
1. Go to Project → Settings → Environment Variables
2. Add each variable from your `.env` file:

| Variable Name | Example Value | Environment | Required |
|---------------|---------------|-------------|----------|
| `GEMINI_API_KEY` | `AIza...` | Production, Preview, Development | ✅ Recommended |
| `HUGGINGFACE_API_KEY` | `hf_abc123...` | Production, Preview, Development | ✅ Backup |
| `OPENAI_API_KEY` | `sk-proj-abc123...` | Production, Preview, Development | ⚠️ Optional |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Production, Preview, Development | ✅ Required |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development | ✅ Required |
| `HEALTH_API_KEY` | `your-health-key` | Production, Preview, Development | ⭕ Optional |

**💡 Pro Tip:** You only need **ONE** AI provider key. The app will work with:
- **Gemini only** (recommended for free usage)
- **Hugging Face only** (free backup option)  
- **OpenAI only** (if you have billing setup)
- **No API keys** (enhanced fallback responses)

#### 4.3 Deploy and Test
1. Click "Deploy" in Vercel dashboard
2. Wait for deployment (2-3 minutes)
3. **Database auto-creates** on first visit
4. Test your live app at the provided Vercel URL

## 🚀 Complete Vercel Deployment Guide

### 🎯 Method 1: One-Click Deploy (Recommended)

**Use the button above** ⬆️ for instant deployment, or follow manual steps below.

### 🛠️ Method 2: Manual Deployment

#### Step 1: Import Repository to Vercel
1. **Visit** [vercel.com](https://vercel.com) and sign in with GitHub
2. **Click "New Project"**
3. **Search** for your `Hackathon` repository
4. **Click "Import"** next to your repository
5. **Configure Project:**
   - Project Name: `health-assistant-ai` (or keep `Hackathon`)
   - Framework Preset: **"Other"**
   - Root Directory: `./` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty

### Step 2: Add Environment Variables (Before Deployment)
**⚠️ Important:** Add these BEFORE clicking deploy!

1. **Scroll down** to "Environment Variables" section
2. **Add variables one by one:**

```bash
# Minimum Required (Choose ONE AI provider)
GEMINI_API_KEY = your_actual_gemini_key
# OR
HUGGINGFACE_API_KEY = hf_your_actual_token

# Database (Required)
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...your_key

# Optional
HEALTH_API_KEY = your_health_key
```

**Environment Setting:** Select **"Production, Preview, and Development"** for each variable.

### Step 3: Deploy
1. **Click "Deploy"** button
2. **Wait 2-3 minutes** for build completion
3. **Success!** Your app is now live

### Step 4: Test Your Deployment
**Your app will be available at:** `https://your-project-name.vercel.app`

**Test these features:**
- ✅ Homepage loads
- ✅ Voice input works (microphone button)
- ✅ Text input responds
- ✅ Multi-language support
- ✅ Mobile responsiveness

### Step 5: Custom Domain (Optional)
1. **Go to** Project → Settings → Domains
2. **Add your domain** (if you have one)
3. **Configure DNS** as instructed by Vercel

### 🛠️ Troubleshooting Deployment

**Build Fails?**
- Check all environment variables are set correctly
- Ensure GitHub repository is public or Vercel has access

**API Not Working?**
- Verify environment variables are not empty
- Check API keys are valid and have correct format

**Database Errors?**
- Ensure Supabase URL and key are correct
- Database tables auto-create on first API call

**Voice Not Working?**
- Voice requires HTTPS (works on Vercel automatically)
- Test on different browsers (Chrome recommended)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with pip
- Git for version control

### Development Setup
```bash
# Install all dependencies
npm install
pip install -r requirements.txt

# Start development environment
npm run dev              # Frontend at http://localhost:3000
python health_assistant.py  # Backend at http://localhost:8000
```

### Testing the Application
```bash
# Test Python backend API
curl -X POST http://localhost:8000/process-health-query \
  -H "Content-Type: application/json" \
  -d '{"query": "बुखार का इलाज", "detected_language": "hindi"}'

# Test frontend at http://localhost:3000
# Try voice input, text input, and language switching
```

## 🏗️ Project Architecture

### File Structure
```
📁 indian-health-assistant/
├── 🌐 index.html          # Clean, accessible main interface
├── 🎨 styles.css          # Responsive design with animations
├── ⚡ script.js           # Advanced voice and language features
├── 📁 api/
│   └── chat.js            # Vercel serverless API endpoint
├── 📁 utils/
│   ├── supabase.js        # Database auto-setup and management
│   └── health-processor.js # Language-aware health processing
├── 🐍 health_assistant.py # Python FastAPI backend
├── ⚙️ vercel.json         # Deployment configuration
├── 📦 package.json        # Dependencies and scripts
├── 🔒 .env.example        # Environment template
└── 📚 README.md           # This comprehensive guide
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Voice**: Web Speech API (Recognition & Synthesis)
- **Backend**: Node.js (Vercel) + Python (FastAPI)
- **Database**: Supabase PostgreSQL with auto-setup
- **AI**: OpenAI GPT-3.5-turbo with health specialization
- **Deployment**: Vercel serverless platform
- **Security**: Environment variables, encrypted storage

## 🎯 Automated Features

### 🗄️ Database Auto-Configuration
- **Automatic table creation** on first deployment
- **Schema management** - no manual SQL required
- **Error resilience** - graceful fallbacks if features fail
- **Chat history storage** with session management

### 🛡️ Security & Privacy Protection
- **Environment isolation** - credentials never in code
- **Automatic validation** - runtime security checks
- **Privacy compliance** - minimal data collection
- **Anonymous usage** - no personal information stored

### 🎤 Advanced Voice Features
- **Language detection** - auto-identifies Hindi/English/Hinglish
- **Visual feedback** - Gemini-style pulsating animations
- **Error handling** - graceful fallbacks for unsupported browsers
- **Accessibility** - keyboard navigation and screen reader support

### 🌍 Language Intelligence
- **Input analysis** - detects user's preferred language
- **Response matching** - replies in same language as query
- **Cultural context** - appropriate medical advice for India
- **Fallback system** - works even without AI connectivity

## 🏥 Health & Rural Focus

### 📍 Rural-Specific Optimizations
- **Low bandwidth design** - optimized for 2G/3G networks
- **Offline capabilities** - cached responses and fallback advice
- **Simple terminology** - avoids complex medical jargon
- **Local context** - Indian health practices and remedies

### 🩺 Health Coverage Areas
- **Common conditions**: Fever, cough, diarrhea, headaches
- **Maternal health**: Pregnancy care, nutrition guidance
- **Child health**: Vaccination schedules, growth monitoring
- **Chronic diseases**: Diabetes, hypertension management
- **Emergency guidance**: When to seek immediate medical help

### 📞 Emergency Integration
- **Emergency number**: Automatic 108 (Indian emergency) references
- **Local resources**: ANM and health center guidance
- **Severity assessment**: Clear indicators for urgent care
- **Professional disclaimer**: Emphasizes doctor consultation

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 🔑 API Key Problems
```bash
# Issue: OpenAI API errors
# Solution: 
1. Verify API key format (starts with sk-)
2. Check billing account has sufficient funds
3. Ensure rate limits are not exceeded
4. Test API key with curl command
```

#### 🗄️ Database Connection Issues
```bash
# Issue: Supabase connection fails
# Solution:
1. Verify URL format: https://xyz.supabase.co
2. Check anon key starts with eyJ
3. Ensure project is not paused
4. Wait for auto-creation on first visit
```

#### 🎤 Voice Feature Problems
```bash
# Issue: Voice input not working
# Solution:
1. Use HTTPS (required for microphone access)
2. Grant browser microphone permissions
3. Test on Chrome/Edge (best compatibility)
4. Check for CORS issues in console
```

#### 🚀 Vercel Deployment Errors
```bash
# Issue: Build or runtime failures
# Solution:
1. Verify all environment variables are set correctly
2. Check Vercel function logs for specific errors
3. Ensure GitHub repository is accessible
4. Review vercel.json configuration
```

### Performance Optimization
- **CDN caching** - Static assets cached globally
- **Code splitting** - Separate CSS/JS files for faster loading
- **Image optimization** - SVG icons for crisp display
- **Lazy loading** - Features load as needed

## 📊 Usage Examples

### 🎤 Voice Interaction (Hindi)
```
👤 User (voice): "मुझे बुखार है, क्या करूं?"
🤖 Assistant (voice): "बुखार में पर्याप्त आराम करें, तरल पदार्थ पिएं जैसे पानी और दाल का पानी..."
```

### 💬 Text Interaction (English)
```
👤 User (text): "What should I do for child fever?"
🤖 Assistant (text): "बच्चे में बुखार के लिए: Give adequate rest, increase fluid intake..."
```

### 🔄 Mixed Language (Hinglish)
```
👤 User: "Mere baby ko cough hai, kya treatment dun?"
🤖 Assistant: "बच्चे की खांसी के लिए: honey और ginger का mixture दें, warm water से gargle करवाएं..."
```

### 🚫 Non-Health Query Redirect
```
👤 User: "Tell me about movies"
🤖 Assistant: "माफ़ कीजिए, मैं एक स्वास्थ्य सहायक हूं। Please ask about health problems या medical conditions के बारे में।"
```

## 🎨 UI/UX Features

### Modern Design Elements
- **Glassmorphic effects** - Translucent, modern appearance
- **Smooth animations** - Professional transitions and feedback
- **Gradient backgrounds** - Attractive, calming color schemes
- **Responsive typography** - Scales perfectly on all devices

### Accessibility Features
- **Screen reader support** - Proper ARIA labels and roles
- **Keyboard navigation** - Full functionality without mouse
- **High contrast mode** - Support for visual accessibility
- **Reduced motion** - Respects user motion preferences

### Voice User Interface
- **Visual feedback** - Animated microphone states
- **Audio confirmation** - Clear start/stop voice cues
- **Error recovery** - Helpful guidance for voice issues
- **Multi-language** - Supports Hindi and English speech

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Development Process
1. **Fork** the repository on GitHub
2. **Create** a feature branch: `git checkout -b feature/rural-health-improvement`
3. **Develop** your feature with proper testing
4. **Commit** changes: `git commit -am 'Add rural health improvement'`
5. **Push** to branch: `git push origin feature/rural-health-improvement`
6. **Create** a Pull Request with detailed description

### Contribution Guidelines
- **Focus on rural health** - Keep the target audience in mind
- **Test thoroughly** - Ensure features work on low-end devices
- **Document changes** - Update README and inline comments
- **Security first** - Never commit credentials or personal data

### Areas for Contribution
- **Local language support** - Add regional Indian languages
- **Health content** - Expand medical knowledge base
- **Performance** - Optimize for slower networks
- **Accessibility** - Improve usability for disabled users

## 📄 License & Legal

### Open Source License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Medical Disclaimer
⚠️ **Important**: This application provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with questions about medical conditions.

### Privacy Policy
- **Data minimization** - We collect only essential health queries
- **Anonymous usage** - No personal identification required
- **Secure storage** - Encrypted database with industry standards
- **No tracking** - No analytics or user behavior monitoring

## 🆘 Support & Community

### Getting Help
- 📧 **Email Support**: [your-email@domain.com]
- 💬 **GitHub Issues**: [Report bugs or request features](https://github.com/YOUR_USERNAME/indian-health-assistant/issues)
- 📖 **Documentation**: [Comprehensive Wiki](https://github.com/YOUR_USERNAME/indian-health-assistant/wiki)
- 💭 **Discussions**: [Community Forum](https://github.com/YOUR_USERNAME/indian-health-assistant/discussions)

### Community Resources
- **User Guide** - Step-by-step usage instructions
- **Developer Docs** - Technical implementation details
- **API Reference** - Complete endpoint documentation
- **Best Practices** - Security and deployment guidelines

## 🎉 Acknowledgments

### Special Thanks
- **Rural communities** across India for inspiration and feedback
- **Healthcare workers** providing ground-truth medical guidance
- **Open source community** for tools and libraries
- **Beta testers** who helped refine the user experience

### Technology Partners
- **OpenAI** - AI capabilities and language processing
- **Supabase** - Database infrastructure and real-time features
- **Vercel** - Hosting platform and serverless functions
- **Hugeicons** - Professional icon library
- **Google Fonts** - Devanagari and Latin typography

### Research & Inspiration
- Indian health ministry guidelines and protocols
- Rural healthcare accessibility research
- Voice interface best practices for low-literacy users
- Cultural sensitivity in health communication

---

## 🚀 Ready to Deploy?

Your **Indian Health Assistant** is production-ready with:

✅ **Professional UI** with modern animations  
✅ **Advanced voice features** with visual feedback  
✅ **Multi-language intelligence** for rural communities  
✅ **Enterprise-grade security** for public deployment  
✅ **Comprehensive documentation** for easy setup  
✅ **Automated deployment** with one-click Vercel integration  

**Made with ❤️ for Rural India** 🇮🇳

*Bringing AI-powered healthcare to every village, one conversation at a time.*