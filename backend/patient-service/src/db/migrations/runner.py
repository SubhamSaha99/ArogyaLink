import asyncio
import importlib

MIGRATIONS = [
    "src.db.migrations.versions.001_create_states_districts",
    "src.db.migrations.versions.002_create_medical_document_types",
]


async def runMigrations():
    for migrationName in MIGRATIONS:
        print(f"Running migration: {migrationName}")

        migration = importlib.import_module(migrationName)

        if hasattr(migration, "up"):
            await migration.up()

        print(f"Completed: {migrationName}")


if __name__ == "__main__":
    asyncio.run(runMigrations())