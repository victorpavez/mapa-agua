// Este script se encargará de calcular la cañería desde un lote hasta la red de agua
// y registrar los metros, el costo y los lotes por los que pasa

// Supone que las variables: geojsonLayer, nodosAgua, nodosMedios, nodosVertices ya están cargadas

let rutaSeleccionada = null;
let rutaLayer = null;

function iniciarConexionCaneriaDesdeLote(feature) {
  if (rutaLayer) rutaLayer.remove();
  const puntoLote = obtenerCentroide(feature.geometry);
  const nodoInicio = nodoMasCercano(puntoLote, nodosMedios);
  const nodoFinal = nodoMasCercano(nodoInicio, nodosAgua);
  const ruta = calcularRuta(nodoInicio, nodoFinal);
  if (!ruta.length) return alert("No se pudo trazar una ruta hasta la cañería.");

  rutaSeleccionada = ruta;

  // Dibujar ruta
  rutaLayer = L.polyline(ruta, { color: 'blue', weight: 4 }).addTo(map);

  // Calcular distancia y lotes impactados
  const metros = calcularLongitudRuta(ruta);
  const costo = calcularCosto(metros);
  const lotesCercanos = calcularLotesCercanosARuta(ruta);

  mostrarResumenRuta(metros, costo, lotesCercanos);
}

function obtenerCentroide(geom) {
  const coords = geom.coordinates[0];
  let x = 0, y = 0;
  coords.forEach(c => { x += c[0]; y += c[1]; });
  return [x / coords.length, y / coords.length];
}

function nodoMasCercano(punto, capaGeojson) {
  let minDist = Infinity;
  let masCercano = null;
  capaGeojson.features.forEach(f => {
    const [x, y] = f.geometry.coordinates;
    const d = Math.sqrt((x - punto[0])**2 + (y - punto[1])**2);
    if (d < minDist) {
      minDist = d;
      masCercano = f;
    }
  });
  return masCercano.geometry.coordinates;
}

function calcularRuta(inicio, fin) {
  // Lógica de camino más corto según nodos (a implementar con Dijkstra u otra)
  return [inicio, fin]; // Solo ejemplo simple
}

function calcularLongitudRuta(ruta) {
  let total = 0;
  for (let i = 1; i < ruta.length; i++) {
    const dx = ruta[i][0] - ruta[i - 1][0];
    const dy = ruta[i][1] - ruta[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total * 111000; // aprox. grados a metros
}

function calcularCosto(metros) {
  return Math.round(metros * 3200); // Ejemplo: $3200 por metro
}

function calcularLotesCercanosARuta(ruta) {
  const lotes = [];
  geojsonOriginal.features.forEach(f => {
    const centroide = obtenerCentroide(f.geometry);
    ruta.forEach(p => {
      const d = Math.sqrt((p[0] - centroide[0])**2 + (p[1] - centroide[1])**2);
      if (d < 0.0003) lotes.push(f.properties.id_lote);
    });
  });
  return [...new Set(lotes)].filter(x => x != null);
}

function mostrarResumenRuta(metros, costo, lotes) {
  alert(`✅ Ruta generada:\n
Metros: ${metros.toFixed(1)} m\nCosto estimado: $${costo.toLocaleString()}\nLotes conectados: ${lotes.length}`);
}
