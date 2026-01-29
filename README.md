# Planium

Planium is an application for fan of astrology and photos of planes in front of the moon.

## Stacks
- [Vue.js](https://vuejs.org/)
- [vue-cesium](https://zouyaoji.top/vue-cesium/#/en-US)
- [Cesium](https://cesium.com/cesiumjs/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [DaisyUi](https://daisyui.com/)


## Requirements
- Node.js 20.19.0+
- Python 3.10+

## Prerequisites
- [A Cesium ion account](https://ion.cesium.com) (To Downloads and load assets)
- [A Opensky account](https://opensky-network.org) (To get more credits for the API, follow this [tutorial](https://openskynetwork.github.io/opensky-api/rest.html#oauth2-client-credentials-flow))
- [A Astronomy account](https://astronomyapi.com) (To get the moon phase)
- [A Google app linked to an email](https://myaccount.google.com/apppasswords) (To send emails)

## Upload non-ion assets
1. Download the following assets and upload them to your ion account:
   - [Plane](https://cesium.cdn.prismic.io/cesium/Zv2eybVsGrYSwUFj_Cesium_Air.glb)
2. Go to [your account dashboard](https://ion.cesium.com/assets/?). Drag and drop the model file on this page.
3. Select **3D Model (Convert to glTF)**, then click **Upload**.
4. After it’s done processing, find the **asset ID** by selecting the new asset back in your dashboard and looking under the preview window on the right.

## Project Setup

```sh
npm run install-all
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
