import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Landmark, Coffee, Building2, Music, Hospital, Dumbbell,
  TrainFront, TramFront, Search, Map as MapIcon, Layers, Info, Globe,
  Clock, ArrowRight, X, Eye, Languages, ChevronDown, Navigation2, ChevronUp, Navigation, HelpCircle
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import FAQ from './components/FAQ';
import { categories, routes, metroLines, metroGuide, viewBounds, faqs } from "./data/valencia.js";
import { languages, getTranslation } from "./data/i18n.js";
import "./styles.css";

// ============================================================================
// ICON MAPPING
// ============================================================================
const ICON_MAP = {
  landmark: Landmark,
  coffee: Coffee,
  bank: Building2,
  music: Music,
  hospital: Hospital,
  dumbbell: Dumbbell,
  trainfront: TrainFront,
  tramfront: TramFront
};

// ============================================================================
// LANGUAGE SELECTOR COMPONENT
// ============================================================================
const LanguageSelector = ({ currentLang, onSelect, isOpen, onToggle }) => {
  const currentLangData = languages.find(l => l.code === currentLang);

  return (
    <div className="lang-selector">
      <button className="lang-trigger" onClick={onToggle}>
        <Languages size={16} />
        <span>{currentLangData?.short}</span>
        <ChevronDown size={14} className={isOpen ? "rotated" : ""} />
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${currentLang === lang.code ? "active" : ""}`}
              onClick={() => { onSelect(lang.code); onToggle(); }}
            >
              <span className="lang-short">{lang.short}</span>
              <span className="lang-name">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// REGULAR POPUP CONTENT (Light theme)
// ============================================================================
const PopupContent = ({ feature, onClose, lang }) => {
  const t = (key) => getTranslation(lang, key);
  const [lng, lat] = feature.coords || [0, 0];

  return (
    <div className="popup-container popup-light">
      <button className="popup-close" onClick={onClose}><X size={16} /></button>
      <div className="popup-header">
        <span className="popup-title">{feature.name}</span>
      </div>
      {feature.description && <p className="popup-desc">{feature.description}</p>}
      {feature.tips && <div className="popup-tip">{feature.tips}</div>}
      {feature.line && (
        <div className="popup-lines-badge">
          <span className="line-label">Lines:</span> {feature.line}
        </div>
      )}

      <div className="popup-actions">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-btn google"
        >
          <MapIcon size={14} /> {t("googleMaps")}
        </a>
        <a
          href={`http://maps.apple.com/?ll=${lat},${lng}&q=${feature.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-btn apple"
        >
          <Navigation size={14} /> {t("appleMaps")}
        </a>
      </div>
    </div>
  );
};

// ============================================================================
// TRANSPORT POPUP (Light theme, no emojis, vertical layout)
// ============================================================================
const TransportPopup = ({ feature, onClose, lang }) => {
  const t = (key) => getTranslation(lang, key);
  const stationLines = feature.line ? feature.line.split(",").map(l => l.trim()) : [];
  const relevantLines = metroLines.filter(ml => stationLines.includes(ml.number));

  if (relevantLines.length === 0) {
    return <PopupContent feature={feature} onClose={onClose} />;
  }

  return (
    <div className="popup-container popup-light transport-popup">
      <button className="popup-close" onClick={onClose}><X size={16} /></button>
      <div className="popup-header">
        <TrainFront size={18} />
        <span className="popup-title">{feature.name}</span>
      </div>
      {feature.description && <p className="popup-desc">{feature.description}</p>}

      <div className="transport-lines">
        {relevantLines.map(line => (
          <div key={line.id} className="line-detail-card" style={{ "--line-color": line.color }}>
            <div className="line-header-row">
              <span className="line-badge" style={{ backgroundColor: line.color }}>{line.number}</span>
              <span className="line-name">{line.name}</span>
            </div>

            <div className="schedule-vertical">
              <div className="schedule-item">
                <span className="schedule-label">{t("peak")}</span>
                <span className="schedule-value">{line.frequency?.peak}</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-label">{t("offPeak")}</span>
                <span className="schedule-value">{line.frequency?.offPeak}</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-label">{t("first")} / {t("last")}</span>
                <span className="schedule-value">{line.operatingHours?.first} — {line.operatingHours?.last}</span>
              </div>
            </div>

            <div className="stops-section">
              <div className="stops-label">{t("allStops")}</div>
              <div className="stops-vertical">
                {line.allStops?.map((stop, idx) => (
                  <div key={idx} className={`stop-row ${stop.toLowerCase().includes(feature.name?.split(" ")[0]?.toLowerCase()) ? "current" : ""}`}>
                    <div className="stop-dot" style={{ backgroundColor: line.color }}></div>
                    <span className="stop-name">{stop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="popup-actions">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${feature.coords[1]},${feature.coords[0]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-btn google"
        >
          <MapIcon size={14} /> {t("googleMaps")}
        </a>
        <a
          href={`http://maps.apple.com/?ll=${feature.coords[1]},${feature.coords[0]}&q=${feature.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-btn apple"
        >
          <Navigation size={14} /> {t("appleMaps")}
        </a>
      </div>
    </div>
  );
};

// ============================================================================
// CUSTOM MARKER
// ============================================================================
const CustomMarker = ({ iconKey, color, dimmed, label, showLabel }) => {
  const Icon = ICON_MAP[iconKey] || Landmark;
  return (
    <div className={`custom-marker ${dimmed ? "dimmed" : ""}`}>
      <div className="marker-pin" style={{ "--color": color }}>
        <Icon className="marker-icon" />
      </div>
      {showLabel && label && (
        <div className="marker-label">{label}</div>
      )}
    </div>
  );
};

// ============================================================================
// SIDEBAR COMPONENTS
// ============================================================================
const MetroLineCard = ({ line, lang }) => {
  const t = (key) => getTranslation(lang, key);
  return (
    <div className="metro-card" style={{ borderLeft: `4px solid ${line.color}` }}>
      <div className="metro-header">
        <div className="metro-badge" style={{ backgroundColor: line.color }}>{line.number}</div>
        <div className="metro-name">{line.name}</div>
      </div>
      <p className="metro-desc">{line.description}</p>
      <div className="schedule-info-row">
        <span>{t("peak")}: {line.frequency?.peak}</span>
        <span>{line.operatingHours?.first} - {line.operatingHours?.last}</span>
      </div>
      <div className="station-pills">
        {line.keyStations.map((s, i) => <span key={i} className="station-pill">{s}</span>)}
      </div>
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================
const addMapLayers = (map) => {
  if (!map.getLayer("3d-buildings") && map.getSource("openmaptiles")) {
    map.addLayer({
      'id': '3d-buildings',
      'source': 'openmaptiles',
      'source-layer': 'building',
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#1e293b',
        'fill-extrusion-height': ['get', 'render_height'],
        'fill-extrusion-base': ['get', 'render_min_height'],
        'fill-extrusion-opacity': 0.6
      }
    });
  }

  routes.forEach(route => {
    if (map.getSource(route.id)) return;

    map.addSource(route.id, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: { name: route.label },
        geometry: { type: "LineString", coordinates: route.coordinates }
      }
    });

    // Neon Glow Layer (Behind everything)
    map.addLayer({
      id: `${route.id}-glow`,
      type: "line",
      source: route.id,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": route.color,
        "line-width": route.width * 3,
        "line-opacity": 0.4,
        "line-blur": 3
      }
    });

    map.addLayer({
      id: `${route.id}-outline`,
      type: "line",
      source: route.id,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#ffffff", "line-width": route.width + 2, "line-opacity": 0.8 }
    });

    map.addLayer({
      id: `${route.id}-layer`,
      type: "line",
      source: route.id,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": route.color,
        "line-width": route.width,
        ...(route.dash ? { "line-dasharray": route.dash } : {})
      }
    });
  });
};

// ============================================================================
// MAIN APP
// ============================================================================
const App = () => {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const activePopupRef = useRef(null);

  const [activeTab, setActiveTab] = useState("places");
  const [visibleCategories, setVisibleCategories] = useState(() => new Set(categories.map(c => c.id)));
  const [visibleRoutes, setVisibleRoutes] = useState(() => new Set(routes.map(r => r.id)));
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState("dark");
  const [focusedMarkerId, setFocusedMarkerId] = useState(null);
  const [focusedLines, setFocusedLines] = useState(null);
  const [lang, setLang] = useState("en");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [pitch, setPitch] = useState(60); // Start with high pitch for cinematic feel
  const [userLocation, setUserLocation] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(11); // Track zoom for semantic labels
  const userMarkerRef = useRef(null);

  const t = (key) => getTranslation(lang, key);

  // SEO Info Generation
  const getSEOProps = () => {
    switch (activeTab) {
      case 'places':
        return {
          title: t('places'),
          description: "Discover Valencian landmarks, cafés, and hidden gems.",
          keywords: "Valencia places, landmarks, restaurants, tourism"
        };
      case 'metro':
        return {
          title: t('guide'),
          description: "Complete guide to Valencia's metro system, tickets, and travel tips.",
          keywords: "Valencia metro, tickets, transport guide, subway map"
        };
      case 'routes':
        return {
          title: t('routes'),
          description: "Explore transit layers and bike paths across Valencia.",
          keywords: "Valencia routes, bike paths, transit, navigation"
        };
      case 'faq':
        return {
          title: "FAQ",
          description: "Common questions about Valencia transport, safety, and tips.",
          keywords: "Valencia FAQ, travel questions, metro payment, safety"
        };
      default:
        return {
          title: "Valencia Interactive Map",
          description: "Interactive Valencia travel guide with landmarks, metro network, and local tips.",
          keywords: "Valencia, travel guide, Spain, metro, City of Arts and Sciences"
        };
    }
  };

  const seoProps = getSEOProps();


  const clearFocus = useCallback(() => {
    setFocusedMarkerId(null);
    setFocusedLines(null);
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || "2x05cIiqLmf0C6mjVZ0K";
    const initialStyle = `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`;

    const map = new maplibregl.Map({
      container: mapNode.current,
      style: initialStyle,
      center: [-0.3763, 39.4699],
      zoom: 11, // Start zoomed out
      pitch: 0, // Start top-down
      bearing: -20,
      hash: false,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      addMapLayers(map);
      setMapReady(true);

      // Cinematic Fly-in
      setTimeout(() => {
        map.resize();
        map.flyTo({
          center: [-0.3763, 39.4699],
          zoom: 13.5,
          pitch: 60,
          bearing: 0,
          duration: 4000,
          essential: true,
          easing: (t) => t * (2 - t)
        });
      }, 500);
    });

    map.on("styledata", () => addMapLayers(map));

    map.on("click", (e) => {
      if (!e.originalEvent.target.closest(".custom-marker")) {
        clearFocus();
      }
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Zoom listener for semantic labels
  useEffect(() => {
    if (!mapRef.current) return;
    const handleZoom = () => setCurrentZoom(mapRef.current.getZoom());
    mapRef.current.on("zoom", handleZoom);
    return () => mapRef.current?.off("zoom", handleZoom);
  }, [isMapReady]);

  // Pitch toggle
  const togglePitch = () => {
    const newPitch = pitch === 0 ? 45 : 0;
    setPitch(newPitch);
    mapRef.current?.easeTo({ pitch: newPitch, duration: 500 });
  };

  // Style Toggle
  const toggleMapStyle = () => {
    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || "2x05cIiqLmf0C6mjVZ0K";
    const newStyle = mapStyle === "dark" ? "satellite" : "dark";
    setMapStyle(newStyle);
    const url = newStyle === "dark"
      ? `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`
      : `https://api.maptiler.com/maps/satellite/style.json?key=${maptilerKey}`;
    mapRef.current?.setStyle(url);
  };

  // User Location Toggle
  const toggleUserLocation = () => {
    if (showUserLocation) {
      // Turn off
      setShowUserLocation(false);
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    } else {
      // Request location - only real location, no fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = [position.coords.longitude, position.coords.latitude];
            showLocationMarker(coords);
          },
          (error) => {
            console.error("Geolocation error:", error.message);
            // No fallback - just log the error
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  };

  const showLocationMarker = (coords) => {
    setUserLocation(coords);
    setShowUserLocation(true);

    // Create user marker
    const el = document.createElement("div");
    el.className = "user-location-marker";
    el.innerHTML = `
      <div class="user-dot"></div>
      <div class="user-pulse"></div>
    `;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(coords)
      .addTo(mapRef.current);

    userMarkerRef.current = marker;

    // Fly to location
    mapRef.current?.flyTo({ center: coords, zoom: 15, duration: 1500 });
  };

  // Manage Markers with Focus Mode
  useEffect(() => {
    if (!isMapReady) return;

    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];

    categories.forEach(cat => {
      if (!visibleCategories.has(cat.id)) return;

      // Zoom thresholds based on importance
      const zoomThresholds = { 1: 11, 2: 13, 3: 14.5 };
      const minZoom = zoomThresholds[cat.importance] || 11;

      // Don't render markers for this category if zoom is below threshold
      if (currentZoom < minZoom) return;

      // Show labels only at higher zoom levels (zoom >= 14)
      const showLabels = currentZoom >= 14;

      cat.features.forEach((feature, idx) => {
        if (searchQuery && !feature.name.toLowerCase().includes(searchQuery.toLowerCase())) return;

        const markerId = `${cat.id}-${idx}`;
        const isTransport = cat.id === "metro" || cat.id === "tram" || cat.id === "train";
        const isDimmed = focusedMarkerId !== null && focusedMarkerId !== markerId;

        const el = document.createElement("div");
        el.dataset.markerId = markerId;
        const root = createRoot(el);
        root.render(<CustomMarker iconKey={cat.iconKey} color={cat.color} dimmed={isDimmed} label={feature.name} showLabel={showLabels} />);

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(feature.coords)
          .addTo(mapRef.current);

        el.addEventListener("click", (e) => {
          e.stopPropagation();

          if (activePopupRef.current) {
            activePopupRef.current.remove();
          }

          setFocusedMarkerId(markerId);

          // If transport, set focused lines to only show relevant routes
          if (isTransport && feature.line) {
            const lineNumbers = feature.line.split(",").map(l => l.trim());
            setFocusedLines(lineNumbers);
          } else {
            setFocusedLines(null);
          }

          const popupNode = document.createElement("div");
          const popupRoot = createRoot(popupNode);

          if (isTransport && feature.line) {
            popupRoot.render(<TransportPopup feature={feature} onClose={clearFocus} lang={lang} />);
          } else {
            popupRoot.render(<PopupContent feature={feature} onClose={clearFocus} lang={lang} />);
          }

          const popup = new maplibregl.Popup({ offset: 40, closeButton: false, closeOnClick: false, maxWidth: "380px" })
            .setLngLat(feature.coords)
            .setDOMContent(popupNode)
            .addTo(mapRef.current);

          activePopupRef.current = popup;
        });

        markersRef.current.push({ marker, id: markerId });
      });
    });

  }, [isMapReady, visibleCategories, searchQuery, focusedMarkerId, clearFocus, lang, currentZoom]);

  // Route Visibility (hide irrelevant lines when station focused)
  useEffect(() => {
    if (!isMapReady) return;

    routes.forEach(r => {
      const layerId = `${r.id}-layer`;
      const outlineId = `${r.id}-outline`;

      let visible = visibleRoutes.has(r.id);

      // If a station is focused, only show routes matching that station's lines
      if (focusedLines !== null) {
        const routeLineNum = r.id.match(/\d+/)?.[0];
        visible = focusedLines.includes(routeLineNum);
      }

      const visibility = visible ? "visible" : "none";
      if (mapRef.current.getLayer(layerId)) mapRef.current.setLayoutProperty(layerId, "visibility", visibility);
      if (mapRef.current.getLayer(outlineId)) mapRef.current.setLayoutProperty(outlineId, "visibility", visibility);
    });
  }, [visibleRoutes, isMapReady, mapStyle, focusedLines]);

  const fitCity = () => {
    mapRef.current?.fitBounds(viewBounds, { padding: 100, pitch: pitch, duration: 1500 });
  };

  const toggleCat = (id) => {
    const next = new Set(visibleCategories);
    next.has(id) ? next.delete(id) : next.add(id);
    setVisibleCategories(next);
  };

  const toggleRoute = (id) => {
    const next = new Set(visibleRoutes);
    next.has(id) ? next.delete(id) : next.add(id);
    setVisibleRoutes(next);
  };

  const IconComponent = ({ name }) => {
    const Icon = ICON_MAP[name] || Landmark;
    return <Icon size={18} />;
  };

  return (
    <HelmetProvider>
      <SEO
        title={seoProps.title}
        description={seoProps.description}
        keywords={seoProps.keywords}
        lang={lang}
      />
      <div className="app-container">
        <div ref={mapNode} className="map-background" />

        <aside className={`glass-panel ${drawerCollapsed ? 'collapsed' : ''}`}>
          <div className="drawer-handle" onClick={() => setDrawerCollapsed(!drawerCollapsed)}>
            <ChevronUp className={`handle-icon ${drawerCollapsed ? 'rotated' : ''}`} size={20} />
          </div>
          <header className="panel-header">
            <div className="brand-row">
              <div className="brand">
                <div className="brand-icon">🍊</div>
                <div className="brand-text">{t("brand")}</div>
              </div>
              <LanguageSelector
                currentLang={lang}
                onSelect={setLang}
                isOpen={langDropdownOpen}
                onToggle={() => setLangDropdownOpen(!langDropdownOpen)}
              />
            </div>

            <nav className="nav-tabs">
              <button className={`nav-tab ${activeTab === "places" ? "active" : ""}`} onClick={() => setActiveTab("places")}>
                <MapIcon size={16} /> {t("places")}
              </button>
              <button className={`nav-tab ${activeTab === "metro" ? "active" : ""}`} onClick={() => setActiveTab("metro")}>
                <Info size={16} /> {t("guide")}
              </button>
              <button className={`nav-tab ${activeTab === "routes" ? "active" : ""}`} onClick={() => setActiveTab("routes")}>
                <Layers size={16} /> {t("routes")}
              </button>
              <button className={`nav-tab ${activeTab === "faq" ? "active" : ""}`} onClick={() => setActiveTab("faq")}>
                <HelpCircle size={16} /> FAQ
              </button>
            </nav>
          </header>

          <div className="panel-content">
            {activeTab === "places" && (
              <>
                <div className="search-wrapper">
                  <Search className="search-icon" />
                  <input
                    className="search-input"
                    placeholder={t("search")}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="section-title">{t("categories")}</div>
                {categories.map(cat => (
                  <div key={cat.id} className="list-item" onClick={() => toggleCat(cat.id)}>
                    <div className="item-left">
                      <div className="item-icon" style={{ backgroundColor: cat.color }}>
                        <IconComponent name={cat.iconKey} />
                      </div>
                      <div className="item-info">
                        <span className="item-label">{t("cat_" + cat.id)}</span>
                        <span className="item-desc">{cat.features.length} {t("locations")}</span>
                      </div>
                    </div>
                    <label className="switch" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={visibleCategories.has(cat.id)} onChange={() => toggleCat(cat.id)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </>
            )}

            {activeTab === "metro" && (
              <>
                <div className="section-title">{t("ticketsAndTips")}</div>
                <div className="metro-card">
                  <p className="metro-desc"><strong>{t("zoneA")}:</strong> {metroGuide.ticketInfo.zoneA}</p>
                  <p className="metro-desc"><strong>{t("airport")}:</strong> {metroGuide.ticketInfo.airport}</p>
                </div>
                <div className="section-title">{t("metroLines")}</div>
                {metroLines.map(line => <MetroLineCard key={line.id} line={line} lang={lang} />)}
              </>
            )}

            {activeTab === "routes" && (
              <>
                <div className="section-title">{t("transitLayers")}</div>
                {routes.map(route => (
                  <div key={route.id} className="list-item" onClick={() => toggleRoute(route.id)}>
                    <div className="item-left">
                      <div className="item-icon" style={{ backgroundColor: route.color }}>
                        <Layers size={18} />
                      </div>
                      <div className="item-info">
                        <span className="item-label">{route.label}</span>
                      </div>
                    </div>
                    <label className="switch" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={visibleRoutes.has(route.id)} onChange={() => toggleRoute(route.id)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </>
            )}

            {activeTab === "faq" && <FAQ data={faqs} t={t} />}
          </div>
        </aside>

        <div className="floating-actions">
          <button className="fab" onClick={toggleMapStyle} title={mapStyle === "dark" ? t("switchToSatellite") : t("switchToMap")}>
            {mapStyle === "dark" ? <Globe size={20} /> : <MapIcon size={20} />}
          </button>
          <button className="fab" onClick={togglePitch} title={pitch === 0 ? t("angledView") : t("topView")}>
            <Eye size={20} />
          </button>
          <button
            className={`fab ${showUserLocation ? "active" : ""}`}
            onClick={toggleUserLocation}
            title={t("myLocation")}
          >
            <Navigation2 size={20} />
          </button>
          <button className="fab" onClick={fitCity} title={t("resetView")}>
            <Search size={18} />
          </button>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default App;
