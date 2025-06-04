---
# AI-Assisted Project Execution Plan & Task List Template

**Document Purpose:** This document serves as both an **exemplar project plan** and a **template** for generating a new, comprehensive, step-by-step task list. It is designed to be used by an AI assistant within a prompt chain.

**Intended Audience & Use:**
*   **Development Team:** As a model for well-defined project plans and task specifications.
*   **AI Assistant (You):** As a detailed structural guide and stylistic example. Your primary goal when using this template is to take an input Product Requirements Document (PRD) (likely provided from a previous step in a prompt chain, e.g., via a variable like `<prd_content>`) and generate a *new* set of atomic, detailed tasks for *that specific PRD*, mirroring the format, level of detail, and checkbox style demonstrated herein.

**This Document as an Exemplar:** The tasks outlined below for the "Video Processor Refactoring" project are a concrete example of the desired output. You should generate a *new and different* set of tasks relevant to the PRD you are given, but following this structural and stylistic pattern.

**Critical Contextual Documents (for the input PRD):**
When processing a new PRD, you will need to refer to it and any associated architectural or system pattern documents that might be provided alongside it to generate a relevant and accurate task list.
For the *exemplar* tasks within *this* document, the following were used (and you would expect similar for a new PRD):
*   `pitch.md` (Exemplar context)
*   `prd.md` (Exemplar context)
*   `architecture.md` (Exemplar context)
*   `system-patterns.md` (Exemplar context)

**Instructions for AI Assistant (You) when Generating a *New* Task List:**
1.  **Input PRD Focus:** Your generated task list must be based *entirely* on the new PRD provided to you.
2.  **Follow the Format:** Replicate the hierarchical structure (Phases, Task Groups, Tasks), the use of "Objective," "Action(s)," and "Verification/Deliverable(s)" for each task, and the markdown formatting.
3.  **Task Generation & Checkboxes:** Generate new tasks with `[ ]` (empty checkbox) as their initial status. The `[x]` in the exemplar below indicates a *completed* example task.
4.  **Atomicity:** Break down the work from the PRD into the smallest logical, actionable, and verifiable steps.
5.  **Detail:** Provide as much specific detail as possible for each task, including file paths, code snippets, or configuration examples if appropriate and inferable from the PRD or associated documents.

---

## Project Plan: Video Processor Refactoring

**Overall Project Goal:** Refactor the existing video processing logic from the legacy `video_processor` directory into the new `apps/core` application architecture. This refactor will leverage Supabase for Authentication and PostgreSQL database services. A key objective is to establish a robust, modern backend with excellent developer experience, including local development parity with production.

---

### **Phase 0: Project Setup & Essential Configuration**

#### **1. Directory Structure & Dependency Setup**

*   **Task 0.1: Verify/Create Core Application Directories in `apps/core/`** [x]
    *   **Objective:** Establish the foundational directory structure for the `apps/core` module.
    *   **Action(s):** Ensure the following directories exist within `apps/core/`. If a directory is missing, create it.
        *   `apps/core/lib/ai/`
        *   `apps/core/lib/auth/`
        *   `apps/core/lib/database/`
        *   `apps/core/lib/messaging/` (if not already present from a previous setup)
        *   `apps/core/lib/publishing/`
        *   `apps/core/lib/storage/`
        *   `apps/core/lib/utils/`
        *   `apps/core/api/schemas/`
        *   `apps/core/api/endpoints/`
        *   `apps/core/models/`
        *   `apps/core/operations/`
        *   `apps/core/services/`
        *   `apps/core/core/` (for shared core logic like exceptions, configuration)
        *   `apps/core/tests/unit/`
        *   `apps/core/tests/integration/`
    *   **Verification/Deliverable(s):** A correctly structured `apps/core/` directory containing all specified subdirectories.

*   **Task 0.2: Initialize Python Dependencies in `apps/core/pyproject.toml`** [x]
    *   **Objective:** Define and prepare the necessary Python libraries for the `apps/core` application.
    *   **Action(s):**
        1.  Open `apps/core/pyproject.toml`.
        2.  Add the following core dependencies:
            *   `fastapi`, `uvicorn`
            *   `sqlalchemy` (for ORM)
            *   `psycopg2-binary` (PostgreSQL adapter)
            *   `pydantic` (with email validation, settings management)
            *   `pydantic-settings` (for loading from .env)
            *   `python-jose[cryptography]` (for JWT handling)
            *   `python-multipart` (for file uploads)
            *   `google-cloud-storage` (if Google Cloud Storage is planned for use)
            *   Relevant AI SDKs (e.g., `google-generativeai`, `google-cloud-aiplatform`)
            *   `alembic` (for database migrations)
            *   `supabase` (Python client, if direct interaction beyond auth is needed)
        3.  Add testing libraries:
            *   `pytest`, `pytest-cov`, `httpx` (for FastAPI TestClient)
        4.  Ensure your project uses a dependency manager like `uv`, `poetry`, or `pdm` to install and manage these dependencies based on `pyproject.toml`.
            *   Example installation command (using `uv`): `uv pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic pydantic-settings "python-jose[cryptography]" python-multipart google-cloud-storage google-generativeai alembic supabase pytest pytest-cov httpx`
    *   **Verification/Deliverable(s):** Updated `apps/core/pyproject.toml` with all specified dependencies. Dependencies potentially installed in the project's virtual environment.

#### **2. Supabase Local & Cloud Setup**

*   **Task 0.2.1: Set Up Cloud Supabase Project** [x]
    *   **Objective:** Create and configure the cloud-hosted Supabase project.
    *   **Action(s):**
        1.  Go to [supabase.com](https://supabase.com) and create a new project.
        2.  In the project settings, navigate to the Auth providers section and enable Google Auth.
    *   **Verification/Deliverable(s):** A Supabase project available in the cloud with Google Auth enabled.

*   **Task 0.2.2: Obtain Cloud Supabase Project Credentials** [x]
    *   **Objective:** Securely record the necessary credentials from the cloud Supabase project.
    *   **Action(s):**
        1.  Navigate to your cloud Supabase project settings (Project Settings > API).
        2.  Carefully note down the following:
            *   Project URL
            *   Anon key (public)
            *   Service role key (secret - **handle with extreme care**)
            *   JWT Secret (found under Project Settings > API > JWT Settings)
    *   **Verification/Deliverable(s):** A record of the Project URL, Anon key, Service role key, and JWT Secret for the cloud Supabase project.

*   **Task 0.2.3: Initialize Local Supabase Environment using Supabase CLI** [x]
    *   **Objective:** Set up the local Supabase development environment for local development and testing.
    *   **Action(s):**
        1.  **Install Supabase CLI:** If not already installed, execute `npm install supabase --save-dev` in your project's root, or install globally as per your preference.
            *   *Verification:* Confirm the `supabase` command is accessible in your terminal.
        2.  **Initialize Supabase Project:**
            *   Navigate to your workspace root (or create a dedicated `supabase/` directory if you prefer to manage Supabase configuration files there).
            *   Run the command: `supabase init`.
            *   *Expected Result:* A `supabase` configuration folder is created in the current directory.
        3.  **Start Local Supabase Services:**
            *   Run the command: `supabase start`.
            *   *Expected Result:* Docker images are downloaded (if it's the first time), and local Supabase services (API, Database, Auth, etc.) are started.
            *   **Crucial:** Carefully note the following details provided in the command output:
                *   Local API URL (e.g., `http://localhost:54321`)
                *   Local Anon key (public)
                *   Local Service role key (secret)
                *   Local Default JWT secret
                *   Local Database URL (e.g., `postgresql://postgres:postgres@localhost:54322/postgres`)
    *   **Verification/Deliverable(s):** A running local Supabase instance. All local Supabase credentials (URL, keys, JWT secret, DB URL) noted down.

*   **Task 0.2.4: Configure Environment Variables (`.env`) for `apps/core`** [x]
    *   **Objective:** Set up environment variables for local development, including Supabase credentials and other service configurations.
    *   **Action(s):**
        1.  Create an example environment file `apps/core/.env.example` with placeholders for all required variables.
        2.  Create the actual environment file `apps/core/.env` (this file **must** be added to `.gitignore` to prevent committing secrets).
        3.  Populate `apps/core/.env` with your *local Supabase* credentials (obtained from `supabase start` output in Task 0.2.3) and any development API keys for services like AI (e.g., Gemini) or Google Cloud Storage.
    *   **Content for `apps/core/.env.example` (and to be filled in `.env`):**
        ```dotenv
        # apps/core/.env.example
        ENVIRONMENT="development" # Options: "development", "production", "test"

        # Supabase (Populate with Local Dev Defaults from 'supabase start' output)
        SUPABASE_URL="http://localhost:54321"
        SUPABASE_ANON_KEY="your_local_anon_key"
        SUPABASE_SERVICE_ROLE_KEY="your_local_service_role_key" # For backend use
        SUPABASE_JWT_SECRET="your_local_default_jwt_secret_at_least_32_characters_long" # Ensure this is strong
        DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres" # Default local Supabase DB URL

        # AI Service (Example: Gemini)
        GEMINI_API_KEY="your_development_gemini_api_key"
        # OPENAI_API_KEY="your_development_openai_api_key" # If using OpenAI

        # Storage Configuration
        STORAGE_BACKEND="local" # Options: "local", "gcs" (for Google Cloud Storage in production)
        LOCAL_STORAGE_PATH="./output_files" # Directory for local file storage (relative to apps/core)
        # GCS_BUCKET_NAME="your_gcs_bucket_name" # Required for 'gcs' backend
        # GOOGLE_APPLICATION_CREDENTIALS_PATH="/path/to/your/gcs_service_account.json" # Required for 'gcs' backend

        # Redis (Optional, if used for caching or other purposes)
        REDIS_HOST="localhost"
        REDIS_PORT="6379"
        REDIS_DB="0"
        REDIS_PASSWORD="" # Set if your Redis requires a password

        # General API Settings
        PROJECT_NAME="AI-Driven Backend Service"
        API_PREFIX="/api/v1"
        DEBUG="True" # Set to False in production

        # JWT Settings (for application-specific tokens if any, distinct from Supabase JWT)
        # SECRET_KEY="a_very_secret_key_for_your_app_specific_jwt" # Replace with a strong, random key
        # ALGORITHM="HS256"
        # ACCESS_TOKEN_EXPIRE_MINUTES="30"

        # Email Settings (If sending emails directly from the app)
        # SMTP_SERVER="smtp.example.com"
        # SMTP_PORT="587"
        # SMTP_USERNAME="your_email_username"
        # SMTP_PASSWORD="your_email_password"
        # EMAIL_FROM_ADDRESS="noreply@example.com"
        # EMAIL_TEMPLATES_DIR="templates/emails" # Relative to apps/core

        # File Upload Configuration
        UPLOAD_DIR="uploads" # Relative to apps/core, for temporary storage or direct uploads
        ```
    *   **Verification/Deliverable(s):**
        *   `apps/core/.env.example` created and populated with placeholders.
        *   `apps/core/.env` created, populated with local development credentials, and added to `.gitignore`.

*   **Task 0.2.5: Implement Configuration Loading in `apps/core/core/config.py`** [x]
    *   **Objective:** Create a robust mechanism for loading application settings from environment variables using Pydantic.
    *   **Action(s):** Create or update the file `apps/core/core/config.py` to define a Pydantic `Settings` class. This class should inherit from `pydantic_settings.BaseSettings` and load configurations from the `.env` file.
    *   **Code for `apps/core/core/config.py`:**
        ```python
        # apps/core/core/config.py
        from typing import Optional, Literal
        from pydantic_settings import BaseSettings
        from pydantic import PostgresDsn, RedisDsn
        from pathlib import Path

        class Settings(BaseSettings):
            ENVIRONMENT: Literal["development", "production", "test"] = "development"

            # Supabase
            SUPABASE_URL: str
            SUPABASE_ANON_KEY: str
            SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # Secret, use with care
            SUPABASE_JWT_SECRET: str # For validating Supabase JWTs
            DATABASE_URL: PostgresDsn # Pydantic will validate this as a PostgreSQL DSN

            # AI Services
            GEMINI_API_KEY: Optional[str] = None
            OPENAI_API_KEY: Optional[str] = None

            # Storage
            STORAGE_BACKEND: Literal["local", "gcs"] = "local"
            LOCAL_STORAGE_PATH: str = "output_files" # Relative path from apps/core
            GCS_BUCKET_NAME: Optional[str] = None
            GOOGLE_APPLICATION_CREDENTIALS_PATH: Optional[Path] = None

            # Redis
            REDIS_HOST: str = "localhost"
            REDIS_PORT: int = 6379
            REDIS_DB: int = 0
            REDIS_PASSWORD: Optional[str] = None
            # REDIS_URL: Optional[RedisDsn] = None # Alternative: provide full Redis DSN

            # API settings
            PROJECT_NAME: str = "AI-Driven Backend Service"
            API_PREFIX: str = "/api/v1"
            DEBUG: bool = False

            # Application-specific JWT settings (if needed, distinct from Supabase)
            # SECRET_KEY: str = "your_app_secret_key_change_me" # For signing app-specific tokens
            # ALGORITHM: str = "HS256"
            # ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

            # Email settings
            # SMTP_SERVER: Optional[str] = None
            # SMTP_PORT: Optional[int] = None
            # SMTP_USERNAME: Optional[str] = None
            # SMTP_PASSWORD: Optional[str] = None
            # EMAIL_FROM_ADDRESS: Optional[str] = None
            # EMAIL_TEMPLATES_DIR: str = "templates/emails"

            # File Uploads
            UPLOAD_DIR: str = "uploads" # Relative path from apps/core

            # Base Directory of the 'apps/core' application
            BASE_DIR: Path = Path(__file__).resolve().parent.parent

            class Config:
                env_file = ".env"
                env_file_encoding = "utf-8"
                extra = "ignore"  # Ignore extra fields from .env not defined in Settings

        settings = Settings()

        # Ensure paths are resolved correctly relative to BASE_DIR
        settings.LOCAL_STORAGE_PATH = str(settings.BASE_DIR / settings.LOCAL_STORAGE_PATH)
        settings.UPLOAD_DIR = str(settings.BASE_DIR / settings.UPLOAD_DIR)
        # if settings.EMAIL_TEMPLATES_DIR:
        #     settings.EMAIL_TEMPLATES_DIR = str(settings.BASE_DIR / settings.EMAIL_TEMPLATES_DIR)
        ```
    *   **Verification/Deliverable(s):**
        *   `apps/core/core/config.py` created and populated.
        *   The `settings` object can be imported and successfully loads values from `apps/core/.env`.

*   **Task 0.2.6: Confirm Database Connection Setup (`apps/core/lib/database/connection.py`)** [x]
    *   **Objective:** Ensure the database connection module is correctly set up for SQLAlchemy and FastAPI integration.
    *   **Action(s):** Review `apps/core/lib/database/connection.py`. Confirm it provides:
        1.  A SQLAlchemy session generator compatible with FastAPI dependency injection (e.g., `get_db_session`).
        2.  The SQLAlchemy declarative base (`Base = declarative_base()`).
        3.  Uses `settings.DATABASE_URL` from `apps.core.core.config` to create the SQLAlchemy engine.
    *   **Note:** The prompt indicates this file is likely already correctly configured. This task is primarily a verification step.
    *   **Verification/Deliverable(s):** `apps/core/lib/database/connection.py` is confirmed to meet requirements for SQLAlchemy integration with FastAPI and Alembic.

*   **Task 0.2.7: Initialize and Configure Database Migrations (Alembic)** [x]
    *   **Objective:** Set up Alembic for managing database schema migrations within the `apps/core` application.
    *   **Action(s):**
        1.  **Initialize Alembic:** If not already done, navigate to the `apps/core/` directory and run: `alembic init alembic`. This creates an `alembic` directory and an `alembic.ini` file.
        2.  **Configure `apps/core/alembic/env.py`:**
            *   Modify `env.py` to import `Base` from `apps.core.lib.database.connection` (or wherever your SQLAlchemy declarative base is defined). Set `target_metadata = Base.metadata`.
            *   Import `settings` from `apps.core.core.config`.
            *   Configure the database connection URL for Alembic. Ensure the `run_migrations_online()` function uses `settings.DATABASE_URL`. One common way is to set `config.set_main_option('sqlalchemy.url', str(settings.DATABASE_URL))`.
        3.  **Configure `apps/core/alembic.ini`:**
            *   Locate the `sqlalchemy.url` setting. It's best practice to comment this out or leave it blank in `alembic.ini` and explain in a comment that the URL is set dynamically from `settings.DATABASE_URL` in `env.py` to avoid hardcoding connection strings.
        4.  **Initial Migration (Post-Model Definition):** After defining initial SQLAlchemy models (in Phase 1), you will create the first migration.
            *   Command (from `apps/core/` directory): `alembic revision -m "initial_setup_video_processing_tables"`
            *   Then apply it: `alembic upgrade head`
            *   If specific guidelines like `sb-create-migration` (Supabase CLI migration helper) are relevant for local Supabase development, ensure adherence.
    *   **Verification/Deliverable(s):**
        *   Alembic initialized in `apps/core/`.
        *   `env.py` and `alembic.ini` correctly configured to use the application's database settings and metadata.
        *   (LATER, after Phase 1 models) An initial migration can be successfully generated and applied.

---

### **Phase 1: Foundation - Models and Core Libraries (Libs)**

#### **3. Define Core Data Models (`apps/core/models/`)**
    *   **General Requirement:** All ORM models must inherit from `Base` (the declarative base) defined in `apps.core.lib.database.connection`.

*   **Task 3.1: Define `VideoModel` in `apps/core/models/video_model.py`** [ ]
    *   **Objective:** Create the SQLAlchemy model for storing video metadata.
    *   **Action(s):** Define the `VideoModel` class inheriting from `Base`.
    *   **Attributes:**
        *   `id`: `Column(Integer, primary_key=True, autoincrement=True)`
        *   `uploader_user_id`: `Column(String, index=True, nullable=False)` (Corresponds to Supabase Auth user ID)
        *   `original_filename`: `Column(String, nullable=False)`
        *   `storage_path`: `Column(String, unique=True, nullable=False)` (Path in GCS or local filesystem)
        *   `content_type`: `Column(String, nullable=False)`
        *   `size_bytes`: `Column(Integer, nullable=False)`
        *   `created_at`: `Column(DateTime, default=func.now(), nullable=False)`
        *   `updated_at`: `Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)`
    *   **Key File(s):** `apps/core/models/video_model.py`
    *   **Verification/Deliverable(s):** `VideoModel` class correctly defined.

*   **Task 3.2: Define `ProcessingStatus` Enum in `apps/core/models/enums.py`** [ ]
    *   **Objective:** Create an enumeration for video job processing statuses.
    *   **Action(s):** Define the `ProcessingStatus` enum.
    *   **Definition:**
        ```python
        # apps/core/models/enums.py
        import enum

        class ProcessingStatus(str, enum.Enum):
            PENDING = "PENDING"
            PROCESSING = "PROCESSING"
            COMPLETED = "COMPLETED"
            FAILED = "FAILED"
        ```
    *   **Key File(s):** `apps/core/models/enums.py`
    *   **Verification/Deliverable(s):** `ProcessingStatus` enum correctly defined.

*   **Task 3.3: Define `VideoJobModel` in `apps/core/models/video_job_model.py`** [ ]
    *   **Objective:** Create the SQLAlchemy model for tracking video processing jobs.
    *   **Action(s):** Define the `VideoJobModel` class inheriting from `Base`.
    *   **Attributes:**
        *   `id`: `Column(Integer, primary_key=True, autoincrement=True)`
        *   `video_id`: `Column(Integer, ForeignKey("videos.id"), nullable=False)`
        *   `status`: `Column(SQLAlchemyEnumType(ProcessingStatus), nullable=False, default=ProcessingStatus.PENDING)`
        *   `processing_stages`: `Column(JSON, nullable=True)` (To store details/logs of different stages)
        *   `error_message`: `Column(Text, nullable=True)`
        *   `created_at`: `Column(DateTime, default=func.now(), nullable=False)`
        *   `updated_at`: `Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)`
    *   **Relationships:**
        *   `video = relationship("VideoModel", back_populates="jobs")` (Add `jobs = relationship("VideoJobModel", back_populates="video")` to `VideoModel`)
    *   **Key File(s):** `apps/core/models/video_job_model.py`
    *   **Verification/Deliverable(s):** `VideoJobModel` class correctly defined with attributes and relationship to `VideoModel`. `VideoModel` updated with the inverse relationship.

*   **Task 3.4: Define `VideoMetadataModel` in `apps/core/models/video_metadata_model.py`** [ ]
    *   **Objective:** Create the SQLAlchemy model for storing extracted metadata from videos.
    *   **Action(s):** Define the `VideoMetadataModel` class inheriting from `Base`.
    *   **Attributes:**
        *   `id`: `Column(Integer, primary_key=True, autoincrement=True)`
        *   `job_id`: `Column(Integer, ForeignKey("video_jobs.id"), unique=True, nullable=False)`
        *   `title`: `Column(String, nullable=True)`
        *   `description`: `Column(Text, nullable=True)`
        *   `tags`: `Column(JSON, nullable=True)` (Alternatively, `sqlalchemy.dialects.postgresql.ARRAY(String)` for PostgreSQL)
        *   `transcript_text`: `Column(Text, nullable=True)`
        *   `transcript_file_url`: `Column(String, nullable=True)` (URL to stored transcript file)
        *   `subtitle_files_urls`: `Column(JSON, nullable=True)` (e.g., `{"vtt": "url_to_vtt", "srt": "url_to_srt"}`)
        *   `thumbnail_file_url`: `Column(String, nullable=True)` (URL to stored thumbnail image)
        *   `extracted_video_duration_seconds`: `Column(Float, nullable=True)`
        *   `extracted_video_resolution`: `Column(String, nullable=True)` (e.g., "1920x1080")
        *   `extracted_video_format`: `Column(String, nullable=True)` (e.g., "mp4")
        *   `show_notes_text`: `Column(Text, nullable=True)`
        *   `created_at`: `Column(DateTime, default=func.now(), nullable=False)`
        *   `updated_at`: `Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)`
    *   **Relationships:**
        *   `job = relationship("VideoJobModel", back_populates="metadata")`
        *   (Add `metadata = relationship("VideoMetadataModel", back_populates="job", uselist=False)` to `VideoJobModel`)
    *   **Key File(s):** `apps/core/models/video_metadata_model.py`
    *   **Verification/Deliverable(s):** `VideoMetadataModel` class correctly defined. `VideoJobModel` updated with the inverse one-to-one relationship.

*   **Task 3.5: Configure Model Imports and Alembic Metadata** [ ]
    *   **Objective:** Ensure all defined models are accessible and recognized by Alembic.
    *   **Action(s):**
        1.  Update `apps/core/models/__init__.py` to import all model classes (e.g., `from .video_model import VideoModel`, `from .video_job_model import VideoJobModel`, etc.) and also `Base` from `apps.core.lib.database.connection`. This makes them available for Alembic's autogenerate feature.
        2.  Verify that `apps/core/alembic/env.py` has `target_metadata = Base.metadata` (where `Base` is imported from where your models are registered, typically via `models.__init__`).
    *   **Key File(s):** `apps/core/models/__init__.py`, `apps/core/alembic/env.py`
    *   **Verification/Deliverable(s):** `__init__.py` correctly exports models. Alembic `env.py` correctly points to the `Base.metadata` containing all model definitions.

*   **Task 3.6: Generate and Apply Database Migrations for Video Processing Tables** [ ]
    *   **Objective:** Create and apply database schema changes based on the newly defined models.
    *   **Action(s):**
        1.  Navigate to the `apps/core/` directory in your terminal.
        2.  Run Alembic to automatically generate a new revision script: `alembic revision --autogenerate -m "create_video_processing_tables"`
        3.  Carefully inspect the generated migration script located in `apps/core/alembic/versions/`. Verify it accurately reflects the intended schema changes for `VideoModel`, `VideoJobModel`, and `VideoMetadataModel`.
        4.  Apply the migration to your local Supabase database: `alembic upgrade head`
    *   **Verification/Deliverable(s):**
        *   A new Alembic migration script is generated.
        *   The migration is successfully applied to the local development database.
        *   The corresponding tables (`videos`, `video_jobs`, `video_metadata`) exist in the database with the correct columns and relationships.

#### **4. Develop/Enhance Core Libraries (`apps/core/lib/`)**

##### **Storage (`apps/core/lib/storage/file_storage.py`)**

*   **Task 4.1: Define `FileStorageService` Class Structure** [ ]
    *   **Objective:** Create the basic structure for the file storage service.
    *   **Action(s):** Define the `FileStorageService` class in `apps/core/lib/storage/file_storage.py`. The constructor should accept `settings: Settings` (from `apps.core.core.config`).
    *   **Code Structure:**
        ```python
        # apps/core/lib/storage/file_storage.py
        from abc import ABC, abstractmethod
        from apps.core.core.config import Settings
        from pathlib import Path
        import aiofiles
        import os
        # Add GCS client imports if/when GCS is implemented
        # from google.cloud import storage

        class BaseStorageService(ABC):
            @abstractmethod
            async def save_file(self, file_content: bytes, filename: str, subdir: str = "uploads") -> str:
                pass

            @abstractmethod
            async def download_file(self, storage_path: str, destination_local_path: str) -> None:
                pass
            
            @abstractmethod
            async def get_public_url(self, storage_path: str) -> Optional[str]:
                pass

        class LocalFileStorageService(BaseStorageService):
            def __init__(self, settings: Settings):
                self.settings = settings
                self.base_path = Path(settings.LOCAL_STORAGE_PATH)
                # Ensure base_path exists
                self.base_path.mkdir(parents=True, exist_ok=True)

            async def save_file(self, file_content: bytes, filename: str, subdir: str = "uploads") -> str:
                # ... implementation ...
                return str(file_path_abs) # Return absolute local path or path relative to a known root

            async def download_file(self, storage_path: str, destination_local_path: str) -> None:
                # ... implementation for local copy ...
                pass # storage_path is likely an absolute local path here

            async def get_public_url(self, storage_path: str) -> Optional[str]:
                # Local files typically don't have a direct public HTTP URL without a serving mechanism
                return None # Or a placeholder like f"file://{storage_path}" for dev reference

        # class GCSFileStorageService(BaseStorageService):
        #     def __init__(self, settings: Settings):
        #         self.settings = settings
        #         # Initialize GCS client, potentially using GOOGLE_APPLICATION_CREDENTIALS_PATH
        #         # self.client = storage.Client()
        #         # self.bucket = self.client.bucket(settings.GCS_BUCKET_NAME)
        #         pass # Placeholder
        #
        #     async def save_file(self, file_content: bytes, filename: str, subdir: str = "uploads") -> str:
        #         # ... GCS upload implementation ...
        #         # blob_path = f"{subdir}/{filename}"
        #         # blob = self.bucket.blob(blob_path)
        #         # await asyncio.to_thread(blob.upload_from_string, file_content)
        #         # return f"gs://{self.settings.GCS_BUCKET_NAME}/{blob_path}"
        #         pass # Placeholder
        #
        #     async def download_file(self, storage_path: str, destination_local_path: str) -> None:
        #         # ... GCS download implementation ...
        #         # Assuming storage_path is gs://bucket_name/path/to/blob
        #         pass # Placeholder
        #
        #     async def get_public_url(self, storage_path: str) -> Optional[str]:
        #         # ... GCS public URL generation ...
        #         # Assuming storage_path is gs://bucket_name/path/to/blob
        #         # blob_name = storage_path.replace(f"gs://{self.settings.GCS_BUCKET_NAME}/", "")
        #         # blob = self.bucket.blob(blob_name)
        #         # return blob.public_url # Or signed URL
        #         pass # Placeholder

        def get_file_storage_service(settings: Settings) -> BaseStorageService:
            if settings.STORAGE_BACKEND == "local":
                return LocalFileStorageService(settings)
            # elif settings.STORAGE_BACKEND == "gcs":
            #     if not settings.GCS_BUCKET_NAME:
            #         raise ValueError("GCS_BUCKET_NAME must be set for GCS storage backend.")
            #     return GCSFileStorageService(settings)
            else:
                raise ValueError(f"Unsupported storage backend: {settings.STORAGE_BACKEND}")

        ```
    *   **Key File(s):** `apps/core/lib/storage/file_storage.py`
    *   **Verification/Deliverable(s):** `FileStorageService` class structure with constructor and method signatures defined. `get_file_storage_service` factory function created.

*   **Task 4.2: Implement `save_file` Method for `FileStorageService`** [ ]
    *   **Objective:** Implement file saving logic for both local and GCS backends.
    *   **Action(s):**
        1.  **Local Storage:**
            *   In `LocalFileStorageService.save_file`:
                *   Construct the full file path: `{self.base_path}/{subdir}/{filename}`.
                *   Ensure the subdirectory `{self.base_path}/{subdir}` exists (use `os.makedirs(..., exist_ok=True)` or `Path(...).mkdir(parents=True, exist_ok=True)`).
                *   Asynchronously write `file_content` (bytes) to this path using `aiofiles`.
                *   Return the absolute local path of the saved file (e.g., `/abs/path/to/apps/core/output_files/subdir/filename`) or a path relative to a well-defined service root.
        2.  **GCS Storage (Placeholder/Future):**
            *   In `GCSFileStorageService.save_file` (if implementing now, otherwise placeholder):
                *   Use the `google-cloud-storage` client.
                *   Upload `file_content` to `self.settings.GCS_BUCKET_NAME` under the GCS path `{subdir}/{filename}`.
                *   Return the GCS URI (e.g., `gs://{bucket_name}/{subdir}/{filename}`).
    *   **Verification/Deliverable(s):** `save_file` method correctly saves files to the configured backend (initially local) and returns the storage path.

*   **Task 4.3: Implement `download_file` Method for `FileStorageService`** [ ]
    *   **Objective:** Implement file downloading logic.
    *   **Action(s):**
        1.  **Local Storage:**
            *   In `LocalFileStorageService.download_file`: `storage_path` will be an absolute local path. Copy the file from `storage_path` to `destination_local_path`. Can use `shutil.copy` or `aiofiles` for async copy.
        2.  **GCS Storage (Placeholder/Future):**
            *   In `GCSFileStorageService.download_file`: `storage_path` is a GCS URI. Download the blob to `destination_local_path`.
    *   **Verification/Deliverable(s):** `download_file` method correctly retrieves files from storage.

*   **Task 4.4: Implement `get_public_url` Method for `FileStorageService`** [ ]
    *   **Objective:** Implement logic to get a publicly accessible URL for a stored file.
    *   **Action(s):**
        1.  **Local Storage:**
            *   In `LocalFileStorageService.get_public_url`: Local files are not typically public via HTTP without a dedicated serving mechanism. Return `None` or a `file://` URI for dev reference if appropriate.
        2.  **GCS Storage (Placeholder/Future):**
            *   In `GCSFileStorageService.get_public_url`: Generate and return a public URL or a signed URL for the GCS object.
    *   **Verification/Deliverable(s):** `get_public_url` method returns an appropriate URL or `None`.


##### **AI (`apps/core/lib/ai/`)**

*   **Task 4.5: Define Base AI Adapter Interface (`apps/core/lib/ai/base_adapter.py`)** [ ]
    *   **Objective:** Create an abstract base class for AI service adapters.
    *   **Action(s):** Define `AIAdapterInterface(ABC)` with abstract methods:
        *   `async generate_text(self, prompt: str, context: Optional[str] = None) -> str`
        *   `async transcribe_audio(self, audio_file_path: str) -> str` (should aim to return structured transcript if possible, e.g., JSON with segments and timestamps, otherwise plain text)
    *   **Key File(s):** `apps/core/lib/ai/base_adapter.py`
    *   **Verification/Deliverable(s):** `AIAdapterInterface` defined with specified abstract methods.

*   **Task 4.6: Implement Gemini Adapter (`apps/core/lib/ai/gemini_adapter.py`)** [ ]
    *   **Objective:** Create a concrete implementation of `AIAdapterInterface` for Google Gemini.
    *   **Action(s):**
        1.  Define `GeminiAdapter(AIAdapterInterface)`.
        2.  Constructor `__init__(self, settings: Settings)`: Initialize the Gemini client using `settings.GEMINI_API_KEY`.
        3.  Implement `async generate_text` using the Gemini SDK.
        4.  Implement `async transcribe_audio` (if Gemini supports it directly for local files or via an intermediate GCS upload; otherwise, this might involve a different service or be a placeholder).
    *   **Key File(s):** `apps/core/lib/ai/gemini_adapter.py`
    *   **Verification/Deliverable(s):** `GeminiAdapter` implemented, capable of text generation and (potentially) audio transcription.

*   **Task 4.7: Create AI Client Factory (`apps/core/lib/ai/ai_client_factory.py`)** [ ]
    *   **Objective:** Create a factory function to provide an instance of an AI adapter.
    *   **Action(s):** Define `def get_ai_adapter(settings: Settings) -> AIAdapterInterface:`. Initially, it can return `GeminiAdapter(settings)`. This allows for easier swapping of AI providers later.
    *   **Key File(s):** `apps/core/lib/ai/ai_client_factory.py`
    *   **Verification/Deliverable(s):** `get_ai_adapter` factory function created.

*   **Task 4.8: Implement AI Caching with Redis (`apps/core/lib/cache/redis_cache.py`)** [ ]
    *   **Objective:** Set up a Redis-based caching mechanism for AI API calls to reduce costs and latency.
    *   **Action(s):**
        1.  Create `apps/core/lib/cache/redis_cache.py`.
        2.  Define a `RedisCache` class.
            *   Constructor `__init__(self, settings: Settings)`: Connect to Redis using `redis-py` (async version `redis.asyncio` recommended) with `settings.REDIS_HOST`, `settings.REDIS_PORT`, `settings.REDIS_DB`, `settings.REDIS_PASSWORD`.
            *   Implement `async get(self, key: str) -> Optional[str]:` (or `Optional[Any]` if storing complex objects, using `json.dumps/loads` or `pickle`).
            *   Implement `async set(self, key: str, value: str, ttl_seconds: Optional[int] = None):`
        3.  Modify AI adapter implementations (e.g., `GeminiAdapter`) to use this `RedisCache`.
            *   Before making an API call, attempt to retrieve the result from the cache using a key derived from the input (e.g., hash of the prompt and context).
            *   If a cache miss, make the API call, then store the result in the cache.
    *   **Key File(s):** `apps/core/lib/cache/redis_cache.py`, AI adapter files.
    *   **Verification/Deliverable(s):** `RedisCache` class implemented. AI adapters use caching for relevant API calls.

##### **Utilities (`apps/core/lib/utils/`)**

*   **Task 4.9: Implement FFmpeg Utilities (`apps/core/lib/utils/ffmpeg_utils.py`)** [ ]
    *   **Objective:** Create utility functions for video/audio manipulation using FFmpeg.
    *   **Action(s):**
        1.  Create `apps/core/lib/utils/ffmpeg_utils.py`.
        2.  Define `FfmpegUtils` class or standalone functions.
        3.  Implement methods using `subprocess.run` to call the `ffmpeg` command-line tool. Ensure `ffmpeg` is accessible in the system PATH.
            *   `extract_audio_sync(video_path: str, output_audio_path: str) -> None`: Extracts audio from video.
            *   `extract_frame_sync(video_path: str, timestamp_seconds: float, output_image_path: str) -> None`: Extracts a single frame.
            *   `get_video_metadata_sync(video_path: str) -> dict`: Uses `ffprobe` (part of FFmpeg) to get video metadata (duration, resolution, format, etc.) and returns it as a dictionary.
        4.  Consider error handling for `subprocess.run` calls (e.g., check return codes, capture stderr).
    *   **Key File(s):** `apps/core/lib/utils/ffmpeg_utils.py`
    *   **Verification/Deliverable(s):** FFmpeg utility functions capable of audio extraction, frame extraction, and metadata retrieval.

*   **Task 4.10: Implement File Handling Utilities (`apps/core/lib/utils/file_utils.py`)** [ ]
    *   **Objective:** Create utilities for common file system operations, especially temporary file/directory management.
    *   **Action(s):**
        1.  Create `apps/core/lib/utils/file_utils.py`.
        2.  Define `FileUtils` class or standalone functions.
            *   `create_temp_dir() -> str`: Creates a temporary directory using `tempfile.mkdtemp()` and returns its path.
            *   `cleanup_temp_dir(dir_path: str) -> None`: Removes the specified directory and its contents using `shutil.rmtree()`. Handle potential errors.
    *   **Key File(s):** `apps/core/lib/utils/file_utils.py`
    *   **Verification/Deliverable(s):** File utilities for temporary directory creation and cleanup.

*   **Task 4.11: Implement Subtitle Utilities (`apps/core/lib/utils/subtitle_utils.py`)** [ ]
    *   **Objective:** Create utilities for generating subtitle files (VTT, SRT) from transcript data.
    *   **Action(s):**
        1.  Create `apps/core/lib/utils/subtitle_utils.py`.
        2.  Define `SubtitleUtils` class or standalone functions.
        3.  Define the expected structure for `transcript_segments` (e.g., a list of dictionaries: `[{'text': '...', 'start_time': 0.5, 'end_time': 1.2}, ...]`).
        4.  Implement `generate_vtt(transcript_segments: list) -> str`: Generates VTT content as a string.
        5.  Implement `generate_srt(transcript_segments: list) -> str`: Generates SRT content as a string.
    *   **Key File(s):** `apps/core/lib/utils/subtitle_utils.py`
    *   **Verification/Deliverable(s):** Subtitle utilities capable of generating VTT and SRT formatted strings from structured transcript data.

##### **Authentication Utilities (`apps/core/lib/auth/supabase_auth.py`)**

*   **Task 4.12: Define `AuthenticatedUser` Model (`apps/core/lib/auth/supabase_auth.py`)** [ ]
    *   **Objective:** Create a Pydantic model to represent an authenticated user based on Supabase JWT claims.
    *   **Action(s):** Define `AuthenticatedUser(BaseModel)`:
        *   `id: str` (maps to `sub` claim)
        *   `email: Optional[str] = None`
        *   `aud: Optional[str] = None` (audience)
        *   Other relevant claims as needed (e.g., `role`).
    *   **Key File(s):** `apps/core/lib/auth/supabase_auth.py`
    *   **Verification/Deliverable(s):** `AuthenticatedUser` Pydantic model defined.

*   **Task 4.13: Implement `get_current_user` Dependency (`apps/core/lib/auth/supabase_auth.py`)** [ ]
    *   **Objective:** Create a FastAPI dependency to authenticate users using Supabase JWTs.
    *   **Action(s):**
        1.  Define `async def get_current_user(settings: Settings = Depends(get_settings_dependency), token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/v1/auth/token"))) -> AuthenticatedUser:`
            *   Note: `tokenUrl` is a placeholder here as Supabase client typically handles token acquisition. It's needed by `OAuth2PasswordBearer` but won't be called by FastAPI itself if tokens are passed in `Authorization` header. A dummy endpoint can be created if strict OpenAPI validation requires it.
            *   Use `python-jose.jwt.decode` to validate and decode the token.
                *   Key: `settings.SUPABASE_JWT_SECRET`
                *   Algorithms: `["HS256"]` (Confirm Supabase default)
                *   Audience: `"authenticated"` (Confirm Supabase default audience for user tokens)
            *   Extract `sub` (as user ID), `email`, `aud`, and any other relevant claims from the decoded token.
            *   Populate and return an `AuthenticatedUser` model.
            *   Handle `jose.JWTError` or `jose.ExpiredSignatureError` by raising an `HTTPException` (e.g., status code 401 or 403).
        2.  Create `get_settings_dependency` if not already available, e.g. `def get_settings_dependency() -> Settings: return settings_instance_from_config_py`.
    *   **Key File(s):** `apps/core/lib/auth/supabase_auth.py`
    *   **Verification/Deliverable(s):** `get_current_user` FastAPI dependency that can validate a Supabase JWT and return user information.

#### **5. Error Handling (`apps/core/core/exceptions.py`)**

*   **Task 5.1: Define Custom Application Exceptions** [ ]
    *   **Objective:** Create custom exception classes for domain-specific errors.
    *   **Action(s):** Define the following custom exceptions in `apps/core/core/exceptions.py`:
        *   `VideoProcessingError(Exception)`: Base exception for video processing issues.
        *   `AINoResponseError(VideoProcessingError)`: For errors when AI services fail to respond.
        *   `FFmpegError(VideoProcessingError)`: For errors originating from FFmpeg command execution.
        *   `StorageServiceError(Exception)`: Base for storage related issues.
        *   `ConfigurationError(Exception)`: For issues with application configuration.
    *   **Key File(s):** `apps/core/core/exceptions.py`
    *   **Verification/Deliverable(s):** Custom exception classes defined.

---

### **Phase 2: Data Access - Operations Layer (Repositories)**

    *   **General Requirement:** All repository methods should accept `db: Session` (SQLAlchemy session) as their first argument and are typically called from service layer methods.

#### **6. Implement Repositories (`apps/core/operations/`)**

*   **Task 6.1: Implement `VideoRepository` (`apps/core/operations/video_repository.py`)** [ ]
    *   **Objective:** Create a repository for CRUD operations on `VideoModel`.
    *   **Action(s):** Define `VideoRepository` class.
    *   **Methods:**
        *   `create_video(self, db: Session, *, uploader_user_id: str, original_filename: str, storage_path: str, content_type: str, size_bytes: int) -> VideoModel`: Creates and returns a new `VideoModel` instance.
        *   `get_video_by_id(self, db: Session, *, video_id: int) -> Optional[VideoModel]`: Retrieves a video by its ID.
        *   `get_videos_by_uploader(self, db: Session, *, uploader_user_id: str, skip: int = 0, limit: int = 100) -> List[VideoModel]`: Retrieves videos for a specific uploader.
    *   **Key File(s):** `apps/core/operations/video_repository.py`
    *   **Verification/Deliverable(s):** `VideoRepository` with implemented CRUD methods.

*   **Task 6.2: Implement `VideoJobRepository` (`apps/core/operations/video_job_repository.py`)** [ ]
    *   **Objective:** Create a repository for operations on `VideoJobModel`.
    *   **Action(s):** Define `VideoJobRepository` class.
    *   **Methods:**
        *   `create_video_job(self, db: Session, *, video_id: int, initial_status: ProcessingStatus = ProcessingStatus.PENDING) -> VideoJobModel`: Creates a new video job.
        *   `get_video_job_by_id(self, db: Session, *, job_id: int) -> Optional[VideoJobModel]`: Retrieves a job by ID.
        *   `update_job_status(self, db: Session, *, job_id: int, status: ProcessingStatus, error_message: Optional[str] = None) -> Optional[VideoJobModel]`: Updates job status and optionally an error message.
        *   `add_processing_stage_log(self, db: Session, *, job_id: int, stage_name: str, details: dict) -> Optional[VideoJobModel]`: Appends a log entry to the `processing_stages` JSON field. (Requires careful handling of JSON updates in SQLAlchemy).
        *   `get_jobs_for_video(self, db: Session, *, video_id: int) -> List[VideoJobModel]`: Retrieves all jobs for a video.
    *   **Key File(s):** `apps/core/operations/video_job_repository.py`
    *   **Verification/Deliverable(s):** `VideoJobRepository` with implemented methods.

*   **Task 6.3: Implement `VideoMetadataRepository` (`apps/core/operations/video_metadata_repository.py`)** [ ]
    *   **Objective:** Create a repository for operations on `VideoMetadataModel`.
    *   **Action(s):** Define `VideoMetadataRepository` class.
    *   **Methods:**
        *   `create_or_update_metadata(self, db: Session, *, job_id: int, **kwargs) -> VideoMetadataModel`: Creates new metadata or updates existing metadata for a given `job_id`.
            *   This method should first try to fetch metadata by `job_id`. If it exists, update its fields with `**kwargs`. If not, create a new `VideoMetadataModel` instance.
        *   `get_metadata_by_job_id(self, db: Session, *, job_id: int) -> Optional[VideoMetadataModel]`: Retrieves metadata by job ID.
    *   **Key File(s):** `apps/core/operations/video_metadata_repository.py`
    *   **Verification/Deliverable(s):** `VideoMetadataRepository` with implemented methods.

---

### **Phase 3: Business Logic - Service Layer**

#### **7. Develop Core Video Processing Service (`apps/core/services/video_processing_service.py`)**

*   **Task 7.1: Define `VideoProcessingService` Class Structure and Dependencies** [ ]
    *   **Objective:** Set up the main service class for handling video processing logic.
    *   **Action(s):**
        1.  Define `VideoProcessingService` class in `apps/core/services/video_processing_service.py`.
        2.  The constructor `__init__` should inject instances of:
            *   `VideoRepository`
            *   `VideoJobRepository`
            *   `VideoMetadataRepository`
            *   `BaseStorageService` (from `apps.core.lib.storage.file_storage`)
            *   `AIAdapterInterface` (from `apps.core.lib.ai.ai_client_factory`)
            *   `FfmpegUtils` (or its functions)
            *   `SubtitleUtils` (or its functions)
            *   `FileUtils` (or its functions)
            *   `Settings` (from `apps.core.core.config`)
    *   **Key File(s):** `apps/core/services/video_processing_service.py`
    *   **Verification/Deliverable(s):** `VideoProcessingService` class defined with a constructor injecting all necessary dependencies.

*   **Task 7.2: Implement `initiate_video_processing` Method** [ ]
    *   **Objective:** Create the service method to start the video processing workflow.
    *   **Action(s):** Implement `async def initiate_video_processing(self, db: Session, original_filename: str, video_content: bytes, content_type: str, uploader_user_id: str, background_tasks: BackgroundTasks) -> VideoJobModel`:
        1.  Generate a unique filename (e.g., using `uuid.uuid4()`) to avoid collisions.
        2.  Save the `video_content` using `self.file_storage_service.save_file()`. The `subdir` could be structured, e.g., `f"videos/{uploader_user_id}/{unique_filename_stem}"`.
        3.  Create a `VideoModel` record in the database using `self.video_repository.create_video()`.
        4.  Create a `VideoJobModel` record (initial status `PENDING`) using `self.video_job_repository.create_video_job()`, linking it to the created `VideoModel`.
        5.  Add the background processing task: `background_tasks.add_task(self._execute_processing_pipeline, job_id=new_job.id, video_storage_path=stored_video_path, video_original_filename=original_filename)`.
        6.  Perform `db.commit()` to save the initial `VideoModel` and `VideoJobModel` records.
        7.  Return the newly created `VideoJobModel`.
    *   **Verification/Deliverable(s):** `initiate_video_processing` method implemented, correctly saving the video file, creating database records, and scheduling the background processing task.

*   **Task 7.3: Implement `_execute_processing_pipeline` Background Method** [ ]
    *   **Objective:** Implement the core logic for processing a video in the background.
    *   **Action(s):** Implement `async def _execute_processing_pipeline(self, job_id: int, video_storage_path: str, video_original_filename: str)`:
        *   **Important:** This method runs in a background task, so it needs its own database session. Use a `with get_db_session() as db_bg:` context (assuming `get_db_session` is a context manager yielding a session).
        1.  Fetch the `VideoJobModel` using `job_id` via `self.video_job_repository`. If not found, log an error and exit.
        2.  Update job status to `PROCESSING` using `self.video_job_repository.update_job_status()`. Commit `db_bg`.
        3.  Create a temporary working directory using `self.file_utils.create_temp_dir()`.
        4.  **Implement a `try...except...finally` block for robust processing and cleanup:**
            *   **`try` block:**
                1.  Download the video file from `video_storage_path` to a path within the temporary directory using `self.file_storage_service.download_file()`. Let this be `local_video_path`.
                2.  **Step 1: Basic Video Metadata Extraction:**
                    *   Use `self.ffmpeg_utils.get_video_metadata_sync(local_video_path)`.
                    *   Update `VideoMetadataModel` via `self.video_metadata_repository.create_or_update_metadata()` with extracted duration, resolution, format. Commit `db_bg`.
                3.  **Step 2: Audio Extraction:**
                    *   Define an `output_audio_path` in the temp directory.
                    *   Use `self.ffmpeg_utils.extract_audio_sync(local_video_path, output_audio_path)`.
                4.  **Step 3: Audio Transcription:**
                    *   Use `self.ai_adapter.transcribe_audio(output_audio_path)`. This should return structured transcript data (segments with timestamps) if possible.
                    *   Save the raw transcript text to `VideoMetadataModel.transcript_text`.
                    *   Save the full transcript (text or structured JSON) as a `.txt` or `.json` file. Upload this file using `self.file_storage_service.save_file()` (e.g., in `transcripts/job_{job_id}/transcript.txt`). Store its path/URL in `VideoMetadataModel.transcript_file_url`. Commit `db_bg`.
                5.  **Step 4: Content Metadata Generation (Title, Description, Tags, Show Notes):**
                    *   Prepare a prompt for `self.ai_adapter.generate_text()`, possibly using parts of the transcript as context.
                    *   Request generation of: Title, Description, Tags (as a list), Show Notes.
                    *   Parse the AI response and update the corresponding fields in `VideoMetadataModel`. Commit `db_bg`.
                6.  **Step 5: Subtitle Generation:**
                    *   If structured transcript (with timestamps) is available from Step 3:
                        *   Generate VTT content: `vtt_content = self.subtitle_utils.generate_vtt(transcript_segments)`.
                        *   Generate SRT content: `srt_content = self.subtitle_utils.generate_srt(transcript_segments)`.
                        *   Save VTT and SRT files. Upload them via `self.file_storage_service.save_file()` (e.g., `subtitles/job_{job_id}/`).
                        *   Store their paths/URLs in `VideoMetadataModel.subtitle_files_urls` (e.g., `{"vtt": "path/url", "srt": "path/url"}`). Commit `db_bg`.
                7.  **Step 6: Thumbnail Extraction:**
                    *   Determine a suitable timestamp for thumbnail (e.g., 10% into the video, or a specific time).
                    *   Define an `output_thumbnail_path` in the temp directory (e.g., `thumbnail.jpg`).
                    *   Use `self.ffmpeg_utils.extract_frame_sync(local_video_path, timestamp_seconds, output_thumbnail_path)`.
                    *   Upload the thumbnail using `self.file_storage_service.save_file()` (e.g., `thumbnails/job_{job_id}/thumbnail.jpg`).
                    *   Store its path/URL in `VideoMetadataModel.thumbnail_file_url`. Commit `db_bg`.
                8.  Update job status to `COMPLETED` via `self.video_job_repository.update_job_status()`. Commit `db_bg`.
            *   **`except Exception as e:` block:**
                *   Log the error thoroughly (e.g., `logger.error(f"Error processing job {job_id}: {e}", exc_info=True)`).
                *   Update job status to `FAILED` with the error message `str(e)` via `self.video_job_repository.update_job_status()`. Commit `db_bg`.
            *   **`finally` block:**
                *   Clean up the temporary working directory using `self.file_utils.cleanup_temp_dir()`.
    *   **Verification/Deliverable(s):** `_execute_processing_pipeline` method implemented, performing all video processing steps, updating database records correctly, and handling errors gracefully.

*   **Task 7.4: Implement `get_job_details` Method** [ ]
    *   **Objective:** Create a service method to retrieve details of a specific processing job, ensuring ownership.
    *   **Action(s):** Implement `async def get_job_details(self, db: Session, job_id: int, uploader_user_id: str) -> Optional[VideoJobModel]`:
        1.  Fetch the `VideoJobModel` by `job_id` using `self.video_job_repository.get_video_job_by_id()`. Ensure related `video` and `metadata` are loaded (e.g., using SQLAlchemy joined loading or selectinload options in the repository query).
        2.  If the job is found, verify ownership: check if `job.video.uploader_user_id == uploader_user_id`.
        3.  If job exists and user is the owner, return the `VideoJobModel`. Otherwise, return `None` (the endpoint layer will handle 404 or 403).
    *   **Verification/Deliverable(s):** `get_job_details` method implemented, correctly fetching job details and verifying ownership.

#### **8. Supporting Services (Optional/As Needed)**

*   **Task 8.1: Implement `UserService` (Example, if needed for local profiles)** [ ]
    *   **Objective:** Manage local user profiles if they are distinct from Supabase Auth users (e.g., for additional app-specific user data).
    *   **Action(s):** If a separate `UserModel` exists locally (beyond just using Supabase user IDs):
        1.  Create `apps/core/services/user_service.py`.
        2.  Define `UserService` with methods like `async def get_or_create_user_profile(db: Session, auth_user: AuthenticatedUser) -> UserModel`. This could be called after successful authentication to ensure a local user profile linked to the Supabase `auth_user.id` exists or is created.
    *   **Note:** This is often not strictly necessary if all user-related data can be linked directly via `uploader_user_id` from the `AuthenticatedUser` object.
    *   **Verification/Deliverable(s):** `UserService` implemented if required by the application design.

---

### **Phase 4: API Layer - Endpoints and Schemas**

#### **9. Define API Schemas (`apps/core/api/schemas/`)**

*   **Task 9.1: Create Schema Files (`video_processing_schemas.py`, etc.)** [ ]
    *   **Objective:** Organize Pydantic schemas for API request/response validation and serialization.
    *   **Action(s):** Create `apps/core/api/schemas/video_processing_schemas.py`. If a `UserService` and local `UserModel` are used, also create `user_schemas.py`.
    *   **Key File(s):** `apps/core/api/schemas/video_processing_schemas.py`
    *   **Verification/Deliverable(s):** Schema files created.

*   **Task 9.2: Define `VideoUploadResponseSchema`** [ ]
    *   **Objective:** Define the response schema for the video upload endpoint.
    *   **Action(s):** In `video_processing_schemas.py`, define `VideoUploadResponseSchema(BaseModel)`:
        *   `job_id: int`
        *   `status: ProcessingStatus` (from `apps.core.models.enums`)
        *   `message: str` (e.g., "Video upload accepted, processing initiated.")
    *   **Verification/Deliverable(s):** `VideoUploadResponseSchema` defined.

*   **Task 9.3: Define `VideoSchema`** [ ]
    *   **Objective:** Define a Pydantic schema for `VideoModel` data.
    *   **Action(s):** In `video_processing_schemas.py`, define `VideoSchema(BaseModel)` mirroring fields from `VideoModel`.
        *   Include `id: int`, `uploader_user_id: str`, `original_filename: str`, `storage_path: str`, `content_type: str`, `size_bytes: int`, `created_at: datetime`, `updated_at: datetime`.
        *   Add `model_config = ConfigDict(from_attributes=True)` to enable ORM mode.
    *   **Verification/Deliverable(s):** `VideoSchema` defined.

*   **Task 9.4: Define `VideoMetadataSchema`** [ ]
    *   **Objective:** Define a Pydantic schema for `VideoMetadataModel` data.
    *   **Action(s):** In `video_processing_schemas.py`, define `VideoMetadataSchema(BaseModel)` mirroring fields from `VideoMetadataModel`.
        *   Include all relevant fields like `title`, `description`, `tags`, `transcript_text_url`, `thumbnail_url`, etc.
        *   Add `model_config = ConfigDict(from_attributes=True)`.
    *   **Verification/Deliverable(s):** `VideoMetadataSchema` defined.

*   **Task 9.5: Define `VideoJobSchema` (for Job Details Response)** [ ]
    *   **Objective:** Define a comprehensive Pydantic schema for `VideoJobModel` data, including related objects.
    *   **Action(s):** In `video_processing_schemas.py`, define `VideoJobSchema(BaseModel)`:
        *   `id: int`
        *   `status: ProcessingStatus`
        *   `processing_stages: Optional[dict] = None`
        *   `error_message: Optional[str] = None`
        *   `created_at: datetime`
        *   `updated_at: datetime`
        *   `video: Optional[VideoSchema] = None` (nested schema for related video)
        *   `metadata: Optional[VideoMetadataSchema] = None` (nested schema for related metadata)
        *   Add `model_config = ConfigDict(from_attributes=True)`.
    *   **Verification/Deliverable(s):** `VideoJobSchema` defined.

#### **10. Create API Endpoints (`apps/core/api/endpoints/video_processing_endpoints.py`)**

*   **Task 10.1: Create API Router** [ ]
    *   **Objective:** Set up an APIRouter for video processing related endpoints.
    *   **Action(s):** In `apps/core/api/endpoints/video_processing_endpoints.py`, create `router = APIRouter()`.
    *   **Key File(s):** `apps/core/api/endpoints/video_processing_endpoints.py`
    *   **Verification/Deliverable(s):** APIRouter instance created.

*   **Task 10.2: Implement `POST /upload` Endpoint** [ ]
    *   **Objective:** Create the API endpoint for uploading videos and initiating processing.
    *   **Action(s):** Define `POST /upload` endpoint on the router.
        *   `response_model=VideoUploadResponseSchema`
        *   `status_code=status.HTTP_202_ACCEPTED`
        *   **Dependencies:**
            *   `current_user: AuthenticatedUser = Depends(get_current_user)`
            *   `db: Session = Depends(get_db_session)`
            *   `background_tasks: BackgroundTasks`
            *   `video_processing_service: VideoProcessingService = Depends(get_video_processing_service_dependency)` (You'll need to create `get_video_processing_service_dependency` that initializes and returns `VideoProcessingService` with its own dependencies).
            *   `file: UploadFile = File(...)`
        *   **Logic:**
            1.  Read video content: `video_content = await file.read()`.
            2.  Call `video_processing_service.initiate_video_processing()` with `file.filename`, `video_content`, `file.content_type`, `current_user.id`, and `background_tasks`.
            3.  Return the response using `VideoUploadResponseSchema`.
    *   **Verification/Deliverable(s):** `/upload` endpoint implemented, accepting file uploads, initiating processing, and returning the correct response.

*   **Task 10.3: Implement `GET /jobs/{job_id}` Endpoint** [ ]
    *   **Objective:** Create the API endpoint to retrieve the status and details of a specific video processing job.
    *   **Action(s):** Define `GET /jobs/{job_id}` endpoint on the router.
        *   `response_model=VideoJobSchema`
        *   **Dependencies:**
            *   `job_id: int` (path parameter)
            *   `current_user: AuthenticatedUser = Depends(get_current_user)`
            *   `db: Session = Depends(get_db_session)`
            *   `video_processing_service: VideoProcessingService = Depends(get_video_processing_service_dependency)`
        *   **Logic:**
            1.  Call `video_processing_service.get_job_details(db=db, job_id=job_id, uploader_user_id=current_user.id)`.
            2.  If the job is not found or the user is not the owner, raise `HTTPException(status_code=404, detail="Job not found or not authorized")`.
            3.  Return the job details.
    *   **Verification/Deliverable(s):** `/jobs/{job_id}` endpoint implemented, returning job details for authorized users.

*   **Task 10.4: Register Video Processing Router in `apps/core/main.py`** [ ]
    *   **Objective:** Make the video processing API endpoints accessible through the main FastAPI application.
    *   **Action(s):**
        1.  In `apps/core/main.py` (your main FastAPI app file):
            *   Import the video processing router: `from apps.core.api.endpoints import video_processing_endpoints`
            *   Include the router in the FastAPI app: `app.include_router(video_processing_endpoints.router, prefix="/api/v1/videos", tags=["Video Processing"])` (Adjust prefix as per `settings.API_PREFIX`).
    *   **Key File(s):** `apps/core/main.py`
    *   **Verification/Deliverable(s):** Video processing router correctly included in the main FastAPI application, and endpoints are accessible.

---

### **Phase 5: Testing, Documentation, and Finalization**

#### **11. Testing (`apps/core/tests/`)**

*   **Task 11.1: Implement Unit Tests (`apps/core/tests/unit/`)** [ ]
    *   **Objective:** Write unit tests for individual components like models, library functions, repository methods (mocking DB interactions), and service methods (mocking repository/library dependencies).
    *   **Action(s):**
        *   Test model validations and relationships.
        *   Test utility functions with various inputs.
        *   Test repository methods by mocking `db.Session` calls (`add`, `commit`, `query`, `filter`, etc.) and asserting correct behavior.
        *   Test service layer logic by mocking calls to repositories and other external services (like AI adapters, file storage).
    *   **Key Directory:** `apps/core/tests/unit/`
    *   **Verification/Deliverable(s):** A suite of unit tests covering core logic, with good code coverage.

*   **Task 11.2: Implement Integration Tests (`apps/core/tests/integration/api/`)** [ ]
    *   **Objective:** Write integration tests for the API endpoints, interacting with a test database and (optionally) mocked external services.
    *   **Action(s):**
        1.  Use FastAPI's `TestClient`.
        2.  Set up a test database (e.g., a separate local Supabase database or an in-memory SQLite for simpler tests if ORM allows). Override the `get_db_session` dependency for tests to point to this test database.
        3.  Override the `get_current_user` dependency to return a mock `AuthenticatedUser` for testing authenticated endpoints.
        4.  Test `POST /upload` endpoint:
            *   Upload actual test video files.
            *   Verify database records (`VideoModel`, `VideoJobModel`) are created.
            *   For background tasks: either mock the `_execute_processing_pipeline` method directly to prevent it from running, or if testing the pipeline itself, check DB for processing results after a delay (can be complex and slow for automated tests, consider focused tests for pipeline stages).
        5.  Test `GET /jobs/{job_id}` endpoint:
            *   Verify correct job details are returned for authorized users.
            *   Test unauthorized access.
        6.  Configure AI and Storage services to use local/mocked backends (e.g., `LocalFileStorageService`, a mock AI adapter) for integration tests to avoid real external calls and costs.
    *   **Key Directory:** `apps/core/tests/integration/api/`
    *   **Verification/Deliverable(s):** A suite of integration tests covering API endpoint functionality, including successful paths and error conditions.

#### **12. Documentation and Cleanup**

*   **Task 12.1: Update `apps/core/README.md`** [ ]
    *   **Objective:** Provide clear documentation for setting up and running the `apps/core` service.
    *   **Action(s):** Update or create `apps/core/README.md` with:
        *   Instructions for local setup (Python environment, dependencies, Supabase CLI, `.env` configuration).
        *   Overview of API endpoints (brief description, path, method).
        *   Environment variables required.
        *   How to run the application and tests.
    *   **Key File(s):** `apps/core/README.md`
    *   **Verification/Deliverable(s):** Comprehensive README for the `apps/core` application.

*   **Task 12.2: Add Python Docstrings** [ ]
    *   **Objective:** Improve code maintainability and understanding with comprehensive docstrings.
    *   **Action(s):** Add Python docstrings to all modules, classes, methods, and functions, explaining their purpose, arguments, and return values (where applicable). Follow a consistent docstring format (e.g., Google style, reStructuredText).
    *   **Verification/Deliverable(s):** Codebase is well-documented with docstrings.

*   **Task 12.3: Securely Remove Old `video_processor` Directory (LATER STAGE)** [ ]
    *   **Objective:** Clean up the old, now-refactored video processing code.
    *   **Action(s):** **After thorough verification and confirmation that the new `apps/core` system is fully functional and stable**, securely remove the old `apps/core/video_processor` directory (or its original location).
    *   **Caution:** This step should only be done once the new implementation is proven reliable. Consider version controlling the removal.
    *   **Verification/Deliverable(s):** Old `video_processor` code removed from the codebase.

*   **Task 12.4: Update This Project Plan Document (`.ai_docs/progress.md` or similar)** [ ]
    *   **Objective:** Maintain an accurate record of project progress.
    *   **Action(s):** As tasks are completed, update their status markers (e.g., `[ ]` to `[x]`) in this document (or its source file). Add notes or observations if necessary.
    *   **Verification/Deliverable(s):** This project plan document accurately reflects the current status of the refactoring project.

---

**Conclusion (Exemplar):** Upon completion of all phases and tasks outlined in this exemplar plan, the video processing functionality would be successfully refactored into the `apps/core` architecture, leveraging modern practices, Supabase integration, and a robust testing suite.

---
