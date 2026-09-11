import re

def analyze_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract headers
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', content, re.IGNORECASE | re.DOTALL)
    
    # Extract inputs and their names/placeholders
    inputs = re.findall(r'<input[^>]+>', content, re.IGNORECASE)
    parsed_inputs = []
    for inp in inputs:
        name = re.search(r'name=["\'](.*?)["\']', inp, re.IGNORECASE)
        placeholder = re.search(r'placeholder=["\'](.*?)["\']', inp, re.IGNORECASE)
        type_ = re.search(r'type=["\'](.*?)["\']', inp, re.IGNORECASE)
        
        parsed_inputs.append({
            'name': name.group(1) if name else None,
            'placeholder': placeholder.group(1) if placeholder else None,
            'type': type_.group(1) if type_ else None
        })
        
    return {
        'h1': [re.sub(r'<[^>]+>', '', h).strip() for h in h1s],
        'h2': [re.sub(r'<[^>]+>', '', h).strip() for h in h2s],
        'inputs': parsed_inputs
    }

print("=== APPLY PAGE ===")
print(analyze_html('apply.html'))
print("\n=== SIGNUP PAGE ===")
print(analyze_html('signup.html'))
