let geojsonOriginal, geojsonLayer, capaAgua, rutaLayer;
let nodosMedio = [], nodosAgua = [], nodosVertices = [];

// Carga nodos desde archivos GeoJSON
async function cargarGeojson(nombre) {
  const res = await fetch(nombre);
  const data = await res.json();
  return data.features.map(f => ({
    id: f.properties.id,
    coords: f.geometry.coordinates
  }));
}

// Cargar todos los nodos
Promise.all([
  cargarGeojson("NODOSMEDIOS.geojson"),
  cargarGeojson("NODOSAGUA.geojson"),
  cargarGeojson("NODOSVERTICES.geojson")
])
  .then(([medio, agua, vertices]) => {
    nodosMedio = medio;
    nodosAgua = agua;
    nodosVertices = vertices;
    console.log("✅ Nodos cargados correctamente");
    console.log("Nodos Agua:", nodosAgua.length);
    console.log("Nodos Medios:", nodosMedio.length);
    console.log("Nodos Vértices:", nodosVertices.length);
  })
  .catch(err => console.error("❌ Error al cargar nodos:", err));

// Distancia euclidiana
function distancia(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

// Encontrar nodo más cercano a un punto
function nodoMasCercano(nodos, punto) {
  if (!nodos.length) return null;
  return nodos.reduce((min, nodo) =>
    distancia(nodo.coords, [punto.lng, punto.lat]) < distancia(min.coords, [punto.lng, punto.lat]) ? nodo : min
  );
}

// Mostrar la ruta desde un lote a la red de agua
function mostrarRutaDesde(origen) {
  if (!nodosMedio.length || !nodosAgua.length || !nodosVertices.length) {
    alert("⚠️ Nodos no cargados todavía.");
    return;
  }

  if (rutaLayer) rutaLayer.remove();

  const start = nodoMasCercano(nodosMedio, origen);
  const end = nodoMasCercano(nodosAgua, origen);
  if (!start || !end) {
    alert("❌ No se pudo determinar el nodo más cercano.");
    return;
  }

  const pasos = [start.coords];
  let actual = start;

  // Bucle simple (mejorable con A*)
  for (let i = 0; i < 10; i++) {
    const next = nodoMasCercano(nodosVertices, {
      lat: actual.coords[1],
      lng: actual.coords[0]
    });
    if (!next) break;
    pasos.push(next.coords);
    if (distancia(next.coords, end.coords) < 0.0005) break;
    actual = next;
  }
  pasos.push(end.coords);

  let i = 1;
  rutaLayer = L.polyline([pasos[0]], { color: "blue", weight: 4 }).addTo(map);
  const interval = setInterval(() => {
    if (i >= pasos.length) return clearInterval(interval);
    rutaLayer.addLatLng([pasos[i][1], pasos[i][0]]);
    i++;
  }, 300);
}
