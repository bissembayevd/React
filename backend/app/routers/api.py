from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..media import present

router = APIRouter(prefix='/api')


def get_db(request: Request):
    with request.app.state.session_factory() as session:
        yield session


def find(session, model, record_id):
    record = session.get(model, record_id)
    if record is None:
        raise HTTPException(404, detail={'code': 'NOT_FOUND', 'message': 'The requested record was not found.'})
    return record


@router.get('/players', response_model=list[schemas.PlayerOut])
def players(db: Session = Depends(get_db)):
    return [present(record, schemas.PlayerOut) for record in db.scalars(select(models.Player).order_by(models.Player.id)).all()]


@router.get('/players/{record_id}', response_model=schemas.PlayerOut)
def player(record_id: str, db: Session = Depends(get_db)):
    return present(find(db, models.Player, record_id), schemas.PlayerOut)


@router.post('/players', response_model=schemas.PlayerOut, status_code=201)
def add_player(data: schemas.PlayerCreate, db: Session = Depends(get_db)):
    key = data.nickname.casefold()
    if db.scalar(select(models.Player.id).where(models.Player.nickname_key == key)):
        raise HTTPException(409, detail={'code': 'DUPLICATE_PLAYER', 'message': 'That nickname is already registered.'})
    record = models.Player(id=f'player-added-{uuid4()}', nickname_key=key, **data.model_dump())
    db.add(record)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # The unique database constraint also handles simultaneous submissions.
        raise HTTPException(409, detail={'code': 'DUPLICATE_PLAYER', 'message': 'That nickname is already registered.'})
    return present(record, schemas.PlayerOut)


@router.patch('/players/{record_id}', response_model=schemas.PlayerOut)
def update_player(record_id: str, data: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    record = find(db, models.Player, record_id)
    changes = data.model_dump(exclude_unset=True)
    if 'nickname' in changes:
        key = changes['nickname'].casefold()
        duplicate = db.scalar(select(models.Player.id).where(
            models.Player.nickname_key == key, models.Player.id != record_id))
        if duplicate:
            raise HTTPException(409, detail={'code': 'DUPLICATE_PLAYER', 'message': 'That nickname is already registered.'})
        record.nickname_key = key
    for field, value in changes.items():
        setattr(record, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, detail={'code': 'DUPLICATE_PLAYER', 'message': 'That nickname is already registered.'})
    return present(record, schemas.PlayerOut)


@router.get('/teams', response_model=list[schemas.TeamOut])
def teams(db: Session = Depends(get_db)):
    return [present(record, schemas.TeamOut) for record in db.scalars(select(models.Team).options(selectinload(models.Team.players)).order_by(models.Team.id)).all()]


@router.get('/teams/{record_id}', response_model=schemas.TeamOut)
def team(record_id: str, db: Session = Depends(get_db)):
    return present(find(db, models.Team, record_id), schemas.TeamOut)


@router.get('/news', response_model=list[schemas.NewsOut])
def news(db: Session = Depends(get_db)):
    return [present(record, schemas.NewsOut) for record in db.scalars(select(models.News).order_by(models.News.id)).all()]


@router.get('/news/{record_id}', response_model=schemas.NewsOut)
def article(record_id: str, db: Session = Depends(get_db)):
    return present(find(db, models.News, record_id), schemas.NewsOut)


@router.get('/matches', response_model=list[schemas.MatchOut])
def matches(db: Session = Depends(get_db)):
    return [present(record, schemas.MatchOut) for record in db.scalars(select(models.Match).order_by(models.Match.id)).all()]


@router.get('/matches/{record_id}', response_model=schemas.MatchOut)
def match(record_id: str, db: Session = Depends(get_db)):
    return present(find(db, models.Match, record_id), schemas.MatchOut)


@router.get('/tournaments', response_model=list[schemas.TournamentOut])
def tournaments(db: Session = Depends(get_db)):
    return [present(record, schemas.TournamentOut) for record in db.scalars(select(models.Tournament).order_by(models.Tournament.id)).all()]


@router.get('/tournaments/{record_id}', response_model=schemas.TournamentOut)
def tournament(record_id: str, db: Session = Depends(get_db)):
    return present(find(db, models.Tournament, record_id), schemas.TournamentOut)
