from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database: str = "arogyalink_patient_db"
    patient_service_grpc_url: str = "0.0.0.0:50054"

    # @property
    # def grpc_url(self) -> str:
    #     return self.patient_service_grpc_url

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
