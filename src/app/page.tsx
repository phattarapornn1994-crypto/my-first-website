'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Filter, Info, Factory, Recycle, Package, TrendingUp, Target, Shield, Zap, Truck, Route } from 'lucide-react'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

import 'leaflet/dist/leaflet.css'

interface Location {
  id: string
  name: string
  type: 'recycling-shop' | 'paper-factory' | 'plastic-factory'
  coordinates: [number, number]
  distanceFromNew: number
  distanceFromOld: number
  notes: string
}

interface StrategicAnalysis {
  advantage: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'location' | 'competition' | 'market' | 'logistics'
}

interface RouteAnalysis {
  from: string
  to: string
  distance: number
  estimatedTime: number
  routeType: 'bottle-delivery' | 'material-collection' | 'general'
  difficulty: 'easy' | 'medium' | 'difficult'
}

const locations: Location[] = [
  {
    id: '1',
    name: 'บริษัท ช. ทิพย์เกื้อกูล สตีล จำกัด',
    type: 'recycling-shop',
    coordinates: [13.584350, 100.307817],
    distanceFromNew: 7.5,
    distanceFromOld: 4.1,
    notes: 'เน้นเศษโลหะ มีบริการอัดและตัดเศษโลหะ (เครื่องจักรกำลังสูง)'
  },
  {
    id: '2',
    name: 'บริษัท ชวนไท่ เทรดดิ้ง จำกัด',
    type: 'recycling-shop',
    coordinates: [13.623127, 100.253019],
    distanceFromNew: 3.8,
    distanceFromOld: 4.0,
    notes: 'รับซื้อและคัดแยกวัสดุรีไซเคิลทั่วไป (เช่น พลาสติก โลหะ กระดาษ) และผลิตเม็ดพลาสติกรีไซเคิล'
  },
  {
    id: '3',
    name: 'เอส.เค.พลาสติก',
    type: 'recycling-shop',
    coordinates: [13.679583, 100.287733],
    distanceFromNew: 3.8,
    distanceFromOld: 7.0,
    notes: 'คัดแยกขยะรีไซเคิลและมีการหลอมพลาสติกผลิตเป็นเม็ดพลาสติก (รีไซเคิล)'
  },
  {
    id: '4',
    name: 'บริษัท ไทยเม็ททอลพลาสติกส์ จำกัด',
    type: 'recycling-shop',
    coordinates: [13.607870, 100.281864],
    distanceFromNew: 4.3,
    distanceFromOld: 1.3,
    notes: 'รับซื้อเศษโลหะและเศษพลาสติกจากโรงงานและชุมชน มาคัดแยกเพื่อรีไซเคิล'
  },
  {
    id: '5',
    name: 'บริษัท พี.เอ็น.ที.สยาม พลาสติก จำกัด',
    type: 'recycling-shop',
    coordinates: [13.634933, 100.284467],
    distanceFromNew: 1.4,
    distanceFromOld: 2.1,
    notes: 'คัดแยกขยะไม่ใช้แล้วและหลอมผลิตเม็ดพลาสติกเกรด B พร้อมผลิตภัณฑ์พลาสติกจากวัสดุรีไซเคิล'
  },
  {
    id: '6',
    name: 'บริษัท สยามรุ่งเรืองพลาสเทค จำกัด',
    type: 'recycling-shop',
    coordinates: [13.633801, 100.355720],
    distanceFromNew: 8.4,
    distanceFromOld: 7.4,
    notes: 'คัดแยกเศษพลาสติกและโลหะ รีไซเคิลพลาสติกเป็นผลิตภัณฑ์ใหม่ (เช่น ตะกร้า พลาสติกลัง)'
  },
  {
    id: '7',
    name: 'บริษัท ที.โอ.พี. (กระดาษหมุนเวียน) จำกัด',
    type: 'recycling-shop',
    coordinates: [13.621333, 100.338233],
    distanceFromNew: 6.9,
    distanceFromOld: 5.3,
    notes: 'รับซื้อกระดาษใช้แล้วเป็นหลัก (ชื่อบริษัทสื่อถึงกระดาษรีไซเคิล) รวมถึงวัสดุรีไซเคิลอื่นๆ เช่น พลาสติก, โลหะ ฯลฯ'
  },
  {
    id: '8',
    name: 'บริษัท ปัญจพลไฟเบอร์คอนเทนเนอร์ จำกัด',
    type: 'paper-factory',
    coordinates: [13.586267, 100.241950],
    distanceFromNew: 7.8,
    distanceFromOld: 6.2,
    notes: 'โรงงานผลิตกระดาษคราฟท์/กระดาษแข็งรายใหญ่ ผลิตกระดาษสำหรับกล่องลูกฟูก ~15,000 ตัน/เดือน (ใช้กระดาษเก่าเป็นวัตถุดิบ)'
  },
  {
    id: '9',
    name: 'บริษัท อุตสาหกรรมกระดาษซินกวงฮั้ว (ประเทศไทย) จำกัด',
    type: 'paper-factory',
    coordinates: [13.540917, 100.201900],
    distanceFromNew: 14.4,
    distanceFromOld: 12.7,
    notes: 'ผลิตกระดาษสา (กระดาษจากปอสา) ปริมาณประมาณ 15 ตัน/เดือน (โรงงานขนาดเล็กเชิงหัตถกรรม)'
  },
  {
    id: '10',
    name: 'บริษัท ลี เปเปอร์ อินดัสเตรียล จำกัด',
    type: 'paper-factory',
    coordinates: [13.523333, 100.186783],
    distanceFromNew: 16.9,
    distanceFromOld: 15.2,
    notes: 'ผลิตกระดาษลูกฟูกและกล่องกระดาษบรรจุภัณฑ์ (โรงงานกล่องกระดาษ)'
  },
  {
    id: '11',
    name: 'บริษัท ลี้ไฟเบอร์บอร์ด จำกัด',
    type: 'paper-factory',
    coordinates: [13.577217, 100.284900],
    distanceFromNew: 7.7,
    distanceFromOld: 4.4,
    notes: 'ผลิตกระดาษลูกฟูกและกล่องกระดาษลูกฟูก (บรรจุภัณฑ์) จากกระดาษรีไซเคิล'
  },
  {
    id: '12',
    name: 'บริษัท รอยัล เปเปอร์ อินดัสตรีย์ จำกัด',
    type: 'paper-factory',
    coordinates: [13.632790, 100.345870],
    distanceFromNew: 7.3,
    distanceFromOld: 6.3,
    notes: 'ผลิตแผ่นกระดาษลูกฟูก (สำหรับทำกล่องบรรจุภัณฑ์) จากเยื่อกระดาษรีไซเคิล'
  },
  {
    id: '13',
    name: 'บริษัท เซิ้นฟา จำกัด',
    type: 'plastic-factory',
    coordinates: [13.536524, 100.163292],
    distanceFromNew: 17.5,
    distanceFromOld: 16.3,
    notes: 'โรงงานรีไซเคิลพลาสติก ผลิตเม็ดพลาสติกเกรด B จากพลาสติกใช้แล้ว และมีบริการคัดแยกวัสดุไม่ใช้แล้วในโรงงาน'
  },
  {
    id: '14',
    name: 'บริษัท เอ็น.บี.เจ.โพลิเมอร์ (ประเทศไทย) จำกัด',
    type: 'plastic-factory',
    coordinates: [13.573341, 100.225501],
    distanceFromNew: 10.0,
    distanceFromOld: 8.4,
    notes: 'ผลิตเม็ดพลาสติกรีไซเคิลเกรด B (เม็ดพลาสติกคุณภาพรองจากเกรด A สำหรับงานทั่วไป)'
  },
  {
    id: '15',
    name: 'บริษัท มิราเคิล เคมีภัณฑ์ จำกัด',
    type: 'plastic-factory',
    coordinates: [13.520940, 100.190500],
    distanceFromNew: 16.9,
    distanceFromOld: 15.1,
    notes: 'ผลิตเม็ดพลาสติกเกรด B จากพลาสติกเก่า (รีไซเคิลพลาสติกใช้แล้วเป็นวัตถุดิบ)'
  },
  {
    id: '16',
    name: 'บริษัท บางกอก โตโย อินดัสเตรียล จำกัด',
    type: 'plastic-factory',
    coordinates: [13.612052, 100.303332],
    distanceFromNew: 4.6,
    distanceFromOld: 1.6,
    notes: 'ผลิตเม็ดพลาสติกเกรด B และผลิตภัณฑ์พลาสติกอื่นๆ จากพลาสติกใช้แล้ว (ครบวงจรทั้งหลอมเม็ดและขึ้นรูป)'
  },
  {
    id: '17',
    name: 'บริษัท สยามพลาสติก อินดัสตรี จำกัด',
    type: 'plastic-factory',
    coordinates: [13.600210, 100.227680],
    distanceFromNew: 7.6,
    distanceFromOld: 6.9,
    notes: 'ผลิตเม็ดพลาสติกรีไซเคิลและผลิตภัณฑ์พลาสติกจากเศษพลาสติกหลายชนิด (เช่น PP, HDPE, ฯลฯ)'
  }
]

// Updated with exact coordinates for Chang Distillery (1988)
const referencePoints = {
  newChang: { 
    name: 'ลานกระทิงแดงใหม่', 
    coordinates: [13.6463, 100.2794] as [number, number] 
  },
  oldChang: { 
    name: 'โรงงานสุรากระทิงแดง (1988) จำกัด', 
    coordinates: [13.61718090602469, 100.28958461678894] as [number, number] 
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate the exact distance from new location to distillery
const exactDistanceToDistillery = calculateDistance(
  referencePoints.newChang.coordinates[0], 
  referencePoints.newChang.coordinates[1],
  referencePoints.oldChang.coordinates[0], 
  referencePoints.oldChang.coordinates[1]
);

const routeAnalysis: RouteAnalysis[] = [
  {
    from: 'ลานกระทิงแดงใหม่',
    to: 'โรงงานสุรากระทิงแดง (1988)',
    distance: exactDistanceToDistillery,
    estimatedTime: Math.round(exactDistanceToDistillery * 3), // 3 minutes per km average
    routeType: 'bottle-delivery',
    difficulty: 'easy'
  },
  {
    from: 'ลานกระทิงแดงใหม่',
    to: 'บริษัท พี.เอ็น.ที.สยาม พลาสติก',
    distance: 1.4,
    estimatedTime: 5,
    routeType: 'material-collection',
    difficulty: 'easy'
  },
  {
    from: 'ลานกระทิงแดงใหม่',
    to: 'บริษัท ปัญจพลไฟเบอร์คอนเทนเนอร์',
    distance: 7.8,
    estimatedTime: 20,
    routeType: 'material-collection',
    difficulty: 'medium'
  }
];

const typeConfig = {
  'recycling-shop': { label: 'ร้านของเก่า/คัดแยกขยะ', icon: Recycle, color: '#10b981', iconColor: 'text-green-600' },
  'paper-factory': { label: 'โรงงานกระดาษ', icon: Package, color: '#3b82f6', iconColor: 'text-blue-600' },
  'plastic-factory': { label: 'โรงงานเม็ดพลาสติก', icon: Factory, color: '#f97316', iconColor: 'text-orange-600' }
}

const strategicAnalysis: StrategicAnalysis[] = [
  {
    advantage: "ตำแหน่งศูนย์กลางเชิงพาณิชย์",
    description: "ตั้งอยู่บนถนนโยรัก ซึ่งเป็นเส้นทางหลักเชื่อมต่อระหว่างเมืองสมุทรสาครและพื้นที่อุตสาหกรรมโดยรอบ",
    impact: "high",
    category: "location"
  },
  {
    advantage: "ระยะทางที่เหมาะสมสำหรับขนส่งขวด",
    description: `อยู่ห่างจากโรงงานสุราเพียง ${exactDistanceToDistillery.toFixed(2)} กม. เหมาะสำหรับการขนส่งขวดเปล่ากลับเพื่อรีไซเคิล`,
    impact: "high",
    category: "logistics"
  },
  {
    advantage: "ความสามารถในการเข้าถึงโรงงานใหญ่",
    description: "อยู่ในรัศมีที่เหมาะสมกับโรงงานกระดาษและพลาสติกขนาดใหญ่ที่สามารถเป็นลูกค้ารายใหญ่ได้",
    impact: "high",
    category: "market"
  },
  {
    advantage: "โลจิสติกส์ที่สะดวก",
    description: "เข้าถึงได้ง่ายจากทั้งถนนเศรษฐกิจและถนนโยรัก เหมาะสำหรับรถบรรทุกขนาดใหญ่",
    impact: "high",
    category: "logistics"
  },
  {
    advantage: "ศักยภาพการขยายตลาด",
    description: "พื้นที่โดยรอบมีทั้งชุมชนและอุตสาหกรรม ทำให้มีแหล่งวัตถุดิบและลูกค้าหลากหลาย",
    impact: "medium",
    category: "market"
  },
  {
    advantage: "การลดต้นทุนการขนส่งขวด",
    description: `ระยะทาง ${exactDistanceToDistillery.toFixed(2)} กม. ช่วยลดต้นทุนน้ำมันและเวลาในการขนส่งขวดเปล่าจากโรงงานสุรา`,
    impact: "medium",
    category: "logistics"
  }
]

export default function SamutSakhonRecyclingMap() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [L, setL] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('logistics')

  const filteredLocations = selectedType === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === selectedType)

  const recyclingShops = locations.filter(loc => loc.type === 'recycling-shop')
  const competitorsWithin5km = recyclingShops.filter(loc => loc.distanceFromNew <= 5)
  const averageDistanceToCompetitors = recyclingShops.reduce((sum, loc) => sum + loc.distanceFromNew, 0) / recyclingShops.length

  useEffect(() => {
    // Load Leaflet dynamically
    import('leaflet').then((leaflet) => {
      // Fix for default markers in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setL(leaflet)
      setMapLoaded(true)
    })
  }, [])

  const createCustomIcon = (color: string, type: string) => {
    if (!L) return null
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    })
  }

  const createReferenceIcon = (color: string) => {
    if (!L) return null
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'reference-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    })
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'location': return <MapPin className="h-4 w-4" />
      case 'competition': return <Target className="h-4 w-4" />
      case 'market': return <TrendingUp className="h-4 w-4" />
      case 'logistics': return <Truck className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'difficult': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            การวิเคราะห์เส้นทางขนส่งขวด ลานกระทิงแดงใหม่
          </h1>
          <p className="text-gray-600">
            วัดระยะทางและวิเคราะห์เส้นทางการขนส่งขวดเปล่าจากโรงงานสุรากระทิงแดง (1988)
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logistics">🚚 การขนส่งขวด</TabsTrigger>
            <TabsTrigger value="analysis">📊 วิเคราะห์ยุทธศาสตร์</TabsTrigger>
            <TabsTrigger value="map">🗺️ แผนที่</TabsTrigger>
            <TabsTrigger value="comparison">⚔️ เปรียบเทียบคู่แข่ง</TabsTrigger>
          </TabsList>

          <TabsContent value="logistics" className="space-y-6">
            {/* Key Distance Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-600" />
                    ระยะทางสู่โรงงานสุรา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{exactDistanceToDistillery.toFixed(2)}</div>
                  <p className="text-sm text-gray-600">กิโลเมตร</p>
                  <div className="mt-2 text-xs text-gray-500">
                    เวลาโดยประมาณ: {Math.round(exactDistanceToDistillery * 3)} นาที
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    ประเภทเส้นทาง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">ขนส่งขวด</div>
                  <p className="text-sm text-gray-600">เส้นทางหลัก</p>
                  <div className="mt-2 text-xs text-gray-500">
                    ความยาก: ง่าย - ถนนสายหลัก
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    ประสิทธิภาพการขนส่ง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">สูง</div>
                  <p className="text-sm text-gray-600">เหมาะสำหรับรถบรรทุก</p>
                  <div className="mt-2 text-xs text-gray-500">
                    ใช้เวลาน้อย ต้นทุนต่ำ
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Route Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  การวิเคราะห์เส้นทางขนส่ง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routeAnalysis.map((route, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{route.from} → {route.to}</h3>
                            <Badge className={getDifficultyColor(route.difficulty)}>
                              {route.difficulty === 'easy' ? 'ง่าย' : route.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                            </Badge>
                            <Badge variant="outline">
                              {route.routeType === 'bottle-delivery' ? 'ขนส่งขวด' : 
                               route.routeType === 'material-collection' ? 'รับวัตถุดิบ' : 'ทั่วไป'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">ระยะทาง:</span>
                              <span className="ml-2 font-semibold">{route.distance.toFixed(2)} กม.</span>
                            </div>
                            <div>
                              <span className="text-gray-500">เวลาโดยประมาณ:</span>
                              <span className="ml-2 font-semibold">{route.estimatedTime} นาที</span>
                            </div>
                            <div>
                              <span className="text-gray-500">ความเร็วเฉลี่ย:</span>
                              <span className="ml-2 font-semibold">{Math.round(route.distance / route.estimatedTime * 60)} กม./ชม.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bottle Transportation Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">ประโยชน์จากระยะทางที่เหมาะสม</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>ลดต้นทุนน้ำมันในการขนส่งขวดเปล่า</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>เวลาเดินทางสั้น เพิ่มประสิทธิภาพการทำงาน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>สามารถทำรอบขนส่งได้มากขึ้นต่อวัน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>ลดความเสียหายของขวดระหว่างการขนส่ง</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">การวางแผนการขนส่ง</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>สามารถทำรอบละ 15-20 นาที (รวมเวลาโหลด-ขนส่ง)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>ทำได้ 2-3 รอบต่อชั่วโมง ตามปริมาณขวด</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>เหมาะกับรถบรรทุก 6 ล้อหรือ 10 ล้อ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>เส้นทางตรง ไม่ต้องเข้าชุมชนหนาแน่น</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* Strategic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-600" />
                    คู่แข่งในรัศมี 5 กม.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{competitorsWithin5km.length}</div>
                  <p className="text-sm text-gray-600">ร้านของเก่า</p>
                  <div className="mt-2 text-xs text-gray-500">
                    ใกล้ที่สุด: {competitorsWithin5km[0]?.name.split(' ')[0]} ({competitorsWithin5km[0]?.distanceFromNew} กม.)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    ระยะเฉลี่ยถึงคู่แข่ง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{averageDistanceToCompetitors.toFixed(1)}</div>
                  <p className="text-sm text-gray-600">กิโลเมตร</p>
                  <div className="mt-2 text-xs text-gray-500">
                    จากร้านของเก่าทั้งหมด {recyclingShops.length} แห่ง
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Factory className="h-5 w-5 text-green-600" />
                    โรงงานในรัศมี 10 กม.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {locations.filter(loc => loc.type !== 'recycling-shop' && loc.distanceFromNew <= 10).length}
                  </div>
                  <p className="text-sm text-gray-600">โรงงานรีไซเคิล</p>
                  <div className="mt-2 text-xs text-gray-500">
                    กระดาษ {locations.filter(loc => loc.type === 'paper-factory' && loc.distanceFromNew <= 10).length} | 
                    พลาสติก {locations.filter(loc => loc.type === 'plastic-factory' && loc.distanceFromNew <= 10).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategic Advantages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ปัจจัยยุทธศาสตร์ที่ได้เปรียบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategicAnalysis.map((analysis, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getCategoryIcon(analysis.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{analysis.advantage}</h3>
                            <Badge className={getImpactColor(analysis.impact)}>
                              {analysis.impact === 'high' ? 'สูง' : analysis.impact === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{analysis.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SWOT Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">จุดแข็ง (Strengths)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>ตำแหน่งที่ตั้งใจกลางเส้นทางการค้าหลัก</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>ระยะทางที่เหมาะสมสำหรับขนส่งขวด ({exactDistanceToDistillery.toFixed(2)} กม.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>การเข้าถึงโรงงานใหญ่ที่เป็นลูกค้ารายสำคัญ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                      <span>โครงสร้างพื้นฐานการขนส่งที่สะดวก</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">ความท้าทาย (Challenges)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      <span>การแข่งขันกับร้านของเก่าที่มีอยู่แล้ว</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      <span>ความจำเป็นต้องสร้างฐานลูกค้าใหม่</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      <span>การลงทุนในอุปกรณ์และโครงสร้างพื้นฐาน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                      <span>การขนส่งในพื้นที่ที่มีการจราจรหนาแน่น</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      แผนที่ตำแหน่งจริง
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                      {mapLoaded && L ? (
                        <MapContainer
                          center={[13.6, 100.27]}
                          zoom={11}
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={true}
                        >
                          <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          
                          {/* Reference Points */}
                          <Marker
                            position={referencePoints.newChang.coordinates}
                            icon={createReferenceIcon('#dc2626')}
                          >
                            <Popup>
                              <div className="text-center">
                                <h3 className="font-bold text-red-600">{referencePoints.newChang.name}</h3>
                                <p className="text-xs text-gray-600">
                                  พิกัด: {referencePoints.newChang.coordinates[0].toFixed(4)}, {referencePoints.newChang.coordinates[1].toFixed(4)}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                          
                          <Marker
                            position={referencePoints.oldChang.coordinates}
                            icon={createReferenceIcon('#7c2d12')}
                          >
                            <Popup>
                              <div className="text-center">
                                <h3 className="font-bold text-red-800">{referencePoints.oldChang.name}</h3>
                                <p className="text-xs text-gray-600">
                                  พิกัด: {referencePoints.oldChang.coordinates[0].toFixed(4)}, {referencePoints.oldChang.coordinates[1].toFixed(4)}
                                </p>
                                <p className="text-xs text-blue-600 font-semibold">
                                  ระยะทาง: {exactDistanceToDistillery.toFixed(2)} กม.
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                          
                          {/* Location Markers */}
                          {filteredLocations.map((location) => {
                            const config = typeConfig[location.type]
                            return (
                              <Marker
                                key={location.id}
                                position={location.coordinates}
                                icon={createCustomIcon(config.color, location.type)}
                                eventHandlers={{
                                  click: () => setSelectedLocation(location)
                                }}
                              >
                                <Popup>
                                  <div className="text-center max-w-xs">
                                    <h3 className="font-bold text-sm mb-1">{location.name}</h3>
                                    <Badge variant="secondary" className="text-xs mb-2">
                                      {config.label}
                                    </Badge>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <p>พิกัด: {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}</p>
                                      <p>จากลานใหม่: {location.distanceFromNew} กม.</p>
                                      <p>จากโรงงานสุรา: {location.distanceFromOld} กม.</p>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-2">{location.notes}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            )
                          })}
                        </MapContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                            <p className="text-gray-500">กำลังโหลดแผนที่...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Map Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-600 rounded-full border border-white shadow"></div>
                        <span>ลานกระทิงแดงใหม่</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-800 rounded-full border border-white shadow"></div>
                        <span>โรงงานสุรา (1988)</span>
                      </div>
                      {Object.entries(typeConfig).map(([type, config]) => (
                        <div key={type} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white shadow" style={{ backgroundColor: config.color }}></div>
                          <span>{config.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Control Panel */}
              <div className="space-y-6">
                {/* Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      กรองประเภท
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={selectedType === 'all' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedType('all')}
                      >
                        ทั้งหมด ({locations.length})
                      </Button>
                      {Object.entries(typeConfig).map(([type, config]) => {
                        const Icon = config.icon
                        const count = locations.filter(loc => loc.type === type).length
                        return (
                          <Button
                            key={type}
                            variant={selectedType === type ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => setSelectedType(type)}
                          >
                            <Icon className={`h-4 w-4 mr-2 ${config.iconColor}`} />
                            {config.label} ({count})
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Distance to Distillery */}
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5 text-blue-600" />
                      ระยะทางสู่โรงงานสุรา
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {exactDistanceToDistillery.toFixed(2)} กม.
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        เวลาโดยประมาณ {Math.round(exactDistanceToDistillery * 3)} นาที
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>เหมาะสำหรับการขนส่งขวดเปล่า</p>
                        <p>ลดต้นทุนการขนส่ง</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Location Details */}
                {selectedLocation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        รายละเอียดสถานที่
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                          <Badge className="mt-1">
                            {typeConfig[selectedLocation.type].label}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">พิกัด:</span>
                            <span className="font-mono text-xs">
                              {selectedLocation.coordinates[0].toFixed(6)}, {selectedLocation.coordinates[1].toFixed(6)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">จากลานใหม่:</span>
                            <span>{selectedLocation.distanceFromNew} กม.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">จากโรงงานสุรา:</span>
                            <span>{selectedLocation.distanceFromOld} กม.</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-700">{selectedLocation.notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Competitor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  การวิเคราะห์คู่แข่งร้านของเก่าใกล้เคียง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recyclingShops
                    .sort((a, b) => a.distanceFromNew - b.distanceFromNew)
                    .slice(0, 5)
                    .map((competitor, index) => (
                    <div key={competitor.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                            <h3 className="font-semibold">{competitor.name}</h3>
                            <Badge variant={competitor.distanceFromNew <= 3 ? "destructive" : "secondary"}>
                              {competitor.distanceFromNew <= 3 ? "คู่แข่งระดับใกล้" : "คู่แข่งระดับไกล"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{competitor.notes}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">ระยะทางจากเรา:</span>
                              <span className="ml-2 font-semibold">{competitor.distanceFromNew} กม.</span>
                            </div>
                            <div>
                              <span className="text-gray-500">ระยะทางจากโรงงานสุรา:</span>
                              <span className="ml-2 font-semibold">{competitor.distanceFromOld} กม.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Position Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">ตำแหน่งที่ตั้ง vs คู่แข่ง</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ตำแหน่งที่ดีที่สุด:</span>
                      <span className="font-semibold">1.4 กม. (พี.เอ็น.ที.สยาม)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ตำแหน่งของเรา:</span>
                      <span className="font-semibold text-green-600">0 กม. (จุดศูนย์กลาง)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">คู่แข่งเฉลี่ย:</span>
                      <span className="font-semibold">{averageDistanceToCompetitors.toFixed(1)} กม.</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>ข้อสรุป:</strong> ตำแหน่งของเราอยู่ในระดับที่ดีเมื่อเทียบกับคู่แข่งส่วนใหญ่ 
                        มีเพียง 1 ร้านที่อยู่ใกล้กว่า 2 กม.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">โอกาสในการขยายตลาด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">โรงงานกระดาษในรัศมี 10 กม.:</span>
                      <span className="font-semibold">
                        {locations.filter(loc => loc.type === 'paper-factory' && loc.distanceFromNew <= 10).length} แห่ง
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">โรงงานพลาสติกในรัศมี 10 กม.:</span>
                      <span className="font-semibold">
                        {locations.filter(loc => loc.type === 'plastic-factory' && loc.distanceFromNew <= 10).length} แห่ง
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ศักยภาพลูกค้ารายใหญ่:</span>
                      <span className="font-semibold text-green-600">สูง</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>ข้อสรุป:</strong> มีโรงงานรีไซเคิลขนาดใหญ่หลายแห่งในรัศมีที่เหมาะสม 
                        เป็นโอกาสในการสร้างความสัมพันธ์ธุรกิจ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Location List */}
            <Card>
              <CardHeader>
                <CardTitle>รายการสถานประกอบการ ({filteredLocations.length} แห่ง)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left p-2">ชื่อสถานที่</th>
                        <th className="text-left p-2">ประเภท</th>
                        <th className="text-left p-2">พิกัด</th>
                        <th className="text-center p-2">จากลานใหม่</th>
                        <th className="text-center p-2">จากโรงงานสุรา</th>
                        <th className="text-left p-2">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.map((location) => {
                        const config = typeConfig[location.type]
                        const Icon = config.icon
                        return (
                          <tr 
                            key={location.id}
                            className="border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedLocation(location)}
                          >
                            <td className="p-2 font-medium">{location.name}</td>
                            <td className="p-2">
                              <Badge variant="secondary" className="text-xs">
                                <Icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                            </td>
                            <td className="p-2 font-mono text-xs">
                              {location.coordinates[0].toFixed(6)}, {location.coordinates[1].toFixed(6)}
                            </td>
                            <td className="p-2 text-center">{location.distanceFromNew} กม.</td>
                            <td className="p-2 text-center">{location.distanceFromOld} กม.</td>
                            <td className="p-2 text-xs text-gray-600 max-w-xs">
                              {location.notes}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}