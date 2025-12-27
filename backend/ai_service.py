import google.generativeai as genai
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

# Get the key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

def verify_liveness(image_bytes, required_object):
    """
    Asks Gemini to verify if the specific object is in the user's hand.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        img = Image.open(io.BytesIO(image_bytes))
        
        prompt = (
            f"Is the person in this photo holding a {required_object}? "
            "Respond with only the word 'YES' or 'NO'."
        )
        
        response = model.generate_content([prompt, img])
        return "YES" in response.text.upper()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return False