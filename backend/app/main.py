import logging
import os
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from .database import Base, make_engine, session_factory
from .routers.api import router
from .seed import seed_database


def create_app(database_url=None):
    engine = make_engine(database_url)
    sessions = session_factory(engine)

    @asynccontextmanager
    async def lifespan(app):
        Base.metadata.create_all(engine)
        with sessions() as session:
            seed_database(session)
        yield
        engine.dispose()

    app = FastAPI(title='CS2 ARENA demo API', lifespan=lifespan)
    app.state.session_factory = sessions
    app.state.engine = engine
    origins = [value.strip() for value in os.getenv('CORS_ORIGINS', 'http://127.0.0.1:5173,http://localhost:5173').split(',') if value.strip()]
    if '*' in origins:
        raise ValueError('CORS_ORIGINS must contain explicit origins, not a wildcard.')
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET', 'POST', 'PATCH'], allow_headers=['Content-Type'], allow_credentials=False)

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, error: RequestValidationError):
        errors = [{'field': '.'.join(str(part) for part in item['loc'] if part != 'body'), 'message': item['msg']} for item in error.errors()]
        return JSONResponse(status_code=422, content={'detail': {'code': 'VALIDATION_ERROR', 'message': '; '.join(f"{item['field']}: {item['message']}" for item in errors), 'errors': errors}})

    @app.exception_handler(SQLAlchemyError)
    async def database_error(request: Request, error: SQLAlchemyError):
        original = getattr(error, 'orig', None)
        sqlite_code = getattr(original, 'sqlite_errorcode', 0)
        if isinstance(original, sqlite3.OperationalError) and sqlite_code & 255 in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED):
            logging.warning('SQLite is busy; the request was not saved.')
            return JSONResponse(status_code=503, headers={'Retry-After': '2'}, content={'detail': {
                'code': 'DATABASE_BUSY',
                'message': 'Database is locked by another transaction. Commit or roll back pending edits in your database editor, then retry.'}})
        logging.exception('Database request failed', exc_info=error)
        return JSONResponse(status_code=503, content={'detail': {'code': 'DATABASE_ERROR', 'message': 'Database is unavailable. Please try again.'}})

    @app.get('/api/health')
    def health():
        return {'status': 'ok', 'data': 'fictional demo'}

    app.include_router(router)
    return app


app = create_app()
