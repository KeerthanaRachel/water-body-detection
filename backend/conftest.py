import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import engine, Base
import pytest

@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure all database tables exist for tests."""
    Base.metadata.create_all(bind=engine)
    yield
