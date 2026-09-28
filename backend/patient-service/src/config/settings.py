from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = Field(
        default=8081,
        validation_alias="PORT",
    )
    mongodbUrl: str = Field(
        default="mongodb://localhost:27017",
        validation_alias="MONGODB_URL",
    )
    mongodbDatabase: str = Field(
        default="arogya_link_patient",
        validation_alias="MONGODB_DATABASE",
    )
    patientServiceGrpcUrl: str = Field(
        default="0.0.0.0:50054",
        validation_alias="PATIENT_SERVICE_GRPC_URL",
    )
    redisHostDev: str = Field(
        default="127.0.0.1",
        validation_alias="REDIS_HOST_DEV",
    )
    redisPort: int = Field(
        default=6379,
        validation_alias="REDIS_PORT",
    )
    apiBaseUrl: str = Field(
        default="http://localhost:8080",
        validation_alias="API_BASE_URL",
    )
    jwtAccessSecret: str = Field(
        default="jwt_access_secret", validation_alias="JWT_ACCESS_SECRET"
    )
    jwtAccessExpiresIn: str = Field(
        default="180s", validation_alias="JWT_ACCESS_EXPIRES_IN"
    )
    jwtRefreshSecret: str = Field(
        default="jwt_refresh_secret", validation_alias="JWT_REFRESH_SECRET"
    )
    jwtRefreshExpiresIn: str = Field(
        default="1d", validation_alias="JWT_REFRESH_EXPIRES_IN"
    )
    jwtAlgorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
