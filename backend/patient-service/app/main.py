import asyncio

from app.db.db_service import connect_database, close_database
from app.grpc.server import start_grpc_server


async def main():
    await connect_database()
    grpc_server = await start_grpc_server()

    try:
        await grpc_server.wait_for_termination()
    finally:
        await grpc_server.stop(grace=5)
        await close_database()


if __name__ == "__main__":
    asyncio.run(main())