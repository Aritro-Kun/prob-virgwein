from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description='Process audio file with Gemini AI')
    parser.add_argument('--input', type=str, required=True, help='Path to the input audio file')
    args = parser.parse_args()
    
    load_dotenv()
    api_key = os.getenv("API_KEY")
    
    if not api_key:
        print("Error: API_KEY environment variable not found")
        sys.exit(1)
    
    client = genai.Client(api_key=api_key)

    try:
        audio = client.files.upload(file=args.input)
        
        prompt = ""
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite', 
            config=types.GenerateContentConfig(
                system_instruction="The input prompt contains data where hospitals collect realtine audio or text" \
                "including, but not limited to feedback from discharged patients." \
                "Your job is auto-summarize concerns, and generate a weekly action report for hospital admins with trends." \
                "Figure out who is the doctor and who is the patient from the audio itself. Do not generate any other prompts" \
                "There should be no way that in the output you reference yourself. It will simply be professional. By reading the" \
                "output, one should not be able to differentiate it from just any other report." \
                "If there is no input from the user, just say no input, please try again."),
            contents=[prompt, audio]
        )
        print(response.text)
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()