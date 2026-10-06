from fastapi import APIRouter, Response, status
from src.health.health_service import HealthService

router = APIRouter(tags=["Health"])
healthService = HealthService()


@router.get("/")
def getLiveness():
    return healthService.getLiveness()


@router.get("/health")
@router.get("/api/health")
@router.get("/api/patient/health")
async def getHealth(response: Response):
    result = await healthService.check()
    if result["status"] != "ok":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result

