from fastapi import APIRouter
from app.api.v1.endpoints import (
    papers,
    experiments,
    comparisons,
    root_causes,
    graph,
    reports,
    jobs,
    auth,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(papers.router, prefix="/papers", tags=["Papers"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["Experiments"])
api_router.include_router(comparisons.router, prefix="/comparisons", tags=["Comparisons"])
api_router.include_router(root_causes.router, prefix="/root-causes", tags=["Root-Cause Analysis"])
api_router.include_router(graph.router, prefix="/graph", tags=["Dependency Graph"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Operational Jobs"])
