import sys
from flask import Flask, request, send_file, jsonify
from PIL import Image
import numpy as np
from io import BytesIO
from HairDye import HairDye
import os
import requests
import time
from flask_cors import CORS
import json
import datetime
import atexit

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://*.vercel.app",
            "https://brunettehq.com"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# API Configuration
NEYNAR_API_KEY = os.getenv('NEYNAR_API_KEY')
NEYNAR_API_URL = "https://api.neynar.com/v2"

# Debug mode
app.debug = True

def cleanup():
    # Add any cleanup code here
    print("Cleaning up resources...")

atexit.register(cleanup)

@app.route('/test-env', methods=['GET'])
def test_env():
    return jsonify({
        'api_key_exists': bool(NEYNAR_API_KEY),
        'api_key_preview': NEYNAR_API_KEY[:4] + '...' if NEYNAR_API_KEY else None
    })

@app.route('/dye', methods=['POST'])
def dye_hair():
    try:
        color = request.form.get('color')
        image = request.files['image']

        # Convert image to numpy array
        pil_image = Image.open(image)
        if pil_image.format=="PNG":
           pil_image = pil_image.convert("RGB")
        numpy_image = np.array(pil_image)

        # Pass the color and image to the HairDye model
        hair_dye = HairDye()
        result_image = hair_dye.predict(numpy_image, color)

        # Convert the result image back to PIL Image
        result_pil_image = Image.fromarray(result_image)

        # Create a BytesIO object to temporarily store the result image
        result_image_stream = BytesIO()
        result_pil_image.save(result_image_stream, format='JPEG')
        result_image_stream.seek(0)

        return send_file(result_image_stream, mimetype='image/jpeg')
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred. Please try again.'}), 500

@app.route('/api/farcaster/publish', methods=['POST'])
def publish_cast():
    try:
        data = request.json
        token = data.get('token')
        text = data.get('text')
        image_url = data.get('image_url')
        
        # Get signer status
        status_response = requests.get(
            f"{NEYNAR_API_URL}/signed-key-request",
            headers={"api_key": NEYNAR_API_KEY},
            params={"token": token}
        )
        status_data = status_response.json()
        
        if status_data.get('state') != 'completed':
            return jsonify({'error': 'Signer not approved'}), 400
            
        # Publish cast
        cast_response = requests.post(
            f"{NEYNAR_API_URL}/farcaster/cast",
            headers={
                "api_key": NEYNAR_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "signer_uuid": status_data.get('signer_uuid'),
                "text": text,
                "embeds": [{"url": image_url}],
                "channel_id": "brunette-brigade"
            }
        )
        
        return jsonify(cast_response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cast', methods=['POST'])
def create_cast():
    try:
        data = request.json
        signer_uuid = data.get('signer_uuid')
        text = data.get('text')
        image_url = data.get('image_url')

        if not signer_uuid:
            return jsonify({'error': 'signer_uuid is required'}), 400

        # Call Neynar API to create the cast
        response = requests.post(
            f"{NEYNAR_API_URL}/farcaster/cast",
            headers={
                "api_key": NEYNAR_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "signer_uuid": signer_uuid,
                "text": text,
                "embeds": [{"url": image_url}] if image_url else None,
                "channel_id": "brunette-brigade"
            }
        )

        if response.status_code != 200:
            print(f"Neynar API error: {response.text}")
            return jsonify({"error": "Failed to create cast"}), response.status_code

        return jsonify(response.json())

    except Exception as e:
        print(f"Error creating cast: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/farcaster/status/<token>', methods=['GET'])
def check_status(token):
    try:
        response = requests.get(
            f"{NEYNAR_API_URL}/signed-key-request",
            headers={"api_key": NEYNAR_API_KEY},
            params={"token": token}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/farcaster/status/<signer_uuid>', methods=['GET'])
def check_signer_status(signer_uuid):
    try:
        response = requests.get(
            f"{NEYNAR_API_URL}/farcaster/signer",
            headers={
                "accept": "application/json",
                "api_key": NEYNAR_API_KEY
            },
            params={'signer_uuid': signer_uuid}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.datetime.now().isoformat(),
        'environment': os.getenv('FLASK_ENV', 'production')
    }), 200

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)