#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/usr/bin/env bats

setup() {
  TEST_DIR=$(mktemp -d)
  cp "$BATS_TEST_DIRNAME/backend_script.sh" "$TEST_DIR/start_backend.sh"
  chmod +x "$TEST_DIR/start_backend.sh"
  cd "$TEST_DIR"
}

teardown() {
  rm -rf "$TEST_DIR"
}

@test "test_backend_setup_happy_path" {
  touch requirements.txt requirements_ai.txt .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"🚀 Starting NewsPortal Backend with AI Features..."* ]]
  [[ "${output}" == *"Creating virtual environment..."* || -d ".venv" ]]
  [[ "${output}" == *"Installing dependencies..."* ]]
  [[ "${output}" == *"Setting up database..."* ]]
  [[ "${output}" == *"✅ Database tables created"* ]]
  [[ "${output}" == *"🎯 Starting FastAPI server..."* ]]
}

@test "test_env_file_missing" {
  touch requirements.txt requirements_ai.txt .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -eq 0 ]
  [[ "${output}" == *"⚠️  No .env file found. Copying from .env.example..."* ]]
  [[ "${output}" == *"📝 Please edit .env file with your API keys"* ]]
  [ -f ".env" ]
}

@test "test_missing_requirements_files" {
  touch .env .env.example
  mkdir -p database models
  echo "from sqlalchemy.ext.declarative import declarative_base; Base = declarative_base(); engine = None" > database/__init__.py
  echo "class News: pass" > models/__init__.py
  echo "def app(): pass" > main.py
  touch uvicorn

  run bash start_backend.sh

  [ "$status" -ne 0 ]
  [[ "${output}" == *"No such file or directory"* || "${output}" == *"ERROR"* ]]
}#!/bin/bash
# Backend Development Script for NewsPortal

echo "🚀 Starting NewsPortal Backend with AI Features..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
pip install -r requirements_ai.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys"
fi

# Run database migrations (if needed)
echo "Setting up database..."
python -c "
from database import engine, Base
from models import News
Base.metadata.create_all(bind=engine)
print('✅ Database tables created')
"

# Start the server
echo "🎯 Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 9000
