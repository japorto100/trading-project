from __future__ import annotations

from fastapi import FastAPI


def create_service_app(title: str, version: str = "0.1.0") -> FastAPI:
    return FastAPI(title=title, version=version)
