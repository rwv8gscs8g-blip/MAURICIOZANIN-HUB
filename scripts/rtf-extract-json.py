import sys, re, json, pathlib

if len(sys.argv) < 3:
    print("Uso: python3 scripts/rtf-extract-json.py <entrada.rtf> <saida.json>")
    sys.exit(1)

inp = pathlib.Path(sys.argv[1])
outp = pathlib.Path(sys.argv[2])
text = inp.read_text(errors='ignore')

# decode hex escapes
text = re.sub(r"\\'([0-9a-fA-F]{2})", lambda m: chr(int(m.group(1),16)), text)
# remove RTF control words
text = re.sub(r"\\par[d]?", "\n", text)
text = re.sub(r"\\tab", "\t", text)
text = re.sub(r"\\[a-zA-Z]+-?\d* ?", "", text)
# remove braces
text = text.replace('{','').replace('}','')
# convert unicode escapes
text = re.sub(r"\\u(-?\d+)\?", lambda m: chr(int(m.group(1))), text)
# normalize backslashes and quotes
text = text.replace('\\\\', '\\')
text = text.replace('\\"', '"')

# try to find JSON object
start = text.find('{')
end = -1
if start == -1:
    # sometimes starts with "meta": ... try to wrap
    if '"meta"' in text:
        text = '{' + text[text.find('"meta"'):] 
        start = 0
    else:
        print("Nenhum JSON detectado")
        sys.exit(1)

# naive balance
depth = 0
for i in range(start, len(text)):
    ch = text[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            end = i
            break

if end == -1:
    print("Bloco JSON incompleto")
    sys.exit(1)

json_text = text[start:end+1]

# fix trailing commas
json_text = re.sub(r",\s*([}\]])", r"\1", json_text)

try:
    obj = json.loads(json_text)
except Exception as e:
    print("Falha ao parsear JSON:", e)
    outp.write_text(json_text)
    sys.exit(1)

outp.write_text(json.dumps(obj, indent=2, ensure_ascii=False))
print(f"JSON extraído para {outp}")
