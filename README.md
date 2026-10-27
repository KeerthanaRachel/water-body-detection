# AquaSat AI — Water-Body Detection from Satellite Images Using Deep Learning

AquaSat AI is an end-to-end, production-grade, full-stack remote sensing web platform designed for automated semantic segmentation and quantification of surface water bodies from multi-spectral and optical satellite tiles.

Powered by a lightweight **Convolutional U-Net neural network** implemented in **TensorFlow/Keras**, the platform accepts RGB satellite tiles, standardizes them into normalized $128 \times 128 \times 3$ tensors, computes pixel-wise water probabilities via a sigmoid activation layer, and applies a strict mathematical decision threshold ($\tau = 0.5$) to generate binary water masks and compute exact surface coverage percentages.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite SPA                  │
│       Tailwind CSS • Split Image Slider • Lucide       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / HTTPS (REST API)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Python FastAPI Backend                   │
│   HTTP-only Session Cookies • Pydantic v2 Validation   │
├───────────────────────────┬────────────────────────────┤
│      Database Layer       │   Inference Engine (ML)    │
│  PostgreSQL / SQLite Dual │    Small U-Net (TensorFlow)│
│  SQLAlchemy 2.0 ORM       │    Binary Threshold tau=0.5│
└───────────────────────────┴────────────────────────────┘
```

---

## Technology Stack

- **Frontend**: React 18 with Vite, React Router v6, Tailwind CSS, Lucide React icons.
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Python-Multipart.
- **Deep Learning**: TensorFlow 2.21, Keras 3.15, NumPy, Pillow, Scikit-learn.
- **Database & ORM**: PostgreSQL (production), SQLite (zero-config local dev), SQLAlchemy 2.1.
- **Authentication**: Secure session-based authentication using HTTP-only cookies (`SameSite=Lax`, `Secure` in prod) with Bcrypt password hashing.
- **Containerization & Deployment**: Multi-stage `Dockerfile`, `docker-compose.yml`, `render.yaml`.
- **Training Pipeline**: Google Colab GPU-accelerated notebook (`notebooks/Water_Body_Segmentation_UNet_Colab.ipynb`) and local training script (`backend/train_model.py`).

---

## Machine Learning Specifications (Small U-Net)

1. **Input Representation**:
   - Accepts 3-channel optical RGB satellite tiles.
   - Bilinear interpolation resampling to standardized $128 \times 128 \times 3$ resolution.
   - Dynamic pixel normalization: $x_{\text{norm}} = \frac{x}{255.0} \in [0.0, 1.0]$.

2. **Network Topology**:
   - **Contracting Path (Encoder)**: 3 convolutional stages (32, 64, 128 filters with $3 \times 3$ kernels and ReLU activation) paired with $2 \times 2$ Max Pooling.
   - **Bottleneck**: Deep contextual extraction layer with 256 filters.
   - **Expansive Path (Decoder)**: 3 transposed convolutional upsampling stages ($2 \times 2$ stride 2) concatenated with skip-connections from matching encoder feature maps to preserve high-resolution spatial shoreline edges.
   - **Output Projection**: $1 \times 1$ convolution with **Sigmoid** activation producing a single-channel continuous probability map: $\hat{y} \in [0.0, 1.0]^{128 \times 128 \times 1}$.

3. **Binary Thresholding & Quantification**:
   - Decision threshold: $\tau = 0.5$.
   - Binary mask: $\text{Mask}(i, j) = 255 \text{ if } \hat{y}(i, j) \ge 0.5 \text{ else } 0$.
   - Water Coverage Percentage:
     $$\text{Coverage \%} = \left( \frac{\sum_{i=1}^{128}\sum_{j=1}^{128} \mathbb{I}(\hat{y}(i, j) \ge 0.5)}{128 \times 128} \right) \times 100\%$$
   - *Note on Geospatial Accuracy*: Ground-area measurements (e.g. $\text{km}^2$) and geographic coordinates are not fabricated when the input raster image lacks embedded GeoTIFF metadata or spatial resolution headers (Ground Sample Distance).

---

## User Interface Pages

1. **Landing Page (`/`)**: Project background, remote sensing overview, Small U-Net architecture breakdown, interactive workflow diagram, authentication launch points.
2. **Registration Page (`/register`)**: Client-side format validation, password confirmation, duplicate email detection, server-side bcrypt hashing.
3. **Login Page (`/login`)**: Secure authentication, credential verification, HTTP-only cookie assignment, one-click demo account auto-filler.
4. **Dashboard (`/dashboard`)**: Aggregated metrics (total predictions, average water coverage, last analysis timestamp), recent analyses list, quick-action navigation.
5. **Analyze Satellite Image (`/analyze`)**: Drag-and-drop dropzone, client & server file type validation (PNG, JPEG, WebP) and size limits (20MB), real-time resolution preview, sample satellite image loader, multi-stage progress telemetry.
6. **Prediction Results (`/results/:id`)**: Original satellite RGB display, U-Net predicted binary mask, cyan alpha-composite overlay, interactive split slider comparison, verified water coverage percentage, inference latency, mask download.
7. **Prediction History (`/history`)**: Chronological grid of user's past predictions with dual thumbnails (RGB and Mask), real-time search filtering, detail navigation, secure deletion modal with ownership enforcement.
8. **Profile & Settings (`/profile`)**: Account details, name & email modification, secure password change with current password validation, secure session logout.
9. **Not-Found Page (`*`)**: Responsive 404 handler with radar compass animation and clean recovery navigation.

---

## API Endpoints Reference

All API routes are prefixed under `/api` and interactively documented at `/docs` (Swagger UI):

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new account and set session cookie | No |
| `POST` | `/api/auth/login` | Authenticate and issue HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Invalidate session and clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information or change password | Yes |
| `GET` | `/api/dashboard` | Fetch user prediction telemetry & metrics | Yes |
| `POST` | `/api/predictions` | Upload image and execute U-Net inference | Yes |
| `GET` | `/api/predictions` | Paginated list of user's historical runs | Yes |
| `GET` | `/api/predictions/{id}` | Retrieve specific prediction metadata | Yes (Owner) |
| `DELETE`| `/api/predictions/{id}` | Delete prediction and associated image files | Yes (Owner) |
| `GET` | `/api/predictions/{id}/mask` | Download binary water mask as PNG | Yes (Owner) |
| `GET` | `/api/health` | System readiness, uptime, and model status | No |

---

## Local Development Setup

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ and npm
- Git

### 1. Clone & Set Up Repository
```bash
git clone https://github.com/your-username/water-body-detection.git
cd water-body-detection
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Verify model weights checkpoint:
```bash
# Checkpoint exists at backend/model_weights/unet_water_128.keras
# If training from scratch or fine-tuning, run:
python train_model.py
```

Run backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will be live at: `http://localhost:5173`

### 4. Build for Production
To build the optimized production SPA:
```bash
cd frontend
npm run build
```
Once `frontend/dist` is generated, the FastAPI backend will automatically serve both the SPA frontend and the REST API from port `8000`.

---

## Docker & Docker Compose Deployment

Run the complete multi-container stack (FastAPI web server + PostgreSQL database):

```bash
docker compose up --build -d
```

- Web Application: `http://localhost:8000`
- API Health Check: `http://localhost:8000/api/health`
- Database: PostgreSQL on port `5432`

To stop the containers:
```bash
docker compose down
```

---

## Automated Test Suite

Run the automated test suite using `pytest`:

```bash
cd backend
python -m pytest -v
```

The test suite validates:
1. Health check & U-Net model readiness.
2. User registration, duplicate email rejection, and HTTP-only session cookie issuance.
3. Login authentication and invalid credential rejection.
4. Protected endpoint access control (unauthenticated requests return 401).
5. User data isolation (User B is forbidden from reading or deleting User A's analyses with 403 Forbidden).
6. File format validation (non-image uploads rejected with 400 Bad Request).
7. U-Net inference execution, $128 \times 128$ tensor resizing, [0, 1] normalization, binary mask generation, and water percentage quantification.
8. Deletion authorization and database persistence verification.

---

## Pre-Seeded Demonstration Account

The backend automatically initializes a demonstration account upon first startup:
- **Email**: `demo@satellite-lab.org`
- **Password**: `DemoPassword123!`
- Or create your own account instantly on the `/register` page.

---

## License

Academic and research use under the MIT License.
