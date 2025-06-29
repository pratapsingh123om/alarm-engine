import requests

print("🔔 Hello from Python!")
response = requests.get("https://httpbin.org/get")
print("✅ Response status code:", response.status_code)
