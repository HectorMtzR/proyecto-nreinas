import React, { useState, useEffect } from 'react';
import './NQueens.css';

const App = () => {
  const [n, setN] = useState(4);
  const [history, setHistory] = useState([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Llamada al Backend
  const handleSolve = async () => {

    if (!n || n < 4 || n > 12) {
      alert("⚠️ Por favor ingresa un número entre 4 y 12. \nValores muy grandes pueden trabar el navegador.");
      return; // Detiene la ejecución aquí. No llama al backend.
    }

    setLoading(true);
    setIsPlaying(false);
    setHistory([]);
    try {
      // En local, el proxy de Vite redirige esto a http://127.0.0.1:8000/api/solve
      // En Vercel, va directo a la Serverless Function
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: parseInt(n) })
      });
      const data = await res.json();
      
      if(data.steps && data.steps.length > 0){
        setHistory(data.steps);
        setCurrentStep(0);
      } else {
        alert("Error al resolver o no hay solución");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el Backend");
    }
    setLoading(false);
  };

  // Auto-play
  useEffect(() => {
    let interval;
    if (isPlaying && history.length > 0 && currentStep < history.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300); // Velocidad de animación (ms)
    } else if (currentStep >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, history]);

  const currentBoard = history.length > 0 ? history[currentStep] : null;

  return (
    <div className="game-container">
      <h1 style={{ color: '#4d3525', marginBottom: '1rem' }}>
        Algoritmo N-Reinas
      </h1>

      <div className="controls-panel">
        <div>
            <label style={{ marginRight: '10px' }}>Tablero (N):</label>
            <input 
              className="input-n" type="number" value={n} 
              onChange={(e) => setN(Number(e.target.value))} 
              
              onBlur={() => {
                // VALIDACIÓN AL SALIR DEL INPUT (Opcional pero recomendada)
                // Si el usuario deja el input y el numero es inválido, lo corregimos automáticamente
                if (n !== "" && n < 4) setN(4);
                if (n > 12) setN(12);
                }}
              
              min="4" max="12" 
            />
        </div>
        <button className="btn btn-primary" onClick={handleSolve} disabled={loading}>
          {loading ? 'Calculando...' : 'Resolver'}
        </button>

        <div style={{ width: '1px', height: '20px', background: '#ddd', margin: '0 10px'}}></div>

        <button className="btn btn-secondary" onClick={() => {setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1))}}>
          ⏪
        </button>
        <button className="btn btn-success" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn btn-secondary" onClick={() => {setIsPlaying(false); setCurrentStep(Math.min(history.length - 1, currentStep + 1))}}>
          ⏩
        </button>
      </div>

      <div className="board-container">
        {currentBoard ? (
          <div className="board-grid"
            style={{ 
              gridTemplateColumns: `repeat(${n}, 1fr)`,
              gridTemplateRows: `repeat(${n}, 1fr)` 
            }}>
            {currentBoard.map((row, rIndex) =>
              row.map((cell, cIndex) => {
                const isDark = (rIndex + cIndex) % 2 === 1;
                return (
                  <div key={`${rIndex}-${cIndex}`} className={`cell ${isDark ? 'dark' : 'light'}`}>
                    {cell === 1 && <span className="queen">♛</span>}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            Listo para iniciar
          </div>
        )}
      </div>

      <div className="status-bar">
        Paso: {currentStep + 1} / {history.length || 0}
      </div>
    </div>
  );
};

export default App;