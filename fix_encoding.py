# -*- coding: utf-8 -*-
"""
修正 index.html 中多種中文編碼造成的亂碼（UTF-8 被誤解為 Latin-1/Windows-1252 等）。
使用 ftfy 處理混合編碼，再以自訂邏輯還原純 Latin-1 區段。
"""
import sys

def fix_mojibake_run(s):
    """將連續的 Latin-1 誤解區段還原為 UTF-8 中文。"""
    result = []
    i = 0
    while i < len(s):
        if 0x80 <= ord(s[i]) <= 0xFF:
            run = []
            j = i
            while j < len(s) and 0x80 <= ord(s[j]) <= 0xFF:
                run.append(s[j])
                j += 1
            run_str = ''.join(run)
            decoded = None
            for end in range(len(run_str), 0, -1):
                try:
                    decoded = run_str[:end].encode('latin-1').decode('utf-8')
                    break
                except (UnicodeDecodeError, UnicodeEncodeError):
                    continue
            if decoded:
                result.append(decoded)
                i += end
                continue
        result.append(s[i])
        i += 1
    return ''.join(result)


def main():
    path = 'index.html'
    if len(sys.argv) > 1:
        path = sys.argv[1]
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    try:
        import ftfy
        content = ftfy.fix_text(content)
    except ImportError:
        pass
    fixed = fix_mojibake_run(content)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(fixed)
    print('Done:', path)


if __name__ == '__main__':
    main()
