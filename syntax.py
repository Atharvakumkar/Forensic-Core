with open('SIH-GUI/secureerase-sih/src/views/SanitizationView.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'return\s*\(', text)
if m:
    return_idx = m.start()
    return_text = text[return_idx:]
    stack = []
    in_string = False
    string_char = ''
    escape = False
    for i, c in enumerate(return_text):
        if not in_string:
            if c in '\"\'\':
                in_string = True
                string_char = c
                escape = False
            elif c in '{[(':
                stack.append((c, i))
            elif c in '}])':
                if not stack:
                    print(f'Unmatched {c} at {i}')
                    break
                last, li = stack.pop()
                if (last == '{' and c != '}') or (last == '[' and c != ']') or (last == '(' and c != ')'):
                    print(f'Mismatched {last} at {li} with {c} at {i}')
                    print(return_text[max(0, li-50):li+50])
                    break
        else:
            if escape:
                escape = False
            elif c == '\\\\':
                escape = True
            elif c == string_char:
                in_string = False
    print("Done checking return block. Remaining stack:")
    print([c for c, _ in stack])
else:
    print('return not found')
