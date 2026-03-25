import xml.etree.ElementTree as ET
import sys
import re

def extract_stories(xml_path):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    stories = []
    # Look for US-XYZ-000 pattern
    pattern = re.compile(r'US-[A-Z]{3}-\d{3}')
    
    for p in root.findall('.//w:p', ns):
        texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
        if texts:
            full_text = "".join(texts)
            match = pattern.search(full_text)
            if match:
                stories.append(full_text.strip())
    
    return stories

if __name__ == "__main__":
    path = "f:/Sovereign-Audit-AI/docs/us_extracted/word/document.xml"
    stories = extract_stories(path)
    # Deduplicate while preserving order
    seen = set()
    unique_stories = []
    for s in stories:
        # Extract the ID for deduplication
        match = re.search(r'US-[A-Z]{3}-\d{3}', s)
        if match:
            id = match.group()
            if id not in seen:
                seen.add(id)
                unique_stories.append(s)
    
    for s in unique_stories:
        print(s)
