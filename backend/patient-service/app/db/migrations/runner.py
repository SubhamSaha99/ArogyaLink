import asyncio
import importlib

MIGRATIONS = [
    "app.db.migrations.versions.001_create_states_districts",
]


async def run_migrations():
    for migration_name in MIGRATIONS:
        print(f"Running migration: {migration_name}")

        migration = importlib.import_module(migration_name)

        if hasattr(migration, "up"):
            await migration.up()

        print(f"Completed: {migration_name}")


if __name__ == "__main__":
    asyncio.run(run_migrations())