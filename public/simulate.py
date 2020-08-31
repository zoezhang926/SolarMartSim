import sys, json
import pvlib
import pandas as pd
from pvlib.pvsystem import LocalizedPVSystem
import warnings
warnings.filterwarnings("ignore")

# tmp = """
#         {"roofTilt":0,"roofAzimuth":0,"unitOfModel":6,"pvModule":"Silevo_Triex_U300_Black__2014_","installCost":1000,"unitElectricityCost":0.5}
#       """
data = json.loads(sys.argv[1].encode("utf-8"))

data["roofTilt"] = float(data["roofTilt"])
data["roofAzimuth"] = float(data["roofAzimuth"])
data["unitOfModel"] = int(data["unitOfModel"])
data["installCost"] = float(data["installCost"])
data["unitElectricityCost"] = float(data["unitElectricityCost"])
data["pvModule"] = str(data["pvModule"])

latitude, longitude, name, altitude, timezone, temp_air, wind_speed = 25.761681, -80.191788, 'Miami', 7.9248, 'Etc/GMT-4', 20, 0
naive_times = pd.DatetimeIndex(start='2015', end='2016', freq='1h')

sandia_modules = pvlib.pvsystem.retrieve_sam('SandiaMod')
sapm_inverters = pvlib.pvsystem.retrieve_sam('cecinverter')
module = sandia_modules[data['pvModule']]
inverter = sapm_inverters['ABB__MICRO_0_25_I_OUTD_US_208_208V__CEC_2014_']
localized_system = LocalizedPVSystem(module_parameters=module,
                                  inverter_parameters=inverter,
                                  surface_tilt=data['roofTilt'],
                                  surface_azimuth=data['roofAzimuth'],
                                  latitude=latitude,
                                  longitude=longitude,
                                  name=name,
                                  altitude=altitude,
                                  tz=timezone)
times = naive_times.tz_localize(timezone)
clearsky = localized_system.get_clearsky(times)
solar_position = localized_system.get_solarposition(times)
total_irrad = localized_system.get_irradiance(solar_position['apparent_zenith'],
                                           solar_position['azimuth'],
                                           clearsky['dni'],
                                           clearsky['ghi'],
                                           clearsky['dhi'])
temps = localized_system.sapm_celltemp(total_irrad['poa_global'],
                                    wind_speed, temp_air)
aoi = localized_system.get_aoi(solar_position['apparent_zenith'],
                            solar_position['azimuth'])
airmass = localized_system.get_airmass(solar_position=solar_position)
effective_irradiance = localized_system.sapm_effective_irradiance(
 total_irrad['poa_direct'], total_irrad['poa_diffuse'],
 airmass['airmass_absolute'], aoi)
dc = localized_system.sapm(effective_irradiance, temps['temp_cell'])
ac = localized_system.snlinverter(dc['v_mp'], dc['p_mp'])

# energy output in W*hrs
annual_energy = ac.sum() * data['unitOfModel']

result = {}
# update finacial data
result['annualElec'] = int(annual_energy / 1000)
result['annualSave'] = int(result['annualElec'] * data['unitElectricityCost'])
result['totalInstallCost'] = int(data['installCost'] * data['unitOfModel'])
result['payback'] = int(result['totalInstallCost'] * 1.0 / result['annualSave'] * 12)

print json.dumps(result)
sys.stdout.flush()

