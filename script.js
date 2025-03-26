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
  console.log("✅ Nodos cargados correctamente");
}).catch(err => console.error("❌ Error cargando nodos:", err));

// Cargar lotes
fetch("AGUSIONO.geojson")
  .then(res => res.json())
  .then(data => {
    geojsonOriginal = data;
    actualizarMapa();
  });

// Funciones de apoyo
function distancia(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function nodoMasCercano(lista, punto) {
  return lista.reduce((min, n) => distancia(n, punto) < distancia(min, punto) ? n : min);
}

// Actualizar mapa con lotes
function actualizarMapa() {
  if (geojsonLayer) geojsonLayer.remove();

  const distanciaClave = "agua_40m";
  const mostrarSinID = document.getElementById("mostrarSinID").checked;
  const filtro = document.getElementById("filter").value;

  let total = 0, conAgua = 0, sinAgua = 0, sinID = 0, sinAguaSinID = 0, conAguaSinID = 0;

  geojsonLayer = L.geoJSON(geojsonOriginal, {
    filter: f => {
      if (filtro === "agua") return f.properties[distanciaClave] === "SI";
      if (filtro === "sinagua") return f.properties[distanciaClave] === "NO";
      return true;
    },
    style: feature => {
      const props = feature.properties;
      const tieneID = props.id_lote !== null && props.id_lote !== undefined;
      const agua = props[distanciaClave] === "SI";

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
      const props = feature.properties;
      layer.bindPopup(`
        🆔 <b>ID:</b> ${props.id_lote ?? "(sin ID)"}<br>
        🏷️ <b>Número:</b> ${props.numero_lote ?? "-"}<br>
        🏡 <b>Manzana:</b> ${props.id_manzana ?? "-"}<br>
        💧 <b>Agua 40m:</b> ${props.agua_40m ?? "-"}
      `);

      layer.on("click", () => {
        loteSeleccionado = layer.getBounds().getCenter();
        document.getElementById("caneriaPanel").style.display = "block";
      });
    }
  }).addTo(map);

  document.getElementById("totalLotes").textContent = total;
  document.getElementById("conAgua").textContent = `${conAgua} (${((conAgua / total) * 100).toFixed(1)}%)`;
  document.getElementById("sinAgua").textContent = `${sinAgua} (${((sinAgua / total) * 100).toFixed(1)}%)`;
  document.getElementById("sinID").textContent = sinID;
  document.getElementById("sinAguaSinID").textContent = sinAguaSinID;
  document.getElementById("conAguaSinID").textContent = conAguaSinID;
}

// Eventos

document.getElementById("filter").addEventListener("change", actualizarMapa);
document.getElementById("mostrarSinID").addEventListener("change", actualizarMapa);
document.getElementById("mostrarCapaAgua").addEventListener("change", toggleCapaAgua);
document.getElementById("search").addEventListener("change", function () {
  const id = parseInt(this.value);
  if (!id || isNaN(id)) return;
  geojsonLayer.eachLayer(layer => {
    if (layer.feature.properties.id_lote == id) {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
      layer.setStyle({ color: "orange", weight: 3, fillOpacity: 0.7 });
    }
  });
});

document.getElementById("btnCaneria").addEventListener("click", () => {
  if (!loteSeleccionado) return;

  if (rutaLayer) rutaLayer.remove();

  const start = nodoMasCercano(nodosMedios, [loteSeleccionado.lng, loteSeleccionado.lat]);
  const end = nodoMasCercano(nodosAgua, [loteSeleccionado.lng, loteSeleccionado.lat]);

  const pasos = [start];
  let actual = start;
  for (let i = 0; i < 20; i++) {
    const next = nodoMasCercano(nodosVertices, actual);
    if (distancia(next, end) < 0.0005) break;
    pasos.push(next);
    actual = next;
  }
  pasos.push(end);

  rutaLayer = L.polyline(pasos.map(p => [p[1], p[0]]), {
    color: "blue", weight: 4
  }).addTo(map);

  // Calcular distancia y costo
  let totalDist = 0;
  for (let i = 1; i < pasos.length; i++) {
    totalDist += distancia(pasos[i - 1], pasos[i]) * 111139; // grados -> metros
  }

  document.getElementById("distanciaTotal").textContent = totalDist.toFixed(1);
  document.getElementById("costoTotal").textContent = Math.round(totalDist * 3000);
});

function toggleCapaAgua() {
  const mostrar = document.getElementById("mostrarCapaAgua").checked;
  if (mostrar && !capaAgua) {
    fetch("AGUACAÑERIA.geojson")
      .then(res => res.json())
      .then(data => {
        capaAgua = L.geoJSON(data, {
          style: { color: "blue", weight: 2 }
        }).addTo(map);
      });
  } else if (!mostrar && capaAgua) {
    capaAgua.remove();
    capaAgua = null;
  }
}
