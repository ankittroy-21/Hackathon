import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Core libraries for health AI processing
import openai
import speech_recognition as sr
import pyttsx3
from gtts import gTTS
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Indian Health Assistant Backend")

# Configuration from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HEALTH_API_KEY = os.getenv("HEALTH_API_KEY")
HEALTH_API_BASE_URL = os.getenv("HEALTH_API_BASE_URL", "https://api.nlm.nih.gov/medlineplus/v2/")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Validate required environment variables
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found. AI responses will use fallback system.")
    
if not HEALTH_API_KEY:
    logger.warning("HEALTH_API_KEY not found. External health APIs will be disabled.")

# Add CORS middleware with environment-based origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# Initialize text-to-speech engine
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 150)
tts_engine.setProperty('volume', 0.9)

class HealthQueryRequest(BaseModel):
    query: str
    language: str = "hindi"
    is_voice_input: bool = False
    country: str = "india"

class HealthQueryResponse(BaseModel):
    response: str
    confidence: float = 0.0
    sources: list = []
    timestamp: str

class HealthProcessor:
    def __init__(self):
        self.speech_recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
    async def process_speech_to_text(self, audio_data: bytes) -> str:
        """Convert speech audio to text using speech recognition"""
        try:
            # Convert audio data to text
            with sr.AudioFile(audio_data) as source:
                audio = self.speech_recognizer.record(source)
                
            # Use Google Speech Recognition for Hindi
            text = self.speech_recognizer.recognize_google(
                audio, 
                language="hi-IN"
            )
            return str(text)  # Ensure string return type
        except sr.UnknownValueError:
            logger.warning("Could not understand audio")
            return ""
        except sr.RequestError as e:
            logger.error(f"Speech recognition error: {e}")
            return ""
    
    def generate_speech(self, text: str, language: str = "hi") -> bytes:
        """Convert text to speech audio"""
        try:
            tts = gTTS(text=text, lang=language, slow=False)
            # In a real implementation, save to a temporary file and return bytes
            # For now, return empty bytes as placeholder
            return b""
        except Exception as e:
            logger.error(f"TTS generation error: {e}")
            return b""
    
    async def query_health_apis(self, query: str) -> Dict[str, Any]:
        """Query external health APIs for medical information"""
        try:
            # MedlinePlus API query
            medline_url = f"{HEALTH_API_BASE_URL}healthTopics"
            params = {
                'query': query,
                'format': 'json',
                'lang': 'en'
            }
            
            response = requests.get(medline_url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"MedlinePlus API error: {response.status_code}")
                
        except requests.RequestException as e:
            logger.error(f"Health API request error: {e}")
        
        return {}
    
    async def generate_ai_response(self, query: str, health_data: Dict[str, Any], language: str = "hindi") -> str:
        """Generate AI response using OpenAI with health context"""
        try:
            if not OPENAI_API_KEY:
                return self.get_fallback_response(query)
            
            # Create system prompt for health assistant
            system_prompt = f"""
            You are an Indian Health Assistant (भारतीय स्वास्थ्य सहायक). You provide health information in {language}.
            
            Guidelines:
            1. Always respond in Hindi (Devanagari script)
            2. Provide accurate, helpful health information
            3. Always recommend consulting a doctor for serious issues
            4. Be culturally sensitive to Indian health practices
            5. Include both modern medicine and traditional Indian health wisdom when appropriate
            6. Keep responses concise but informative
            7. Use simple language that common people can understand
            
            IMPORTANT: Always end serious health advice with "गंभीर समस्याओं के लिए डॉक्टर से सलाह लें।"
            """
            
            user_message = f"स्वास्थ्य प्रश्न: {query}"
            
            # Add health data context if available
            if health_data:
                user_message += f"\n\nसंदर्भ जानकारी: {json.dumps(health_data, ensure_ascii=False)}"
            
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return content.strip() if content else self.get_fallback_response(query)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self.get_fallback_response(query)
    
    def get_fallback_response(self, query: str) -> str:
        """Generate fallback response when AI is unavailable"""
        query_lower = query.lower()
        
        # Common health conditions and responses in Hindi
        health_responses = {
            'diabetes': 'मधुमेह एक गंभीर बीमारी है जिसमें रक्त में शुगर का स्तर बढ़ जाता है। नियमित व्यायाम, संतुलित आहार, और डॉक्टर की दवाइयों का सेवन करें। मिठाई और चीनी से बचें।',
            'fever': 'बुखार आने पर पर्याप्त आराम करें, तरल पदार्थ पिएं। पैरासिटामोल ले सकते हैं। यदि 3 दिन से अधिक बुखार रहे तो तुरंत डॉक्टर से मिलें।',
            'headache': 'सिरदर्द के लिए पर्याप्त नींद लें, तनाव कम करें, पानी पिएं। सिर पर ठंडी पट्टी रख सकते हैं। बार-बार होने पर डॉक्टर से जांच कराएं।',
            'cold': 'सर्दी-जुकाम में गर्म पानी पिएं, भाप लें, अदरक-शहद का सेवन करें। पर्याप्त आराम करें और ठंडी चीजों से बचें।',
            'pressure': 'उच्च रक्तचाप को नियंत्रित करने के लिए नमक कम खाएं, व्यायाम करें, तनाव कम करें। नियमित दवा लें और डॉक्टर की सलाह मानें।',
            'heart': 'हृदय की समस्याओं के लिए धूम्रपान बंद करें, संतुलित आहार लें, नियमित व्यायाम करें। छाती में दर्द हो तो तुरंत डॉक्टर के पास जाएं।'
        }
        
        for condition, response in health_responses.items():
            if condition in query_lower or any(hindi_term in query for hindi_term in self.get_hindi_terms(condition)):
                return f"{response} गंभीर समस्याओं के लिए डॉक्टर से सलाह लें।"
        
        return "मैं एक भारतीय स्वास्थ्य सहायक हूँ। कृपया अपनी स्वास्थ्य समस्या के बारे में विस्तार से बताएं। मैं आपको सामान्य सलाह दे सकता हूँ। गंभीर समस्याओं के लिए डॉक्टर से सलाह लें।"
    
    def get_hindi_terms(self, condition: str) -> list:
        """Get Hindi terms for health conditions"""
        hindi_terms = {
            'diabetes': ['मधुमेह', 'डायबिटीज', 'शुगर'],
            'fever': ['बुखार', 'ज्वर', 'तापमान'],
            'headache': ['सिरदर्द', 'सिर दर्द', 'माइग्रेन'],
            'cold': ['सर्दी', 'जुकाम', 'नजला'],
            'pressure': ['रक्तचाप', 'ब्लड प्रेशर', 'उच्च रक्तचाप'],
            'heart': ['हृदय', 'दिल', 'हार्ट']
        }
        return hindi_terms.get(condition, [])

# Initialize health processor
health_processor = HealthProcessor()

@app.post("/process-health-query", response_model=HealthQueryResponse)
async def process_health_query(request: HealthQueryRequest):
    """Main endpoint to process health queries"""
    try:
        query = request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        logger.info(f"Processing health query: {query}")
        
        # Step 1: Query external health APIs for context
        health_data = await health_processor.query_health_apis(query)
        
        # Step 2: Generate AI response with health context
        response_text = await health_processor.generate_ai_response(
            query, 
            health_data, 
            request.language
        )
        
        # Step 3: Prepare response
        response = HealthQueryResponse(
            response=response_text,
            confidence=0.85 if health_data else 0.60,
            sources=["MedlinePlus", "OpenAI GPT"] if health_data else ["Fallback System"],
            timestamp=datetime.now().isoformat()
        )
        
        logger.info(f"Generated response for query: {query[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error processing health query: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Internal server error while processing health query"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Indian Health Assistant Backend",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "भारतीय स्वास्थ्य सहायक बैकएंड सेवा",
        "version": "1.0.0",
        "endpoints": {
            "/process-health-query": "POST - Process health queries",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "health_assistant:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )