import xml.etree.ElementTree as ET
import sys
import re

def extract_stories(xml_path):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Get all text in order
    all_text = []
    for t in root.findall('.//w:t', ns):
        if t.text:
            all_text.append(t.text)
    
    full_content = "".join(all_text)
    
    # Look for US- patterns followed by titles
    # Usually it's US-ABC-123 Title
    # Let's try to find the IDs first
    ids = re.findall(r'US-[A-Z]{3}-\d{3}', full_content)
    
    # Deduplicate
    unique_ids = []
    seen = set()
    for id in ids:
        if id not in seen:
            seen.add(id)
            unique_ids.append(id)
            
    return unique_ids

if __name__ == "__main__":
    path = "f:/Sovereign-Audit-AI/docs/us_extracted/word/document.xml"
    ids = extract_stories(path)
    print(f"Total Unique Story IDs found: {len(ids)}")
    for id in ids:
        print(id)
