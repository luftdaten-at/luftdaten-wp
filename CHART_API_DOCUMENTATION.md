# Chart API Documentation

This document describes the JSON data structure expected for different chart types in the Luftdaten WordPress theme. Charts can be configured with external API URLs to fetch data dynamically.

## Table of Contents

- [General Structure](#general-structure)
- [Chart Types](#chart-types)
  - [Scatter Plot (Ozon folgt der Hitze)](#scatter-plot-ozon-folgt-der-hitze)
  - [Bar Chart](#bar-chart)
  - [Line Chart (Time Series)](#line-chart-time-series)
  - [Co-Benefits Chart](#co-benefits-chart)
- [Error Handling](#error-handling)
- [Examples](#examples)

## General Structure

All chart JSON responses should follow a consistent structure with metadata and data arrays:

```json
{
  "metadata": {
    "title": "Chart Title",
    "description": "Chart description",
    "source": "Data source information",
    "lastUpdated": "2025-01-04T12:00:00Z",
    "units": {
      "x": "Unit for X axis",
      "y": "Unit for Y axis"
    }
  },
  "data": []
}
```

## Chart Types

### Scatter Plot (Ozon folgt der Hitze)

**Chart ID:** `m2Scatter`

**Description:** Shows the relationship between temperature (Tmax) and ozone levels (O₃ max) with an automatically calculated regression line.

**Chart ID:** `m2Scatter`

**Description:** Shows the relationship between temperature (Tmax) and ozone levels (O₃ max).

**JSON Structure:**

```json
{
  "metadata": {
    "title": "Ozon folgt der Hitze",
    "xLabel": "Tmax (°C)",
    "yLabel": "O₃ max (µg/m³)",
    "source": "Ozon (UBA/EEA) + Temperatur (GeoSphere)",
    "subtitle": "Sommer: Tmax vs. O₃ Tagesmaximum (Mock) + Trendlinie"
  },
  "data": [
    {
      "tmax": 25.5,
      "o3": 120
    },
    {
      "tmax": 28.3,
      "o3": 145
    },
    {
      "tmax": 30.1,
      "o3": 165
    }
  ]
}
```

**Data Fields:**
- `tmax` (number, required): Temperature maximum in °C
- `o3` (number, required): Ozone maximum in µg/m³

**Note:** The chart automatically calculates and displays a regression/trend line based on the data points.

### Bar Chart

**Chart IDs:** `m4Bars`, `pm10Chart`, `o3Chart`

**Description:** Displays categorical data as bars, typically showing values over time or categories.

**JSON Structure:**

```json
{
  "metadata": {
    "title": "Chart Title",
    "xLabel": "Jahr",
    "yLabel": "Value (Unit)",
    "source": "Data source",
    "subtitle": "Chart subtitle",
    "refLine": 35,
    "refLabel": "Reference line label (optional)"
  },
  "data": [
    {
      "year": 2020,
      "value": 45
    },
    {
      "year": 2021,
      "value": 52
    },
    {
      "year": 2022,
      "value": 48
    }
  ]
}
```

**Data Fields:**
- `year` (number, required): Year value (used for X-axis)
- `value` (number, required): Numerical value for the bar (Y-axis)

**Metadata Fields:**
- `refLine` (number, optional): Reference line value to display on the chart
- `refLabel` (string, optional): Label for the reference line

### Line Chart (Time Series)

**Chart IDs:** `pm25Chart`, `no2Chart`, `m3TropicalNights`, `m3UhiDelta`

**Description:** Shows trends over time as a continuous line. Can display single or multiple series for comparison.

**Description:** Shows trends over time as a continuous line.

**JSON Structure (Single Series):**

```json
{
  "metadata": {
    "title": "PM₂.₅ Jahresmittel (Trend)",
    "xLabel": "Jahr",
    "yLabel": "µg/m³",
    "source": "UBA/EEA",
    "subtitle": "Jahresmittel (Mock)",
    "refLine": 10,
    "refLabel": "EU 2030: 10 µg/m³ (Kontext)"
  },
  "data": [
    {
      "name": "PM₂.₅",
      "values": [
        {
          "year": 2020,
          "value": 12.5
        },
        {
          "year": 2021,
          "value": 11.8
        },
        {
          "year": 2022,
          "value": 11.2
        }
      ]
    }
  ]
}
```

**JSON Structure (Multiple Series):**

```json
{
  "metadata": {
    "title": "NO₂ — Verkehr vs. Hintergrund",
    "xLabel": "Jahr",
    "yLabel": "µg/m³",
    "source": "UBA/EEA",
    "subtitle": "Jahresmittel (Mock)",
    "refLine": 20,
    "refLabel": "EU 2030: 20 µg/m³ (Kontext)"
  },
  "data": [
    {
      "name": "Verkehr",
      "values": [
        {
          "year": 2020,
          "value": 35.2
        },
        {
          "year": 2021,
          "value": 33.8
        },
        {
          "year": 2022,
          "value": 32.1
        }
      ]
    },
    {
      "name": "Hintergrund",
      "values": [
        {
          "year": 2020,
          "value": 18.5
        },
        {
          "year": 2021,
          "value": 17.9
        },
        {
          "year": 2022,
          "value": 17.2
        }
      ]
    }
  ]
}
```

**Data Fields:**
- `name` (string, required): Series name/identifier
- `values` (array, required): Array of data points
  - `year` (number, required): Year value
  - `value` (number, required): Numerical value at this year

**Metadata Fields:**
- `refLine` (number, optional): Reference line value to display
- `refLabel` (string, optional): Label for the reference line

### Co-Benefits Chart

**Chart ID:** `m5Cobenefits`

**Description:** Displays a heat map/matrix showing the co-benefits of adaptation measures for both heat reduction and air quality improvement.

**JSON Structure:**

```json
{
  "metadata": {
    "title": "Klimawandelanpassung mit Co-Benefits für Luft & Hitze",
    "source": "Anpassungsstrategie / Hitzeschutz & Fachliteratur",
    "subtitle": "Qualitative Einordnung (Mock) – als evidenzbasierte Matrix versionieren."
  },
  "data": [
    {
      "action": "Grün-/Blau-Infrastruktur",
      "heat": 2,
      "air": 1
    },
    {
      "action": "Entsiegelung & helle Oberflächen",
      "heat": 2,
      "air": 1
    },
    {
      "action": "Hitzeschutz in Gebäuden (passiv)",
      "heat": 2,
      "air": 1
    },
    {
      "action": "Verkehrsreduktion / aktive Mobilität",
      "heat": 1,
      "air": 2
    },
    {
      "action": "ÖV/Flottenumstellung",
      "heat": 1,
      "air": 2
    }
  ]
}
```

**Data Fields:**
- `action` (string, required): Name of the adaptation measure
- `heat` (number, required): Score for heat reduction effectiveness (0 = niedrig, 1 = mittel, 2 = hoch)
- `air` (number, required): Score for air quality improvement (0 = niedrig, 1 = mittel, 2 = hoch)

**Score Values:**
- `0`: niedrig (low) - displayed in red
- `1`: mittel (medium) - displayed in yellow/amber
- `2`: hoch (high) - displayed in green

## Error Handling

APIs should return appropriate HTTP status codes and error responses:

**Success Response:**
- Status Code: `200 OK`
- Content-Type: `application/json`
- Body: Valid JSON structure as described above

**Error Response:**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

**Common Error Codes:**
- `400`: Bad Request - Invalid parameters
- `404`: Not Found - Data not available
- `500`: Internal Server Error - Server-side error
- `503`: Service Unavailable - Temporary service issue

## Examples

### Complete Scatter Plot Example

```json
{
  "metadata": {
    "title": "Modul 2 — Ozon folgt der Hitze",
    "xLabel": "Tmax (°C)",
    "yLabel": "O₃ max (µg/m³)",
    "source": "Ozon (UBA/EEA) + Temperatur (GeoSphere)",
    "lastUpdated": "2025-01-04T12:00:00Z",
    "scale": "x: Tmax (°C) · y: O₃ max (µg/m³)"
  },
  "data": [
    {
      "x": 22.1,
      "y": 95,
      "date": "2024-06-01",
      "label": "2024-06-01"
    },
    {
      "x": 24.5,
      "y": 110,
      "date": "2024-06-02",
      "label": "2024-06-02"
    },
    {
      "x": 26.8,
      "y": 130,
      "date": "2024-06-03",
      "label": "2024-06-03"
    },
    {
      "x": 29.2,
      "y": 155,
      "date": "2024-06-04",
      "label": "2024-06-04"
    },
    {
      "x": 31.5,
      "y": 180,
      "date": "2024-06-05",
      "label": "2024-06-05"
    }
  ]
}
```

### Complete Bar Chart Example (Doppelbelastung)

```json
{
  "metadata": {
    "title": "Modul 4 — Doppelbelastung: Hitze + hohe Luftbelastung",
    "xLabel": "Jahr",
    "yLabel": "Tage/Jahr",
    "source": "GeoSphere (Tmax) + UBA/EEA (O₃)",
    "subtitle": "Tage/Jahr: heiß & O₃ hoch (Mock)"
  },
  "data": [
    {
      "year": 2020,
      "value": 12
    },
    {
      "year": 2021,
      "value": 18
    },
    {
      "year": 2022,
      "value": 15
    },
    {
      "year": 2023,
      "value": 22
    },
    {
      "year": 2024,
      "value": 19
    }
  ]
}
```

### Complete Time Series Example (PM₂.₅)

```json
{
  "metadata": {
    "title": "PM₂.₅ — Jahresmittel (Trend)",
    "xLabel": "Jahr",
    "yLabel": "µg/m³",
    "source": "UBA/EEA",
    "subtitle": "Jahresmittel (Mock)",
    "refLine": 10,
    "refLabel": "EU 2030: 10 µg/m³ (Kontext)"
  },
  "data": [
    {
      "name": "PM₂.₅",
      "values": [
        {
          "year": 2015,
          "value": 15.2
        },
        {
          "year": 2016,
          "value": 14.8
        },
        {
          "year": 2017,
          "value": 14.1
        },
        {
          "year": 2018,
          "value": 13.5
        },
        {
          "year": 2019,
          "value": 12.9
        },
        {
          "year": 2020,
          "value": 12.5
        },
        {
          "year": 2021,
          "value": 11.8
        },
        {
          "year": 2022,
          "value": 11.2
        },
        {
          "year": 2023,
          "value": 10.8
        },
        {
          "year": 2024,
          "value": 10.5
        }
      ]
    }
  ]
}
```

### Complete Multi-Series Time Series Example (NO₂)

```json
{
  "metadata": {
    "title": "NO₂ — Verkehr vs. Hintergrund (Trend)",
    "xLabel": "Jahr",
    "yLabel": "µg/m³",
    "source": "UBA/EEA",
    "subtitle": "Jahresmittel (Mock)",
    "refLine": 20,
    "refLabel": "EU 2030: 20 µg/m³ (Kontext)"
  },
  "data": [
    {
      "name": "Verkehr",
      "values": [
        {
          "year": 2020,
          "value": 35.2
        },
        {
          "year": 2021,
          "value": 33.8
        },
        {
          "year": 2022,
          "value": 32.1
        },
        {
          "year": 2023,
          "value": 30.5
        },
        {
          "year": 2024,
          "value": 29.2
        }
      ]
    },
    {
      "name": "Hintergrund",
      "values": [
        {
          "year": 2020,
          "value": 18.5
        },
        {
          "year": 2021,
          "value": 17.9
        },
        {
          "year": 2022,
          "value": 17.2
        },
        {
          "year": 2023,
          "value": 16.8
        },
        {
          "year": 2024,
          "value": 16.3
        }
      ]
    }
  ]
}
```

## Implementation Notes

### Using the API URL in Blocks

When configuring a block with an API URL:

1. Enter the full API endpoint URL in the "Data API URL" field in block settings
2. The URL will be added as a `data-api-url` attribute on the chart container
3. JavaScript can fetch the data using:

```javascript
const chartElement = document.getElementById('chartId');
const apiUrl = chartElement.getAttribute('data-api-url');

if (apiUrl) {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Process data and render chart
            renderChart(data);
        })
        .catch(error => {
            console.error('Error fetching chart data:', error);
            // Handle error (e.g., show error message)
        });
}
```

### CORS Considerations

If the API is on a different domain, ensure CORS headers are properly configured:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

### Data Formatting

- Dates should be in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`
- Numbers should be valid JSON numbers (integers or decimals)
- Strings should be UTF-8 encoded
- Empty or null values should be omitted or set to `null` (not empty strings)

### Performance Considerations

- APIs should implement caching headers (`Cache-Control`, `ETag`)
- Consider pagination for large datasets
- Use compression (gzip) for responses
- Implement rate limiting if necessary

## Chart ID Reference

| Chart ID | Chart Type | Description |
|----------|-----------|-------------|
| `m2Scatter` | Scatter Plot | Ozon folgt der Hitze (temperature vs. ozone) |
| `m3TropicalNights` | Line Chart (Multi-series) | Tropennächte (Stadt vs. Umland) |
| `m3UhiDelta` | Line Chart (Single series) | UHI-Indikator (Stadt–Umland Differenz) |
| `m4Bars` | Bar Chart | Doppelbelastung (Hitze + O₃ Tage/Jahr) |
| `m5Cobenefits` | Co-Benefits Matrix | Klimawandelanpassung Co-Benefits |
| `pm25Chart` | Line Chart (Single series) | PM₂.₅ Jahresmittel (Trend) |
| `no2Chart` | Line Chart (Multi-series) | NO₂ Verkehr vs. Hintergrund |
| `o3Chart` | Bar Chart | O₃ Episoden-Tage pro Jahr |
| `pm10Chart` | Bar Chart | PM₁₀ Tage mit erhöhten Tagesmitteln |

## Version History

- **v1.0.0** (2025-01-04): Initial documentation

