// lib/services/integration.service.ts
import { getSiteInfo }      from '@/lib/firestore/site-info.firestore'
import { getBNBCSettings }  from '@/lib/firestore/bnbc.firestore'
import { getBuildingInfo }  from '@/lib/firestore/building.firestore'
import { getProject }       from '@/lib/firestore'
import { toSqm }            from '@/lib/types/site-info.types'
import {
  HubExportPayload,
  SiteInfoExport,
  BNBCExport,
  BuildingExport,
} from '@/lib/types/integration.types'

// ─── Build full export payload ────────────────────────────────────────────────
export async function buildExportPayload(
  projectId: string
): Promise<HubExportPayload | null> {
  try {
    const [project, siteInfo, bnbc, building] = await Promise.all([
      getProject(projectId),
      getSiteInfo(projectId),
      getBNBCSettings(projectId),
      getBuildingInfo(projectId),
    ])

    if (!project) return null

    const payload: HubExportPayload = {
      version:     '1.0',
      exportedAt:  new Date().toISOString(),
      projectId,
      projectCode: project.projectCode,
      projectName: project.projectName,
    }

    // Site Info
    if (siteInfo) {
      const siteExport: SiteInfoExport = {
        address:          siteInfo.address,
        district:         siteInfo.district,
        upazila:          siteInfo.upazila,
        latitude:         siteInfo.latitude,
        longitude:        siteInfo.longitude,
        plotArea:         siteInfo.plotArea,
        plotAreaUnit:     siteInfo.plotAreaUnit,
        plotAreaSqm:      siteInfo.plotArea
                            ? toSqm(siteInfo.plotArea, siteInfo.plotAreaUnit)
                            : undefined,
        roadWidth:        siteInfo.roadWidth,
        soilType:         siteInfo.soilType,
        groundLevel:      siteInfo.groundLevel,
        floodLevel:       siteInfo.floodLevel,
        groundwaterDepth: siteInfo.groundwaterDepth,
      }
      payload.siteInfo = siteExport
    }

    // BNBC Settings
    if (bnbc) {
      const bnbcExport: BNBCExport = {
        occupancyType:       bnbc.occupancyType,
        riskCategory:        bnbc.riskCategory,
        seismicZone:         bnbc.seismicZone,
        seismicZoneCoeff:    bnbc.seismicZoneCoeff,
        importanceFactor:    bnbc.importanceFactor,
        windZone:            bnbc.windZone,
        basicWindSpeed:      bnbc.basicWindSpeed,
        liveLoadType:        bnbc.liveLoadType,
        liveLoadValue:       bnbc.liveLoadValue,
        soilType:            bnbc.soilType,
        spectralAcceleration:bnbc.spectralAcceleration,
        responseModFactor:   bnbc.responseModFactor,
        structuralSystem:    bnbc.structuralSystem,
        seismicCs:           parseFloat(
          ((bnbc.spectralAcceleration * bnbc.importanceFactor) / bnbc.responseModFactor).toFixed(4)
        ),
      }
      payload.bnbcSettings = bnbcExport
    }

    // Building Info
    if (building) {
      const buildingExport: BuildingExport = {
        buildingType:      building.buildingType,
        usageType:         building.usageType,
        structureSystem:   building.structureSystem,
        numFloors:         building.numFloors,
        basementCount:     building.basementCount,
        floorHeight:       building.floorHeight,
        groundFloorHeight: building.groundFloorHeight,
        totalHeight:       building.totalHeight,
        roofType:          building.roofType,
        buildingLength:    building.buildingLength,
        buildingWidth:     building.buildingWidth,
        totalFloorArea:    building.totalFloorArea,
        hasLift:           building.hasLift,
        hasGenerator:      building.hasGenerator,
        hasWaterTank:      building.hasWaterTank,
        hasParkingFloor:   building.hasParkingFloor,
      }
      payload.buildingInfo = buildingExport
    }

    return payload
  } catch (e) {
    console.error('Export failed:', e)
    return null
  }
}

// ─── Download as JSON file ────────────────────────────────────────────────────
export function downloadJSON(payload: HubExportPayload, filename: string) {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
export async function copyToClipboard(payload: HubExportPayload): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    return true
  } catch {
    return false
  }
}

// ─── Check what data is missing ───────────────────────────────────────────────
export function checkDataCompleteness(payload: HubExportPayload) {
  return {
    hasSiteInfo:  !!payload.siteInfo,
    hasBNBC:      !!payload.bnbcSettings,
    hasBuilding:  !!payload.buildingInfo,
    isComplete:   !!(payload.siteInfo && payload.bnbcSettings && payload.buildingInfo),
  }
}
