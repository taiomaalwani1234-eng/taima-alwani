import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Sector } from '../data/cityData';


interface CityMapProps {
  sectors: Sector[];
  activeSectorId: string | null;
  onSectorClick?: (id: string) => void;
  theme?: 'light' | 'dark';
}

const mapXToLng = (x: number) => 35.5 + (x / 1000) * 7.0;
const mapYToLat = (y: number) => 32.0 + ((1000 - y) / 1000) * 5.5;

function MapBounds({ sectors }: { sectors: Sector[] }) {
  const map = useMap();
  useEffect(() => {
    if (sectors.length > 0) {
      const lats = sectors.map(s => mapYToLat(s.y));
      const lngs = sectors.map(s => mapXToLng(s.x));
      const bounds = L.latLngBounds(
        [Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05],
        [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05]
      );
      map.fitBounds(bounds, { animate: true });
    }
  }, [sectors.length, map]);
  return null;
}

export const CityMap: React.FC<CityMapProps> = ({ sectors, activeSectorId, onSectorClick, theme = 'dark' }) => {
  const connections = [
    ['central_hub', 'power_grid'],
    ['central_hub', 'hospital'],
    ['central_hub', 'data_center'],
    ['power_grid', 'comm_tower'],
    ['data_center', 'bank'],
    ['comm_tower', 'hospital'],
    ['bank', 'central_hub'],
    ['traffic_control', 'central_hub'],
    ['water_plant', 'hospital'],
    ['airport', 'comm_tower'],
    ['police_hq', 'central_hub'],
    ['commercial_zone', 'bank'],
    ['university', 'data_center'],
    ['military_base', 'police_hq'],
    ['space_port', 'comm_tower'],
    ['subway_system', 'traffic_control'],
    ['factory_alpha', 'power_grid'],
    ['embassy_district', 'central_hub'],
    ['drone_hub', 'traffic_control'],
    ['research_lab', 'university'],
    ['nuclear_reactor', 'power_grid'],
    ['media_center', 'comm_tower'],
    ['port_auth', 'commercial_zone'],
    ['cloud_archives', 'data_center'],
    ['smart_farms', 'water_plant'],
    ['ai_core', 'central_hub']
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'safe': return '#3BB2F6';
      case 'warning': return '#fcd34d';
      case 'critical': return theme === 'light' ? '#ba1a1a' : '#ffb4ab';
      case 'offline': return theme === 'light' ? '#E4E9F7' : '#334155';
      default: return '#06B6D4';
    }
  };

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
      <MapContainer 
        center={[34.8021, 38.9968]} 
        zoom={6} 
        style={{ height: '100%', width: '100%', background: theme === 'light' ? '#F5F7FF' : '#0f172a' }}
        zoomControl={false}
        tap={true}
        bounceAtZoomLimits={true}
        maxZoom={12}
        minZoom={4}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          key={theme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={theme === 'light' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
        />
        <div className="absolute inset-0 z-[100] scanning-overlay opacity-20 pointer-events-none hidden sm:block"></div>
        <MapBounds sectors={sectors} />
        
        {connections.map(([id1, id2], i) => {
          const s1 = sectors.find(s => s.id === id1);
          const s2 = sectors.find(s => s.id === id2);
          if (!s1 || !s2) return null;
          
          const isAlert = s1.status === 'critical' || s2.status === 'critical' || s1.status === 'warning' || s2.status === 'warning';
          
          return (
              <Polyline
              key={i}
              positions={[
                [mapYToLat(s1.y), mapXToLng(s1.x)],
                [mapYToLat(s2.y), mapXToLng(s2.x)]
              ]}
              color={isAlert ? '#ba1a1a' : '#3BB2F6'}
              weight={isAlert ? 3 : 1}
              opacity={isAlert ? 0.6 : 0.2}
              dashArray={isAlert ? "10, 10" : undefined}
            />
          );
        })}

        {sectors.map(sector => {
          const isActive = sector.id === activeSectorId;
          const color = getStatusColor(sector.status);
          const lat = mapYToLat(sector.y);
          const lng = mapXToLng(sector.x);
          
          return (
            <React.Fragment key={sector.id}>
              {(isActive || sector.status === 'critical' || sector.status === 'warning') && (
                <CircleMarker
                  center={[lat, lng]}
                  radius={isActive ? (isMobile ? 32 : 24) : (isMobile ? 26 : 18)}
                  color={color}
                  fillColor={color}
                  fillOpacity={0.15}
                  weight={isActive ? 3 : 2}
                  dashArray={isActive ? "5, 5" : undefined}
                  interactive={true}
                  eventHandlers={{
                    click: () => {
                      if (onSectorClick) onSectorClick(sector.id);
                    }
                  }}
                />
              )}
              <CircleMarker
                center={[lat, lng]}
                radius={isActive ? (isMobile ? 22 : 14) : (isMobile ? 16 : 8)}
                color={theme === 'light' ? '#FFFFFF' : '#0f172a'}
                weight={2}
                fillColor={color}
                fillOpacity={1}
                interactive={true}
                eventHandlers={{
                  click: () => {
                    if (onSectorClick) onSectorClick(sector.id);
                  }
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
