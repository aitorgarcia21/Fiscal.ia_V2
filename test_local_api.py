import requests
import json

def test_api():
    url = "http://127.0.0.1:8000/api/ai/analyze-profile-text"
    headers = {"Content-Type": "application/json"}
    data = {"text": "Bonjour, je m'appelle Jean Dupont et je gagne 60000 euros par an."}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=20)
        
        print(f"Status Code: {response.status_code}")
        print("--- Response JSON ---")
        try:
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            print("--- Response Text ---")
            print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_api() 