import urllib.request
import math
import os

coords = {
    "Kanchipuram": (12.9565, 80.1550),
    "Madurai": (10.0270, 78.3300),
    "Salem": (11.7126, 78.1420),
    "Ariyalur": (11.1620, 79.0305),
    "Tirunelveli": (8.7850, 77.7290),
    "Coimbatore": (10.8990, 76.9580),
    "Tiruchirappalli": (10.9700, 78.9300),
    "Dindigul": (10.3550, 77.9650),
    "Karur": (10.9840, 77.8870),
    "Villupuram": (11.9540, 79.5220),
    "Vellore": (12.9000, 79.1200),
    "Namakkal": (11.2330, 78.1650),
    "Krishnagiri": (12.6340, 78.0120),
    "Erode": (11.3320, 77.6200),
    "Cuddalore": (11.5583, 79.4883),
    "Thanjavur": (10.8710, 79.1410),
}

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

os.makedirs("tiles", exist_ok=True)
zoom = 15

for name, (lat, lng) in coords.items():
    x, y = deg2num(lat, lng, zoom)
    url = f"https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
    # Just download it
    try:
        urllib.request.urlretrieve(url, f"tiles/{name}.jpg")
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
