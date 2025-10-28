from typing import Optional, Literal
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from bson import ObjectId

# Helper to serialize Mongo ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        return ObjectId(str(v))

# This is what we store in Mongo
class OpportunityDB(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    orgName: str
    type: Literal["job", "grant", "scholarship", "training", "event"]
    location: Optional[str] = None              # "Remote", "Atlanta, GA", etc.
    deadline: Optional[datetime] = None
    description: str
    link: Optional[HttpUrl] = None              # external apply link
    imageUrl: Optional[str] = None              # CloudFront URL or fallback
    featured: bool = False                      # shows in Featured section
    approved: bool = False                      # moderation gate
    status: str = "pending"                     # pending, approved, rejected
    contributor_id: Optional[str] = None        # contributor who submitted
    contributor_email: Optional[str] = None     # for reference
    moderation_notes: Optional[str] = None      # admin notes on moderation
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Request body when a user submits a new opportunity from the form
class OpportunityCreate(BaseModel):
    title: str
    orgName: str
    type: Literal["job", "grant", "scholarship", "training", "event"]
    location: Optional[str] = None
    deadline: Optional[datetime] = None
    description: str
    link: Optional[HttpUrl] = None
    imageUrl: Optional[str] = None  # populated AFTER upload

# Response we send to frontend (public safe)
class OpportunityPublic(BaseModel):
    id: str
    title: str
    orgName: str
    type: str
    location: Optional[str]
    deadline: Optional[datetime]
    description: str
    link: Optional[HttpUrl]
    imageUrl: Optional[str]
    featured: bool
    createdAt: datetime
    # Phase 3.1 - Contributor info
    contributor_display_name: Optional[str] = None
    contributor_verified: bool = False
    # Phase 4.1 - Engagement metrics
    like_count: int = 0
    comment_count: int = 0
