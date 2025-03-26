document.getElementById("btnCaneria").addEventListener("click", () => {
  if (!loteSeleccionado) {
    alert("Seleccioná un lote primero.");
    return;
  }

  const puntoLote = loteSeleccionado.getBounds().getCenter();
  const puntoXY = [puntoLote.lng, puntoLote.lat];

  // Función auxiliar para medir distancia
  const distancia = (a, b) =>
    Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);

  // Busca el nodo más cercano a un punto
  const nodoMasCercano = (nodos, punto) =>
    nodos.reduce((min, n) =>
      distancia(n.coords, punto) < distancia(min.coords, punto) ? n : min
    );

  const start = nodoMasCercano(nodosMedio, puntoXY);
  const end = nodoMasCercano(nodosAgua, puntoXY);

  // Trazar camino usando nodos vértices (simulado con búsqueda simple)
  let pasos = [start.coords];
  let actual = start;
  let intentos = 0;

  while (distancia(actual.coords, end.coords) > 0.0004 && intentos < 30) {
    const siguiente = nodoMasCercano(nodosVertices, actual.coords);
    if (distancia(actual.coords, siguiente.coords) < 0.00005) break; // Evitar bucle
    pasos.push(siguiente.coords);
    actual = siguiente;
    intentos++;
  }

  pasos.push(end.coords);

  // Dibujar la línea de cañería
  if (rutaLayer) map.removeLayer(rutaLayer);
  rutaLayer = L.polyline([], { color: "blue", weight: 4 }).addTo(map);

  let i = 0;
  const interval = setInterval(() => {
    if (i >= pasos.length) {
      clearInterval(interval);
      calcularCostoYPintar(pasos);
      return;
    }
    rutaLayer.addLatLng([pasos[i][1], pasos[i][0]]);
    i++;
  }, 200);
});

// Calcula metros y costo estimado
function calcularCostoYPintar(pasos) {
  let total = 0;
  for (let i = 0; i < pasos.length - 1; i++) {
    total += turf.distance(
      turf.point(pasos[i]),
      turf.point(pasos[i + 1]),
      { units: "kilometers" }
    );
  }

  const metros = (total * 1000).toFixed(1);
  const costo = (metros * 1800).toLocaleString("es-AR");

  document.getElementById("distanciaTotal").textContent = metros;
  document.getElementById("costoTotal").textContent = costo;
}
