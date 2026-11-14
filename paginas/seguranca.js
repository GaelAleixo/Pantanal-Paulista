/* Proteção contra clickjacking: o GitHub Pages não permite o cabeçalho
   X-Frame-Options, então a página se recusa a ser exibida dentro de outro site. */
if (window.top !== window.self) {
  try { window.top.location = window.self.location; } catch (e) { document.documentElement.hidden = true; }
}
