# import os
# import google.genai as genai 
# from google.genai import types # Required for image processing
# from dotenv import load_dotenv

# # Load variables from .env file
# load_dotenv()

# # CORRECT: Use os.getenv to get the key from your environment
# api_key = os.getenv("GOOGLE_API_KEY")

# # Initialize client
# client = genai.Client(api_key=api_key)

# def verify_liveness(image_bytes, required_object, content_type="image/jpeg"):
#     try:
#         prompt = f"Is the person in this photo holding a {required_object}? Respond ONLY with the word YES or NO."
        
#         response = client.models.generate_content(
#             model="gemini-1.5-flash",
#             contents=[
#                 prompt,
#                 types.Part.from_bytes(
#                     data=image_bytes,
#                     mime_type=content_type # Use the dynamic content type
#                 )
#             ]
#         )
        
#         return "YES" in response.text.upper()
#     except Exception as e:
#         print(f"Gemini Error: {e}")
#         return False