import os
import re

ui_dir = r"c:\Users\hp\OneDrive\c++\Project\BizChat\zip\src\app\components\ui"

def capitalize(s):
    return "".join(part.capitalize() for part in s.split("-"))

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 2. Fix broken function signatures
    # Matches patterns like "} MenubarPrimitive.Item> & { ... }) {" 
    # Or "} props) {"
    # Using a DOTALL-like match with broad characters to catch the whole mess between } and {
    content = re.sub(r'\}\s*[^{}]+\s*(\)\s*\{|\=\>)', r'} ) \1', content)
    
    # Cleanup: "} ) ) {" -> "} ) {"
    content = re.sub(r'\}\s*\)\s*\)\s*\{', r'} ) {', content)
    # Cleanup: "} ) {" -> "} props) {" (standardize)
    content = re.sub(r'\)\s*\}\s*\)\s*\{', r'} props) {', content)
    
    # Actually, let's just target the specific "props" or "children" to opening brace
    content = re.sub(r'(\.\.\.props|children)\s*\}\s*[^{}]+\{', r'\1 }) {', content)

    # 3. Attributes fix
    content = re.sub(r'data-\[state=open\]-in', r'data-[state=open]:animate-in', content)
    content = re.sub(r'data-\[state=closed\]-out', r'data-[state=closed]:animate-out', content)
    content = re.sub(r'data-\[state=closed\]-out-(\d+)', r'data-[state=closed]:fade-out-\1', content)
    # If it was zoom-out-95
    content = re.sub(r'data-\[state=closed\]-out-95', r'data-[state=closed]:zoom-out-95', content)
    content = re.sub(r'data-\[state=open\]-in-95', r'data-[state=open]:zoom-in-95', content)
    
    content = re.sub(r'dark-', r'dark:', content)
    content = re.sub(r'sm-', r'sm:', content)
    content = re.sub(r'md-', r'md:', content)
    content = re.sub(r'lg-', r'lg:', content)
    content = re.sub(r'xl-', r'xl:', content)
    
    # Prefix fixes
    content = re.sub(r'\[&_svg\]-', r'[&_svg]:', content)
    content = re.sub(r'\[&_svg\((.*?)\)\]-', r'[&_svg(\1)]:', content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

for filename in os.listdir(ui_dir):
    if filename.endswith(".jsx"):
        fix_file(os.path.join(ui_dir, filename))
