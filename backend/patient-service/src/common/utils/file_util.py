import asyncio
from pathlib import Path


async def moveFile(
    source: str,
    destinationFolder: str,
) -> str:
    """
    Move a file from its temporary location to the specified
    upload directory.
    """

    sourcePath = Path(source)

    if not sourcePath.exists():
        raise FileNotFoundError(
            f"Source file not found: {source}"
        )

    uploadDir = Path("uploads") / destinationFolder

    await asyncio.to_thread(
        uploadDir.mkdir,
        parents=True,
        exist_ok=True,
    )

    destination = uploadDir / sourcePath.name

    await asyncio.to_thread(
        sourcePath.replace,
        destination,
    )

    return f"{destinationFolder}/{sourcePath.name}"


async def deleteFile(filePath: str) -> None:
    """
    Delete a file if it exists.
    """

    try:
        path = Path(filePath)

        if path.exists():
            await asyncio.to_thread(path.unlink)

    except FileNotFoundError:
        pass

    except Exception as error:
        print(
            f"Failed to delete file: {filePath}",
            error,
        )