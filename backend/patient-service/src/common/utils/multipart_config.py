from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import HTTPException, status
from starlette.datastructures import UploadFile

from src.config.settings import settings

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

MAX_IMAGE_SIZE = 1 * 1024 * 1024  # 1 MB
TEMP_DIR = Path("uploads/temp")


async def saveFile(file: UploadFile) -> str:
    """
    Validate and temporarily save a profile image.

    Returns:
        Filename of the temporarily saved image.
    """

    # Validate MIME type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, JPG, PNG and WEBP are allowed.",
        )

    TEMP_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Generate unique filename
    extension = Path(file.filename or "").suffix.lower()
    filename = f"{uuid4()}{extension}"

    filePath = TEMP_DIR / filename

    totalSize = 0

    try:
        async with aiofiles.open(filePath, "wb") as outputFile:

            while chunk := await file.read(1024 * 1024):
                totalSize += len(chunk)

                if totalSize > MAX_IMAGE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Profile image must not exceed 1 MB.",
                    )

                await outputFile.write(chunk)

    except Exception:
        # Remove partially uploaded file
        if filePath.exists():
            filePath.unlink()

        raise

    finally:
        await file.close()

    return filename
