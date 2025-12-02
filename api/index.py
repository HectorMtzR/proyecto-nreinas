from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import copy

app = FastAPI()

# Configuración CORS para que el Frontend local (puerto 5173) pueda hablar con el Backend (puerto 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción puedes restringirlo a tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class solurRequest(BaseModel):
    n: int

# Algoritmo de Backtracking Visual
def sol_nreinas(n: int):
    tablero = [[0 for _ in range(n)] for _ in range(n)]
    steps = [] # La "película" de la ejecución
    
    def snapshot():
        steps.append(copy.deepcopy(tablero))

    def seguro(row, col):
        # Izquierda
        for i in range(col):
            if tablero[row][i] == 1: return False
        # Diagonal superior izq
        for i, j in zip(range(row, -1, -1), range(col, -1, -1)):
            if tablero[i][j] == 1: return False
        # Diagonal inferior izq
        for i, j in zip(range(row, n, 1), range(col, -1, -1)):
            if tablero[i][j] == 1: return False
        return True

    def solu(col):
        if col >= n: return True

        for i in range(n):
            if seguro(i, col):
                tablero[i][col] = 1 # Poner reina
                snapshot()
                
                if solu(col + 1): return True
                
                tablero[i][col] = 0 # Backtracking (Quitar reina)
                snapshot()

        return False

    solu(0)
    # Agregamos un paso final vacío si no hubo solución o para estabilidad
    return {"steps": steps, "solud": len(steps) > 0}

@app.post("/api/solu")
def solu_endpoint(request: solurRequest):
    if request.n < 4 or request.n > 12:
        raise HTTPException(status_code=400, detail="N debe estar entre 4 y 12")
    return sol_nreinas(request.n)