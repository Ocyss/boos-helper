import { useConfFormData } from '@/hooks/useConfForm'
import { request } from '@/utils/request'

export interface AmapError {
  status: string
  info: string
  infocode: string
}

export interface AmapGeocode {
  status: string
  info: string
  infocode: string
  count: string
  geocodes: Array<{
    formatted_address: string
    country: string
    province: string
    citycode: string
    city: string
    district: string
    township: Array<any>
    neighborhood: {
      name: Array<any>
      type: Array<any>
    }
    building: {
      name: Array<any>
      type: Array<any>
    }
    adcode: string
    street: Array<any>
    number: Array<any>
    location: string
    level: string
  }>
}
export interface AmapDistance {
  status: string
  info: string
  infocode: string
  count: string
  results: Array<{
    origin_id: string
    dest_id: string
    distance: string
    duration: string
  }>
}

export async function amapGeocode(address: string): Promise<AmapGeocode['geocodes'][number] | undefined> {
  const { formData } = useConfFormData()
  const res = await request.get({
    url: `https://restapi.amap.com/v3/geocode/geo?address=${address}&output=JSON&Key=${formData.amap.key}`,
  }) as AmapGeocode | AmapError
  if (res.status !== '1' || !('geocodes' in res)) {
    throw new Error(res.info)
  }
  return res.geocodes?.[0]
}

export async function amapDistance(destination: string) {
  const { formData } = useConfFormData()
  const res0 = await request.get({
    url: `https://restapi.amap.com/v3/distance?origins=${formData.amap.origins}&destination=${destination}&type=0&output=JSON&Key=${formData.amap.key}`,
  }) as AmapDistance | AmapError
  const res1 = await request.get({
    url: `https://restapi.amap.com/v3/distance?origins=${formData.amap.origins}&destination=${destination}&type=1&output=JSON&Key=${formData.amap.key}`,
  }) as AmapDistance | AmapError
  const res3 = await request.get({
    url: `https://restapi.amap.com/v3/distance?origins=${formData.amap.origins}&destination=${destination}&type=3&output=JSON&Key=${formData.amap.key}`,
  }) as AmapDistance | AmapError

  const data = { straight: { ok: false, distance: 0, duration: 0 }, driving: { ok: false, distance: 0, duration: 0 }, walking: { ok: false, distance: 0, duration: 0 } }

  if (res0.status === '1' && 'results' in res0) {
    data.straight.ok = true
    data.straight.distance = Number(res0.results?.[0]?.distance)
    data.straight.duration = Number(res0.results?.[0]?.duration)
  }
  if (res1.status === '1' && 'results' in res1) {
    data.driving.ok = true
    data.driving.distance = Number(res1.results?.[0]?.distance)
    data.driving.duration = Number(res1.results?.[0]?.duration)
  }
  if (res3.status === '1' && 'results' in res3) {
    data.walking.ok = true
    data.walking.distance = Number(res3.results?.[0]?.distance)
    data.walking.duration = Number(res3.results?.[0]?.duration)
  }
  return data
}
