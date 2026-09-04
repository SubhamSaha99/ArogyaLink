from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, computed_field


class Settings(BaseSettings):
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_database: str = Field(default="arogya_link_patient")
    patient_service_grpc_url: str = Field(default="0.0.0.0:50054")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
