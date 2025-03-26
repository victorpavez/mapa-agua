<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Mapa de Lotes Interactivo</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; font-family: 'Segoe UI', sans-serif; }
    #map { width: 100%; height: 100vh; }
    .leaflet-control-zoom { display: none !important; }
    .panel {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      background: white;
      padding: 20px;
      width: 280px;
      box-shadow: 2px 0 8px rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .panel select, .panel input {
      padding: 8px;
      margin: 10px 0;
      font-size: 14px;
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 10px 0;
    }
    .checkbox-inline {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .counter {
      font-size: 14px;
      line-height: 1.6;
    }
    .bottom-stats {
      margin-top: 10px;
      font-weight: bold;
      padding-top: 10px;
      border-top: 1px solid #ccc;
    }
    .dot {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 4px;
      border: 1px solid #333;
      margin-right: 6px;
    }
    .dot.red { background-color: #e74c3c; }
    .dot.green { background-color: #2ecc71; }
  </style>
</head>
<body>
  <div class="panel">
    <div>
      <input type="number" id="search" placeholder="Buscar lote por ID" />

      <label>💧 Mostrar agua según:</label>
      <select id="filter">
        <option value="todos">Todos</option>
        <option value="agua">Con agua</option>
        <option value="sinagua">Sin agua</option>
      </select>

      <div class="checkbox-group">
        <label class="checkbox-inline">
          <input type="checkbox" id="mostrarSinID" checked />
          Mostrar lotes sin ID en gris
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" id="mostrarCapaAgua" checked />
          Mostrar cañería de agua
        </label>
      </div>

      <div class="counter">
        <strong>Total lotes:</strong> <span id="totalLotes">0</span><br>
        <strong>Con agua:</strong> <span id="conAgua">0 (0%)</span><br>
        <strong>Sin agua:</strong> <span id="sinAgua">0 (0%)</span><br>
        <strong>Sin ID:</strong> <span id="sinID">0</span>
      </div>
    </div>

    <div class="bottom-stats">
      <div><span class="dot red"></span> Sin agua y sin ID: <span id="sinAguaSinID">0</span></div>
      <div><span class="dot green"></span> Con agua y sin ID: <span id="conAguaSinID">0</span></div>
    </div>
  </div>

  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="calculo_caneria_lote.js"></script>
</body>
</html>
