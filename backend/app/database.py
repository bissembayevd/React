import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


DEFAULT_DATABASE = Path(__file__).resolve().parents[1] / 'arena.db'


def make_engine(url=None):
    url = url or os.getenv('DATABASE_URL', f'sqlite:///{DEFAULT_DATABASE.as_posix()}')
    # Allow short concurrent writes to finish before reporting a busy database.
    engine = create_engine(url, connect_args={'check_same_thread': False, 'timeout': 15} if url.startswith('sqlite') else {})
    if url.startswith('sqlite'):
        @event.listens_for(engine, 'connect')
        def enable_foreign_keys(connection, _):
            connection.execute('PRAGMA foreign_keys=ON')
    return engine


def session_factory(engine):
    return sessionmaker(bind=engine, expire_on_commit=False)
