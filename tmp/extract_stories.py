import xml.etree.ElementTree as ET
import sys

def extract_stories(xml_path):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    stories = []
    for p in root.findall('.//w:p', ns):
        texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
        if texts:
            full_text = "".join(texts)
            if "US-" in full_text:
                stories.append(full_text.strip())
    
    return stories

if __name__ == "__main__":
    path = "f:/Sovereign-Audit-AI/docs/us_extracted/word/document.xml"
    stories = extract_stories(path)
    for s in stories:
        print(s)
