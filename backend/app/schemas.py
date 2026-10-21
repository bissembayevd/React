from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

Role = Literal['AWPer', 'Rifler', 'Entry Fragger', 'Support', 'IGL']
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]


class PlayerCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    nickname: Name
    firstName: Name
    lastName: Name
    nationality: Name
    age: Annotated[int, Field(strict=True, ge=16, le=45)]
    role: Role
    rating: Annotated[float, Field(strict=True, ge=0, le=3, allow_inf_nan=False)]
    status: Literal['free-agent'] = 'free-agent'
    teamId: None = None
    image: Literal['/images/player-placeholder.svg'] = '/images/player-placeholder.svg'


class PlayerUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    nickname: Name | None = None
    firstName: Name | None = None
    lastName: Name | None = None
    nationality: Name | None = None
    age: Annotated[int, Field(strict=True, ge=16, le=45)] | None = None
    role: Role | None = None
    rating: Annotated[float, Field(strict=True, ge=0, le=3, allow_inf_nan=False)] | None = None

    @model_validator(mode='after')
    def validate_changes(self):
        if not self.model_fields_set:
            raise ValueError('Provide at least one field to update.')
        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f'{field} cannot be null.')
        return self


class PlayerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    nickname: str
    firstName: str
    lastName: str
    nationality: str
    age: int
    role: Role
    teamId: str | None
    status: Literal['active', 'free-agent']
    rating: float
    image: str
    provenance: dict | None = None


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    country: str
    ranking: int
    logo: str
    description: str
    playerIds: list[str]


class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    summary: str
    content: str
    category: str
    image: str
    publishedAt: str
    relatedTeamId: str | None


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    team1Id: str
    team2Id: str
    tournamentId: str
    startTime: str
    status: Literal['upcoming', 'completed']
    score1: int | None
    score2: int | None
    featured: bool


class TournamentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    location: str
    startDate: str
    endDate: str
    status: Literal['upcoming', 'ongoing', 'completed']
    prizePool: int
    image: str
