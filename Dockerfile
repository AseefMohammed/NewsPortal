FROM python:3.11-slim

WORKDIR /backend

COPY backend/requirements_ai.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
