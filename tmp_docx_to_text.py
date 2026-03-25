import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def docx_to_text(docx_path):
    try:
        if not os.path.exists(docx_path):
            return f"File not found: {docx_path}"
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for paragraph in tree.findall('.//w:p', namespace):
            paragraph_text = "".join(node.text for node in paragraph.findall('.//w:t', namespace) if node.text)
            if paragraph_text:
                text.append(paragraph_text)
        
        return "\n".join(text)
    except Exception as e:
        return f"Error extracting {docx_path}: {str(e)}"

if __name__ == "__main__":
    files = [
        "Sovereign_Audit_AI_UI_Manager_v1.0.docx",
        "Sovereign_Audit_AI_UI_Auditor_v1.0.docx",
        "Sovereign_Audit_AI_UI_Client_v1.0.docx",
        "Sovereign_Audit_AI_Sequence_Diagrams_v1.0.docx",
        "Sovereign_Audit_AI_API_v1.0.docx"
    ]
    
    docs_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    
    for f in files:
        path = os.path.join(docs_dir, f)
        output_f = f.replace(".docx", ".extracted.txt")
        output_path = os.path.join(docs_dir, output_f)
        print(f"Extracting {f} to {output_f}...")
        text = docx_to_text(path)
        with open(output_path, "w", encoding="utf-8") as out:
            out.write(text)
    print("Done.")
