// Variables globales
let map = L.map("map", { zoomControl: false }).setView([-37.403, -68.931], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 20,
}).addTo(map);

let geojsonOriginal, geojsonLayer, capaAgua, rutaLayer;
let nodosAgua = [], nodosMedios = [], nodosVertices = [];
let loteSeleccionado = null;

// Función para cargar y mostrar nodos en el mapa
function cargarYMostrarNodos(url, grupo, color) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const nodos = data.features.map(f => f.geometry.coordinates);
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 5,
            fillColor: color,
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        }
      }).addTo(map);
      switch (grupo) {
        case 'agua':
          nodosAgua = nodos;
          break;
        case 'medios':
          nodosMedios = nodos;
          break;
        case 'vertices':
          nodosVertices = nodos;
          break;
      }
    })
    .catch(err => console.error(`Error cargando nodos desde ${url}:`, err));
}

// Cargar y mostrar los nodos en el mapa
cargarYMostrarNodos("NODOSAGUA.geojson", 'agua', 'blue');
cargarYMostrarNodos("NODOSMEDIOS.geojson", 'medios', 'green');
cargarYMostrarNodos("NODOSVERTICES.geojson", 'vertices', 'red');

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

::contentReference[oaicite:10]{index=10}
 
