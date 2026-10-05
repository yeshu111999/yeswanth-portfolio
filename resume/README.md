# Resume source

`resume.html` is the source for `public/Yeswanth_Ravipati_Resume.pdf` (Letter, Carlito font, bronze accents).
Fonts are Carlito (SIL Open Font License), metric-compatible with Calibri.

Regenerate the PDF with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --no-pdf-header-footer --print-to-pdf=../public/Yeswanth_Ravipati_Resume.pdf resume.html
```
