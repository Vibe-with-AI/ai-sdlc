"""Shared helpers."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any


def find_project_root() -> Path:
    """Find project root by searching for .aisdlc file in current and parent directories."""
    current_dir = Path.cwd()
    for parent in [current_dir] + list(current_dir.parents):
        if (parent / ".aisdlc").exists():
            return parent
    # For init command, return current directory if no .aisdlc found
    # Other commands will check for .aisdlc existence separately
    return current_dir


ROOT = find_project_root()

# --- TOML loader (Python ≥3.11 stdlib) --------------------------------------
try:
    import tomllib as _toml  # Python 3.11+
except ModuleNotFoundError:  # pragma: no cover – fallback for < 3.11
    import tomli as _toml  # type: ignore[import-not-found,no-redef]  # noqa: D401  # `uv pip install tomli`


def load_config() -> dict[str, Any]:
    cfg_path = ROOT / ".aisdlc"
    if not cfg_path.exists():
        print(
            "Error: .aisdlc not found. Ensure you are in an ai-sdlc project directory."
        )
        print("Run `aisdlc init` to initialize a new project.")
        sys.exit(1)
    try:
        return _toml.loads(cfg_path.read_text())
    except _toml.TOMLDecodeError as e:
        print(f"❌ Error: '.aisdlc' configuration file is corrupted: {e}")
        print("Please fix the .aisdlc file or run 'aisdlc init' in a new directory.")
        sys.exit(1)


def slugify(text: str) -> str:
    """kebab-case ascii only"""
    slug = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", slug).strip("-").lower()
    return slug or "idea"


def read_lock() -> dict[str, Any]:
    path = ROOT / ".aisdlc.lock"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())  # type: ignore[no-any-return]
    except json.JSONDecodeError:
        print(
            "⚠️  Warning: '.aisdlc.lock' file is corrupted or not valid JSON. Treating as empty."
        )
        return {}


def write_lock(data: dict[str, Any]) -> None:
    (ROOT / ".aisdlc.lock").write_text(json.dumps(data, indent=2))
