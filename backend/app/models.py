from sqlalchemy import Boolean, CheckConstraint, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Team(Base):
    __tablename__ = 'teams'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String)
    ranking: Mapped[int] = mapped_column(Integer)
    logo: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    players: Mapped[list['Player']] = relationship(back_populates='team', order_by='Player.id')

    @property
    def playerIds(self):
        return [player.id for player in self.players]


class Player(Base):
    __tablename__ = 'players'
    __table_args__ = (
        CheckConstraint("(status = 'active' AND teamId IS NOT NULL) OR (status = 'free-agent' AND teamId IS NULL)"),
        CheckConstraint('age BETWEEN 16 AND 45'),
        CheckConstraint('rating BETWEEN 0 AND 3'),
    )
    id: Mapped[str] = mapped_column(String, primary_key=True)
    nickname: Mapped[str] = mapped_column(String(80))
    nickname_key: Mapped[str] = mapped_column(String, unique=True)
    firstName: Mapped[str] = mapped_column(String(80))
    lastName: Mapped[str] = mapped_column(String(80))
    nationality: Mapped[str] = mapped_column(String(80))
    age: Mapped[int] = mapped_column(Integer)
    role: Mapped[str] = mapped_column(String)
    teamId: Mapped[str | None] = mapped_column(ForeignKey('teams.id'), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String)
    rating: Mapped[float] = mapped_column(Float)
    image: Mapped[str] = mapped_column(String)
    team: Mapped[Team | None] = relationship(back_populates='players')


class News(Base):
    __tablename__ = 'news'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    summary: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String)
    image: Mapped[str] = mapped_column(String)
    publishedAt: Mapped[str] = mapped_column(String)
    relatedTeamId: Mapped[str | None] = mapped_column(ForeignKey('teams.id'), nullable=True)


class Tournament(Base):
    __tablename__ = 'tournaments'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String)
    startDate: Mapped[str] = mapped_column(String)
    endDate: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    prizePool: Mapped[int] = mapped_column(Integer)
    image: Mapped[str] = mapped_column(String)


class Match(Base):
    __tablename__ = 'matches'
    __table_args__ = (
        CheckConstraint('team1Id != team2Id'),
        CheckConstraint("(status = 'upcoming' AND score1 IS NULL AND score2 IS NULL) OR (status = 'completed' AND score1 IS NOT NULL AND score2 IS NOT NULL AND score1 != score2)"),
    )
    id: Mapped[str] = mapped_column(String, primary_key=True)
    team1Id: Mapped[str] = mapped_column(ForeignKey('teams.id'))
    team2Id: Mapped[str] = mapped_column(ForeignKey('teams.id'))
    tournamentId: Mapped[str] = mapped_column(ForeignKey('tournaments.id'), index=True)
    startTime: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    score1: Mapped[int | None] = mapped_column(Integer, nullable=True)
    score2: Mapped[int | None] = mapped_column(Integer, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean)
