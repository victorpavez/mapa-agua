// Variables globales
let map = L.map("map", { zoomControl: false }).setView([-37.403, -68.931], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 20,
}).addTo(map);

let geojsonOriginal, geojsonLayer, capaAgua, rutaLayer;
let nodosAgua = [], nodosMedios = [], nodosVertices = [];
let loteSeleccionado = null;

// Cargar nodos desde GeoJSON
Promise.all([
  fetch("NODOSAGUA.geojson").then(res => res.json()),
  fetch("NODOSMEDIOS.geojson").then(res => res.json()),
  fetch("NODOSVERTICES.geojson").then(res => res.json()),
]).then(([agua, medios, vertices]) => {
  nodosAgua = agua.features.map(f => f.geometry.coordinates);
  nodosMedios = medios.features.map(f => f.geometry.coordinates);
  nodosVertices = vertices.features.map(f => f.geometry.coordinates);
}).catch(err => console.error("Error cargando nodos:", err));

// Cargar y mostrar los lotes desde el GeoJSON
fetch("AGUSIONO.geojson")
  .then(res => res.json())
  .then(data => {
    geojsonOriginal = data;
    actualizarMapa();
  })
  .catch(err => console.error("Error cargando GeoJSON:", err));

// Función para actualizar el mapa según los filtros y opciones seleccionadas
function actualizarMapa() {
  if (!geojsonOriginal) return;
  if (geojsonLayer) geojsonLayer.remove();

  const distancia = "agua_40m";
  const mostrarSinID = document.getElementById("mostrarSinID").checked;
  const filtro = document.getElementById("filter").value;

  let total = 0, conAgua = 0, sinAgua = 0, sinID = 0, sinAguaSinID = 0, conAguaSinID = 0;

  geojsonLayer = L.geoJSON(geojsonOriginal, {
    filter: f => {
      if (filtro === "agua") return f.properties[distancia] === "SI";
      if (filtro === "sinagua") return f.properties[distancia] === "NO";
      return true;
    },
    style: feature => {
      const props = feature.properties;
      const tieneID = props.id_lote !== null && props.id_lote !== undefined;
      const agua = props[distancia] === "SI";

      total++;
      if (!tieneID) sinID++;
      if (agua) {
        conAgua++;
        if (!tieneID) conAguaSinID++;
      } else {
        sinAgua++;
        if (!tieneID) sinAguaSinID++;
      }

      const color = !tieneID && mostrarSinID ? "gray" : agua ? "green" : "red";
      return { color, weight: 1, fillOpacity: 0.5 };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.bindPopup(`
        🆔 <b>ID:</b> ${p.id_lote ?? "(sin ID)"}<br>
        🏷️ <b>Número:</b> ${p.numero_lote ?? "-"}<br>
        🏡 <b>Manzana:</b> ${p.id_manzana ?? "-"}<br>
        💧 <b>Agua 40m:</b> ${p.agua_40m ?? "-"}
      `);
      layer.on('click', () => seleccionarLote(layer, feature));
    }
  }).addTo(map);

  const porcentaje = total > 0 ? ((conAgua / total) * 100).toFixed(1) : 0;
  const porcentajeSin = total > 0 ? (100 - porcentaje).toFixed(1) : 0;

  document.getElementById("totalLotes").textContent = total;
  document.getElementById("conAgua").textContent = `${conAgua} (${porcentaje}%)`;
  document.getElementById("sinAgua").textContent = `${sinAgua} (${porcentajeSin}%)`;
  document.getElementById("sinID").textContent = sinID;
  document.getElementById("sinAguaSinID").textContent = sinAguaSinID;
  document.getElementById("conAguaSinID").textContent = conAguaSinID;
}

// Función para seleccionar un lote y mostrar el panel de cañería
function seleccionarLote(layer, feature) {
  if (loteSeleccionado) {
    geojsonLayer.resetStyle(loteSeleccionado);
  }
  loteSeleccionado = layer;
  layer.setStyle({ weight: 3, color: 'blue' });

  document.getElementById("caneriaPanel").style.display = 'block';
}

// Función para generar la cañería desde el lote seleccionado
function generarCaneria() {
  if (!loteSeleccionado) return;

  const centroLote = loteSeleccionado.getBounds().getCenter();
  const nodoMedioCercano = encontrarNodoMasCercano(centroLote, nodosMedios);
  const verticeCercano = encontrarNodoMasCercano(nodoMedioCercano, nodosVertices);
  const nodoAguaCercano = encontrarNodoMasCercano(verticeCercano, nodosAgua);

  const ruta = [centroLote, nodoMedioCercano, verticeCercano, nodoAguaCercano];
  dibujarRuta(ruta);
}

// Función para encontrar el nodo más cercano a una coordenada dada
function encontrarNodoMasCercano(coordenada, nodos) {
  let distanciaMinima = Infinity;
  let nodoMasCercano = null;
  nodos.forEach(nodo => {
    const distancia = map.distance(coordenada, L.latLng(nodo[1], nodo[0]));
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia;
      nodoMasCercano = L.latLng(nodo[1], nodo[0]);
    }
  });
  return nodoMasCercano;
}

// Función para dibujar la ruta de la cañería en el mapa
function dibujarRuta(ruta) {
  if (rutaLayer) {
    rutaLayer.remove();
  }
  rutaLayer = L.polyline(ruta, { color: 'blue', weight: 3 }).addTo(map);
  const distanciaTotal = calcularDistancia(ruta);
  const costoTotal = distanciaTotal * 1000; // Costo estimado por metro
  document.getElementById("distanciaTotal").textContent = distanciaTotal
::contentReference[oaicite:0]{index=0}
 
