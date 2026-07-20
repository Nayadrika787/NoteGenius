import os
import uuid
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_service import process_video, get_task_status, get_download_path
from fastapi.responses import FileResponse

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    url: str

@app.post("/api/summarize")
async def summarize(request: VideoRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    background_tasks.add_task(process_video, request.url, task_id)
    return {"task_id": task_id, "status": "processing"}

@app.get("/api/status/{task_id}")
async def status(task_id: str):
    return get_task_status(task_id)


@app.get("/api/download/{task_id}")
async def download(task_id: str):
    path = get_download_path(task_id)
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not ready or found")
    return FileResponse(path, filename=os.path.basename(path))

from fastapi.staticfiles import StaticFiles
# Serve the frontend statically from the 'dist' folder
if os.path.isdir("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")
