from safecircle_sdk import SafeCircleClient

client = SafeCircleClient()

text = "meet me after school and dont tell your parents"

analysis = client.analyze_text(text)
print("Analysis:", analysis)

signal = client.create_privacy_signal(analysis)
print("Privacy Signal:", signal)

summary = client.guardian_view([signal])
print("Guardian Summary:", summary)

report = client.anonymous_report(signal)
print("Anonymous Report:", report)