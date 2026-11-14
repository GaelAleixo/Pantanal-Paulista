#!/usr/bin/env python3
"""Gera paginas/eventos.json a partir da planilha publicada (CSV).

Roda só durante a publicação (GitHub Actions). O endereço da planilha vem do
segredo EVENTOS_CSV_URL e NUNCA é gravado no site: o navegador lê apenas o
eventos.json, que contém somente os campos públicos dos eventos aprovados.
"""
import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone

SAIDA = os.path.join("paginas", "eventos.json")
HOSTS_PERMITIDOS = {"docs.google.com"}
LIMITE_BYTES = 1_000_000
APROVADOS = {"sim", "s", "x", "ok", "aprovado", "true", "yes", "1"}
MAX = {"nome": 120, "categoria": 40, "local": 120, "descricao": 600, "link": 300}
CONTROLE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f​-‏‪-‮⁦-⁩]")


def norm(t):
    t = unicodedata.normalize("NFD", t or "")
    return "".join(c for c in t if not unicodedata.combining(c)).lower().strip()


def limpar(t, limite):
    t = CONTROLE.sub("", t or "")
    t = re.sub(r"\s+", " ", t).strip()
    return t[:limite]


def link_seguro(u):
    u = limpar(u, MAX["link"])
    try:
        p = urllib.parse.urlparse(u)
    except ValueError:
        return ""
    return u if p.scheme in ("http", "https") and p.netloc else ""


def parse_data(t):
    t = (t or "").strip()
    m = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})", t)
    try:
        if m:
            a = int(m.group(3))
            a += 2000 if a < 100 else 0
            return date(a, int(m.group(2)), int(m.group(1)))
        m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", t)
        if m:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    except ValueError:
        return None
    return None


def achar(cab, nomes, excluir=None):
    for n in nomes:
        for i, h in enumerate(cab):
            if n in h and not (excluir and excluir in h):
                return i
    return -1


def baixar(url):
    p = urllib.parse.urlparse(url)
    if p.scheme != "https" or p.hostname not in HOSTS_PERMITIDOS:
        raise ValueError("EVENTOS_CSV_URL deve ser https://docs.google.com/...")
    req = urllib.request.Request(url, headers={"User-Agent": "pantanal-paulista-deploy"})
    with urllib.request.urlopen(req, timeout=30) as r:
        dados = r.read(LIMITE_BYTES + 1)
    if len(dados) > LIMITE_BYTES:
        raise ValueError("planilha maior que o limite")
    return dados.decode("utf-8-sig")


def gravar(eventos):
    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump({"gerado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                   "eventos": eventos}, f, ensure_ascii=False, indent=1)
    print(f"[eventos] {len(eventos)} evento(s) gravado(s) em {SAIDA}")


def main():
    url = os.environ.get("EVENTOS_CSV_URL", "").strip()
    if not url:
        print("::warning::EVENTOS_CSV_URL ausente: só a lista fixa de eventos será exibida.")
        return gravar([])
    try:
        texto = baixar(url)
    except Exception as e:  # não derruba o deploy: publica sem eventos novos
        print(f"::warning::não foi possível ler a planilha ({type(e).__name__}).")
        return gravar([])
    if texto.lstrip().startswith("<"):
        print("::warning::o link não é um CSV (parece uma página HTML).")
        return gravar([])

    linhas = list(csv.reader(io.StringIO(texto)))
    if len(linhas) < 2:
        return gravar([])
    cab = [norm(h) for h in linhas[0]]
    ix = {
        "nome": achar(cab, ["nome do evento", "nome", "titulo", "evento"]),
        "cat": achar(cab, ["categoria", "tipo"]),
        "ini": achar(cab, ["inicio", "data do evento", "data"], "carimbo"),
        "fim": achar(cab, ["termino", "fim"]),
        "local": achar(cab, ["local"]),
        "desc": achar(cab, ["descri"]),
        "link": achar(cab, ["link", "site"]),
        "ok": achar(cab, ["aprovad", "publicar"]),
    }
    if ix["ok"] < 0 or ix["nome"] < 0 or ix["ini"] < 0:
        print("::warning::colunas obrigatórias (nome, data de início, aprovado) não encontradas.")
        return gravar([])

    hoje = (datetime.now(timezone.utc) - timedelta(hours=3)).date()  # horário de Brasília
    campo = lambda r, k: r[ix[k]] if 0 <= ix[k] < len(r) else ""
    eventos = []
    for r in linhas[1:]:
        if norm(campo(r, "ok")) not in APROVADOS:
            continue
        nome = limpar(campo(r, "nome"), MAX["nome"])
        ini = parse_data(campo(r, "ini"))
        fim = parse_data(campo(r, "fim"))
        if not nome or not ini or (fim or ini) < hoje:
            continue
        eventos.append({
            "nome": nome,
            "categoria": limpar(campo(r, "cat"), MAX["categoria"]),
            "inicio": ini.isoformat(),
            "fim": fim.isoformat() if fim and fim > ini else "",
            "local": limpar(campo(r, "local"), MAX["local"]),
            "descricao": limpar(campo(r, "desc"), MAX["descricao"]),
            "link": link_seguro(campo(r, "link")),
        })
    eventos.sort(key=lambda e: e["inicio"])
    gravar(eventos[:100])


if __name__ == "__main__":
    sys.exit(main())
