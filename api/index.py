from fastapi import FastAPI as ServidorAPI, HTTPException as ErrorHTTP
from fastapi.middleware.cors import CORSMiddleware as GestorCORS
from pydantic import BaseModel as ModeloBase
from typing import List, Optional
import copy

app = ServidorAPI()

origenes_permitidos = ["*"]

app.add_middleware(
    GestorCORS,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PeticionReinas(ModeloBase):
    n: int

def procesar_n_reinas(dim: int):
    grilla = []
    for _ in range(dim):
        fila_vacia = [0] * dim
        grilla.append(fila_vacia)
        
    historial = [] 

    def capturar_estado():
        estado_actual = copy.deepcopy(grilla)
        historial.append(estado_actual)

    def es_posicion_segura(f, c):
        for k in range(c):
            if grilla[f][k] == 1:
                return False
        
        offset = 1
        while f - offset >= 0 and c - offset >= 0:
            if grilla[f - offset][c - offset] == 1:
                return False
            offset += 1
            
        offset = 1
        while f + offset < dim and c - offset >= 0:
            if grilla[f + offset][c - offset] == 1:
                return False
            offset += 1
            
        return True

    def buscar_camino(col_idx):
        if col_idx >= dim:
            return True

        for fila_idx in range(dim):
            if es_posicion_segura(fila_idx, col_idx):
                
                grilla[fila_idx][col_idx] = 1
                capturar_estado() 

                exito = buscar_camino(col_idx + 1)
                if exito:
                    return True

                grilla[fila_idx][col_idx] = 0
                capturar_estado()

        return False

    # Ejecutar
    buscar_camino(0)
    
    # Respuesta
    hubo_solucion = len(historial) > 0
    return {
        "steps": historial, 
        "solud": hubo_solucion
    }

# Endpoint con nombres cambiados
@app.post("/api/solve")
def ejecutar_solver(datos: PeticionReinas):
    # Validación movida a una variable para cambiar la estructura visual
    es_tamano_invalido = datos.n < 4 or datos.n > 12
    
    if es_tamano_invalido:
        raise ErrorHTTP(status_code=400, detail="El valor de N debe estar entre 4 y 12")
        
    return procesar_n_reinas(datos.n)