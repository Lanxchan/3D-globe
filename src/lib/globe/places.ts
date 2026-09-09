export type Place = {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  lat: number;
  lng: number;
  summary: string;
};

export const PLACES: Place[] = [
  {
    id: "tokyo",
    name: "东京",
    nameEn: "Tokyo",
    region: "日本",
    lat: 35.6762,
    lng: 139.6503,
    summary: "霓虹与神社并存的不夜之城，东亚最密的都市星群。",
  },
  {
    id: "kyoto",
    name: "京都",
    nameEn: "Kyoto",
    region: "日本",
    lat: 35.0116,
    lng: 135.7681,
    summary: "千年古都。庭园、木构与四季交替的静谧仪式。",
  },
  {
    id: "shanghai",
    name: "上海",
    nameEn: "Shanghai",
    region: "中国",
    lat: 31.2304,
    lng: 121.4737,
    summary: "江海交汇处的现代天际线，外滩灯火沿黄浦铺开。",
  },
  {
    id: "singapore",
    name: "新加坡",
    nameEn: "Singapore",
    region: "东南亚",
    lat: 1.3521,
    lng: 103.8198,
    summary: "赤道上的花园城市，港口、雨林与未来建筑叠合。",
  },
  {
    id: "sydney",
    name: "悉尼",
    nameEn: "Sydney",
    region: "澳大利亚",
    lat: -33.8688,
    lng: 151.2093,
    summary: "港湾与砂岩海岸，南半球最开阔的城市之一。",
  },
  {
    id: "cairo",
    name: "开罗",
    nameEn: "Cairo",
    region: "埃及",
    lat: 30.0444,
    lng: 31.2357,
    summary: "尼罗河畔的层积之城，金字塔在西岸沙漠上沉默。",
  },
  {
    id: "santorini",
    name: "圣托里尼",
    nameEn: "Santorini",
    region: "希腊",
    lat: 36.3932,
    lng: 25.4615,
    summary: "火山口上的白屋与蓝顶，爱琴海最清晰的光线。",
  },
  {
    id: "paris",
    name: "巴黎",
    nameEn: "Paris",
    region: "法国",
    lat: 48.8566,
    lng: 2.3522,
    summary: "塞纳河划开的石质都会，灯火沿林荫大道铺开。",
  },
  {
    id: "london",
    name: "伦敦",
    nameEn: "London",
    region: "英国",
    lat: 51.5074,
    lng: -0.1278,
    summary: "泰晤士河上的多层城市，砖、雾与金融塔楼。",
  },
  {
    id: "reykjavik",
    name: "雷克雅未克",
    nameEn: "Reykjavík",
    region: "冰岛",
    lat: 64.1466,
    lng: -21.9426,
    summary: "北极圈边缘的小都，地热、黑沙滩与极光的入口。",
  },
  {
    id: "newyork",
    name: "纽约",
    nameEn: "New York",
    region: "美国",
    lat: 40.7128,
    lng: -74.006,
    summary: "网格上的垂直之城，港口把世界收进一座岛。",
  },
  {
    id: "machu",
    name: "马丘比丘",
    nameEn: "Machu Picchu",
    region: "秘鲁",
    lat: -13.1631,
    lng: -72.545,
    summary: "安第斯云雾中的石城，被山脊与梯田托住。",
  },
  {
    id: "rio",
    name: "里约热内卢",
    nameEn: "Rio de Janeiro",
    region: "巴西",
    lat: -22.9068,
    lng: -43.1729,
    summary: "山海之间的城市，花岗岩巨石俯瞰大西洋湾。",
  },
  {
    id: "capetown",
    name: "开普敦",
    nameEn: "Cape Town",
    region: "南非",
    lat: -33.9249,
    lng: 18.4241,
    summary: "桌山脚下的港口，两片大洋在此相遇。",
  },
];

export function getPlace(id: string | null): Place | null {
  if (!id) return null;
  return PLACES.find((place) => place.id === id) ?? null;
}
